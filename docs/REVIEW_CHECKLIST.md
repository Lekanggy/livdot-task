# Review Checklist

Each phase's review gate from the development plan, mapped to where it is
demonstrated or verified.

## Phase 0–1 — Guardrails & Domain

- `lint`, `typecheck`, `test` run clean (`npm run lint` / `typecheck` / `test`).
- Folder structure matches the plan (see README "Project structure").
- Domain has no React imports — `src/domain/*` are pure modules, unit-tested in
  `src/__tests__/lifecycle.test.ts`, `requirements.test.ts`, `actions.test.ts`,
  `readiness.test.ts`.
- Every transition (allowed and blocked), pending/error combos, and
  auto-promote/demote rules have unit tests.

## Phase 2 — Service Layer

- Result-typed async API with configurable latency/failure:
  `services/mockEventApi.ts`, `latency.ts`, `timing.ts` +
  `__tests__/mockEventApi.test.ts`.
- Server-side guard re-validation on writes (the client cannot drift into an
  invalid state).

## Phase 3 — State

- Pure reducer with typed actions: `state/eventReducer.ts` +
  `eventReducer.test.ts`.
- Orchestration, auto-promote/demote notices, token-based flight guard:
  `state/EventProvider.tsx`, `state/useFlight.ts`.
- Single consumer facade: `state/useEvent.ts`.

## Phase 4 — Core Display

- Loading skeleton / error dashboard with Retry: `DashboardPage.tsx`
  (`dashboard.test.tsx`).

## Phase 5 — Readiness, Actions, Feedback

- Requirement rows: icon **and** text per state (never color alone):
  `readinessUi.test.tsx`.
- Progress summary "N of M requirements satisfied".
- Every disabled action shows `Why blocked: …` inline and via
  `aria-describedby` (`readinessUi.test.tsx` loops every disabled button).
- Auto-promote / auto-demote with visible notices, no reload
  (`readinessUi.test.tsx` "auto-promote / demote without reload").
- Live stream-failure banner (`StreamFailureBanner`, mounted when live + flag).

## Phase 6 — Simulation & Edge Cases

All in `src/__tests__/simulation.test.tsx`:

- All six lifecycle states reachable via UI alone (scenario badges +
  full walkthrough Draft → … → Replay Available, gated on the simulated
  "replay processed" control).
- Double-click runs one transition (flight guard + idempotent same-status
  writes).
- One-shot "make next call fail": error notice, state consistent, retry works.
- Scenario switch mid-request: stale response dropped, no flicker back.

## Phase 7 — Docs

- Fresh clone → `npm install` → `npm run dev` reproduces everything
  (no env vars, no services).
- `build` passes (`Route (app) /`).
- No file over 160 lines (largest: `src/__tests__/simulation.test.tsx` = 160).
