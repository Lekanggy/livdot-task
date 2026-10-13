# Implementation Notes

## Component structure

```
components/
  dashboard/    DashboardPage (composition + load/error gate),
                EventHeader, EventDetails, LifecycleStepper,
                ReadinessPanel + RequirementRow (registry-driven rows),
                ActionBar (enabled actions + BlockedReason),
                StreamFailureBanner
  simulation/   SimulationPanel (scenario selector, requirement toggles,
                fail-next, stream failure, replay processing)
  ui/           Button (aria-busy/disabled), Alert, Spinner
```

Rendering rules the components follow:

- **No business logic in components.** They read derived values from `useEvent`
  and dispatch commands; every rule lives in `domain/` or the service.
- **Registry-driven.** Requirement rows and their labels come from the
  requirements registry; actions and their targets from `actions.ts`. Adding a
  requirement or action is a domain-level change with zero UI edits.
- **A11y as behavior, not decoration.** Icon + wording for each requirement
  state (never color alone), `aria-describedby` links every disabled button to
  its reason, `aria-busy` marks in-flight actions.
- **File budget:** every file is ≤160 lines (largest: a test suite at 160).

## State-management choice

Plain `useReducer` + two contexts (state, dispatch) behind `EventProvider`,
with a `useEvent()` facade that combines state and derived selectors.
No Redux/Zustand/React-Query — justified because the whole client state is one
small, serializable object with six reducer cases; a library would add surface
without adding capability. The async orchestration lives in one orchestrator
component, so commands and load effects are testable through RTL without
mocking a store.

Edge-case handling lives at three deliberate layers:

1. **Service** — latency + one-shot failure simulation; writes re-validate
   guards server-side; write failures are decided *before* mutating
   (failed writes leave no trace); same-status transitions are idempotent.
2. **State layer** — token-based flight guard: stale responses (older token)
   are dropped on both success and failure paths; flights clear on every
   terminal action.
3. **UI** — button disabled + `aria-busy` while its action is in flight;
   "Working…" label; failures as dismissible alerts.

## Assumptions

- One operator, one event, no auth/permissions; persistence is the mock
  service's in-memory event.
- `Draft → Scheduled` requires a date; requirements are pre-registered
  (crew/ingest/pricing) per the brief.
- Replay processing is simulated by pressing a sim control before enabling.
- The sample "stream failure" is a flag on the event (banner), not a real
  transport break.

## Tradeoffs

- **Push-notifications vs snapshot refresh:** the service is snapshot-based;
  cross-control consistency (e.g. sim toggles immediately  is achieved by re-fetching after sim mutations. A real backend
  would use subscriptions; the swap point is `services/mockEventApi.ts`.
- **Idempotent same-status writes:** chosen so queued duplicate clicks can't
  produce a spurious failure; the cost is an extra request, mitigated by UI
  disabling (which makes duplicates unlikely in practice).
- **Auto-transition server-side:** keeps client/server from drifting on
  promotion, at the cost of one status comparison in the provider for notice
  wording.
- **jsdom tests over browser E2E:** fast and hermetic; visual layout is
  deliberately out of scope ("no visual polish required").

## What I'd do next

1. Persist mock-state to `localStorage` so scenario changes survive reloads.
2. Replace the snapshot re-fetch after sim mutations with server-push
   (SSE/WebSocket) in the service interface.
3. Add a "simulate incoming requirement update" control (server-originated
   changes) to exercise the same stale-token flow from the other side.
4. Accessibility audit against a real screen reader; the primitives already
   expose the right attributes but have not been audited manually.
5. Give `pending` requirements a background "verification" task in the service
   (`retry-pending` endpoint) to demonstrate the pending → satisfied transition
   end-to-end.
