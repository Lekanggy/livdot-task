# Liv-dot — Event Operations Dashboard

A single-page dashboard for operating one live-streamed event through a strict,
guarded lifecycle:

**Draft → Scheduled → Ready for Streaming → Live → Completed → Replay Available**

All state comes from a mock, latency- and failure-simulating API service, so every
UI path — including blocked actions, stale responses, and failures — is
demonstrable without a backend.

## Setup

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # vitest (domain, state, service, and UI suites)
npm run lint     # eslint (next core-web-vitals + typescript)
npm run typecheck
npm run build
```

A fresh clone only needs `npm install && npm run dev` to reproduce everything in
this README — no environment variables, no database.

## Using the dashboard

The page renders one event with:

- **Header** — name, start date, ticket price, and the current status badge.
- **Lifecycle stepper** — complete / current / upcoming per status.
- **Details** — event details plus per-requirement status.
- **Readiness panel** — "N of M requirements satisfied" and one row per
  requirement from the registry, each marked **✓ Satisfied**, **✕ Missing**,
  **⏳ Pending**, or **⚠ Failed** (icon + wording, never color alone).
- **Actions** — Schedule, Go Live, End Event, Enable Replay. Every disabled
  action states exactly *why* inline (`Why blocked: …`) and links it to the
  button via `aria-describedby`.
- **Stream-failure banner** — shown while the event is live and a failure is
  flagged.
- **Notices** — status changes, auto-promotions/demotions, and failures appear
  in a dismissible alert.

Key live-update behaviors (no reload anywhere):

- When the last requirement of a Scheduled event is satisfied, the event
  **auto-promotes** to Ready for Streaming with a visible notice.
- Losing a requirement from Ready **auto-demotes** to Scheduled with a notice.
- A requirement whose state becomes `pending` keeps the event Scheduled — the
  blocked action explains the pending state specifically.

## Scenario guide (Simulation panel)

The Simulation section (bottom of the dashboard) drives the mock service:

| Control | Effect |
|---|---|
| **Scenario selector** | Jumps the service to any lifecycle state: Draft incomplete, Scheduled (crew missing / ingest pending), Ready for Streaming, Live, Completed. Switching mid-request is safe — stale responses are discarded. |
| **Requirement toggles (✓ / ✕)** | Set any requirement to satisfied/missing; watch promote/demote happen live. |
| **Make next call fail** | Arms a one-shot network failure for the next service call: the request fails, an error notice appears, and state stays consistent (a failed write leaves no server-side trace). The next attempt succeeds. |
| **Trigger stream failure** | (Live only) Sets the stream-failure flag; the amber banner appears. |
| **Replay finished processing** | (Completed, before replay is enabled) Simulates replay processing completing, which unlocks Enable Replay. |

Points a reviewer can verify quickly:

1. Pick **Scheduled, crew missing** → satisfy crew via the toggle → badge flips
   to Ready for Streaming *without a reload* and the auto-promotion notice shows.
2. Pick **Live** → *Trigger stream failure* → banner appears.
3. Arm *Make next call fail* → click Go Live on Ready → failure notice, state
   unchanged → click again → Live.
4. Fast-switch scenarios in the selector → no flicker back to a previous
   scenario's data.

## Project structure

```
src/
  domain/      Pure business rules: transition table, requirements registry,
               readiness computation, available actions, shared types/labels.
  services/    Mock API (Result-typed), latency/failure simulation, fixtures,
               timing helpers. Swappable for a real backend behind the same
               interface.
  state/       Reducer + contexts, action creators, token-based flight guard,
               EventProvider orchestration, useEvent facade hook.
  components/  display/ (dashboard panels), simulation/ panel, ui/ primitives
               (Button, Alert, Spinner).
  app/         Next.js App Router entry (page.tsx renders the dashboard).
  __tests__/   vitest suites: domain rules, reducer, service, and UI flows.
```

Layering rule: **components → state → services → domain**. Business logic lives
only in `domain/` and the service; components render and dispatch only.

## Documents

- [docs/STATE_MODEL.md](docs/STATE_MODEL.md) — state shape, transitions,
  edge-case surfaces.
- [docs/IMPLEMENTATION_NOTES.md](docs/IMPLEMENTATION_NOTES.md) — structure,
  assumptions, tradeoffs, next steps.
- [docs/REVIEW_CHECKLIST.md](docs/REVIEW_CHECKLIST.md) — each review gate and
  where it is demonstrated.
