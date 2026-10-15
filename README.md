# Liv-dot — Event Operations Dashboard

Liv-dot is a single-page dashboard prototype for operating one live-streamed
event. It helps an operator understand the event's lifecycle, check whether it
is ready to stream, see why an action is blocked, and move the event through
the allowed steps:

**Draft → Scheduled → Ready for Streaming → Live → Completed → Replay Available**

The app uses an in-memory mock API rather than a backend. The mock adds request
latency and supports simulated failures, so the main UI and error-handling
flows can be explored without environment variables, a database, or external
services.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app starts with a
draft event and its requirements are not all satisfied.

Other useful commands:

```bash
npm test         # Run the Vitest domain, state, service, and UI suites
npm run lint     # Run ESLint
npm run typecheck
npm run build
```

## What the dashboard shows

- **Event header:** event name, start time, ticket price, and current status.
- **Lifecycle stepper:** completed, current, and upcoming lifecycle stages.
- **Operational readiness:** satisfied requirement count, progress, and a
  status row for each requirement: crew assignment, ingest configuration, and
  ticket pricing. Requirement states include satisfied, missing, pending, and
  verification error.
- **Next step:** the primary lifecycle action when one applies. If it is
  blocked, the interface explains what needs attention. Other available
  actions are shown separately.
- **Event details and notices:** key event information, readiness warnings,
  status updates, and dismissible action or simulation notices.
- **Stream failure banner:** appears when a failure is simulated during a live
  event.

The lifecycle rules are guarded: for example, an event needs a schedule date
before it can be scheduled, all requirements must be satisfied before it is
ready, and replay processing must finish before replay can be enabled. When a
scheduled event's final requirement becomes satisfied, it automatically moves
to Ready for Streaming. If a requirement becomes unsatisfied while ready, it
returns to Scheduled.

## Developer tools (simulation)

Expand **Developer tools (simulation)** at the bottom of the page to exercise
the mock API and lifecycle:

| Control | Effect |
|---|---|
| **Scenario** | Loads one of six fixtures: Draft incomplete, Scheduled with crew missing, Scheduled with ingest pending, Ready for Streaming, Live, or Completed. |
| **Requirement controls** | Set crew, ingest, or pricing to Satisfied, Missing, Pending, or Error. Updates can promote or demote the event automatically. |
| **Fail next call** | Makes the next API call fail once. A failed write does not mutate the mock server's event; retrying makes a normal request. |
| **Stream failure (Live only)** | Turns the simulated stream-failure state on or off. |
| **Replay processed (Completed only)** | Simulates completed replay processing and makes Enable Replay available. |

Requests have simulated latency. If a newer request supersedes an older one,
the older response is ignored so it cannot replace newer event data.

### Quick walkthroughs

1. Select **Scheduled, crew missing**, then set **Crew assigned** to
   **Satisfied**. The event should automatically become Ready for Streaming.
2. Select **Live** and turn on **Stream failure (Live only)** to see the
   failure banner.
3. Select **Ready for Streaming**, turn on **Fail next call**, and choose
   **Go Live**. The action should fail with a notice and leave the event
   unchanged; try again to move it to Live.
4. Select **Completed**, enable **Replay processed**, then choose
   **Enable Replay**.

## Project structure

```text
src/
  app/          Next.js App Router entry point and global styles
  components/   Dashboard, simulation controls, and reusable UI components
  domain/       Lifecycle transitions, requirements, readiness, and action rules
  services/     In-memory mock API, fixtures, latency, and result types
  state/        React context, reducer, request coordination, and event hooks
  __tests__/    Domain, state, service, and UI tests
```

The main dependency direction is **components → state → services → domain**.
Business rules are defined in the domain layer and enforced by the service;
components render state and invoke commands through the state layer.

## Scope and limitations

This is a frontend prototype for a single event, not a production event
management system. The mock API is in-memory, so changes are not persisted
across a page reload and there is no authentication, multi-user synchronization,
or real streaming integration. The service boundary is intended to make
replacing the mock with a real API possible without moving lifecycle rules into
the UI.
