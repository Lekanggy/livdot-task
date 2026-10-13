# State Model

How state is structured, how transitions are handled, and how blocked/incomplete
states surface in the UI.

## 1. Stored state

The client store holds exactly what the service gives it plus client-only
bookkeeping (`src/state/eventState.ts`):

```ts
type State = {
  event: Event | null;          // server-provided event snapshot
  async: Async;                 // load orchestration
  actionFlight: string | null;  // action id currently in flight (or 'load'/'sim')
  notice: string | null;        // dismissible status/failure message
};
```

`Event` (from `src/domain/types.ts`) is the server's source of truth:

```ts
{
  id: string;
  status: EventStatus;                       // draft..replay
  details: { name; startsAt; ticketPrice };
  requirements: Requirement[];               // registry-ordered
  replayProcessed?: boolean;                 // gates Completed → Replay
  streamFailure?: boolean;                   // live-failure banner flag
}
```

Nothing else is stored. Readiness counts, available actions, and stepper states
are **derived**, never cached — see §4.

## 2. Async model

Loading is a discriminated union, not booleans:

```ts
type Async = { kind: 'idle' } | { kind: 'loading' } | { kind: 'error'; message: string };
```

- First page load: `loading` → spinner skeleton; `error` dashboard with Retry.
- A user-initiated refresh (scenario switch / retry while data is on screen)
  keeps the current event visible and shows an `Updating…` alert instead of
  unmounting the dashboard — so the simulation controls (and the scenario
  selector itself) remain reachable mid-flight.

## 3. Transitions (single source of truth)

`src/domain/lifecycle.ts` defines the ordered statuses and a transition table:

```ts
type Transition = { to: EventStatus; guard?: (e: Event) => Blocker | null };
const TRANSITIONS: Record<EventStatus, Transition[]> = { ... };
```

`canTransition(event, to)` returns `null` or a `Blocker { code, message }`.
The same table drives:

- the **ActionBar** (`getAvailableActions` → `{ enabled, reason }`),
- blocked reasons (`Why blocked: <exact guard message>`, linked via
  `aria-describedby`),
- service-side re-validation (the mock API rejects illegal writes with the same
  guards, so the client can never drift into an invalid state).

### Guard summary and assumptions

| Transition | Guard |
|---|---|
| Draft → Scheduled | schedule date must exist |
| Scheduled → Ready | all requirements satisfied (auto-promoted) |
| Ready → Live | manual host action, no re-check |
| Live → Completed | manual host action |
| Completed → Replay Available | replay processing complete (simulated) |
| Replay Available | terminal; no backward transitions after Live |

Auto-promotion/demotion (before Live only): the service applies the pending
auto-transition as part of the write (`setRequirement`), and the provider keeps
the two in sync by comparing statuses — the server is authoritative, the client
just annotates the change with a "auto-promoted / demoted" notice.

## 4. Derived state (never stored)

Pure selectors in `src/domain/`:

- `getReadiness(event)` → `{ satisfied, total, isReady, blockers[] }`
- `getAvailableActions(event)` → `[{ action, enabled, reason? }]`
- `stepStates(status)` → `'complete' | 'current' | 'upcoming'` per status

Because they derive from the stored event, the checklist and the buttons can
never disagree.

## 5. In-flight actions and stale responses

Every command (`transition`, `setRequirement`, scenario switch, reload, sim
controls) follows the same protocol in `src/state/EventProvider.tsx` +
`src/state/useFlight.ts`:

1. `begin(action)` bumps a token and dispatches `ACTION_START`
   (`actionFlight` shows *Working…* and disables the button — double-click is
   impossible through the UI; a same-status redundant write is an idempotent
   no-op server-side, so a queued duplicate can never corrupt state).
2. The awaited service call resolves/fails.
3. If the token is no longer current (`isStale(token)`), the response is
   **dropped** — a newer action (e.g. a scenario switch) already displaced it.
4. Otherwise: `STATUS_CHANGED`/`REQUIREMENT_UPDATED`/`LOAD_SUCCESS` on success,
   `ACTION_FAIL` (notice, flight cleared) on failure.

Failure consistency rule: the mock service decides a simulated failure
**before** mutating, so a failed write leaves no server-side trace and the UI
stays consistent by construction.

## 6. Blocked / incomplete surfaces

| Condition | Where it surfaces |
|---|---|
| Blocked action | Disabled button + inline `Why blocked: …` + `aria-describedby` |
| Requirement `missing`/`pending`/`error` | Readiness row icon + text; `pending` counts as *not satisfied* for gating |
| Load failure | Full-page error dashboard with Retry |
| Write failure | Dismissible error alert; previous state retained |
| Stream failure while Live | Amber warning banner |
| Scenario switch in flight | `Updating…` alert; no flicker to old data |
