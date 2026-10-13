# LIV DOT – Host Event Dashboard: UI Design Spec (for agent handoff)

**Goal:** restyle the existing dashboard into a clear operations console. **Do not change domain, service or reducer logic.** Only `components/**`, `app/globals.css`, and (optionally) one small selector in `useEvent.ts`. Keep every file ≤ 160 lines, DRY, Tailwind utilities only.

## 1. Problems in the current UI (fix these)

1. Stepper wraps as loose pills; progress is not readable at a glance.
2. Event name and status are repeated (header, stepper, details, badge).
3. Every unavailable action prints a long raw message ("Blocked upstream… — Missing"). It is noisy and cryptic.
4. Actions are flat: no sense of "what is the next step".
5. Readiness is plain text; no progress, no per-item guidance.
6. Simulation controls are unlabeled icon buttons (✓ ✕) and compete with real UI.
7. No visual hierarchy: all cards look identical, no spacing scale.

## 2. Layout

Max width `max-w-6xl mx-auto px-4 sm:px-6 py-6`. Single column on mobile, 2 columns from `lg`.

```
┌──────────────────────────────────────────────────────────────┐
│ EventHeader: title · date · [Status badge]                   │
│ (alert strip: stream failure / notices)                      │
├──────────────────────────────────────────────────────────────┤
│ LifecycleStepper (horizontal, 6 steps, connector line)       │
├───────────────────────────────┬──────────────────────────────┤
│ ReadinessPanel (lg:col-span-7)│ NextStepCard (lg:col-span-5) │
│  progress bar + 3 rows        │  primary action + blockers   │
│                               │ EventDetails (key/value)     │
├───────────────────────────────┴──────────────────────────────┤
│ SimulationPanel (collapsible "Developer tools", bottom)      │
└──────────────────────────────────────────────────────────────┘
```

Grid: `grid gap-6 lg:grid-cols-12`. Vertical rhythm: `space-y-6`.

## 3. Design tokens (`globals.css`)

Light and dark via CSS variables; map them in Tailwind with arbitrary values or `@theme`.

```css
:root {
  --bg:#f6f7f9; --surface:#fff; --border:#e3e6ea; --text:#111418; --muted:#5b6470;
  --primary:#2563eb; --primary-fg:#fff;
  --ok:#15803d; --ok-bg:#e8f6ec;
  --warn:#b45309; --warn-bg:#fdf3e1;
  --bad:#b91c1c; --bad-bg:#fdecec;
  --info:#1d4ed8; --info-bg:#e8effd;
  --live:#dc2626;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg:#0b0d10; --surface:#14181d; --border:#262c34; --text:#e8ebef; --muted:#9aa4b0;
    --ok:#4ade80; --ok-bg:#10281a; --warn:#fbbf24; --warn-bg:#2b2110;
    --bad:#f87171; --bad-bg:#2d1414; --info:#7aa7ff; --info-bg:#14213d;
  }
}
body { background:var(--bg); color:var(--text); }
```

Type: system sans (Inter if already loaded). Title `text-2xl font-semibold`; card heading `text-sm font-semibold`; body `text-sm`; helper `text-xs text-[--muted]`.
Radius: cards `rounded-xl`, controls `rounded-lg`. Cards: `border border-[--border] bg-[--surface] p-5 shadow-sm`.

## 4. Component specs

### `ui/Card.tsx` (new, DRY)
Props: `title?`, `aside?`, `children`. Renders the card shell above with `<section aria-labelledby>`. All panels use it.

### `ui/StatusBadge.tsx`
Pill `inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium` with dot.
Status → tone map (single const object):
- Draft: neutral · Scheduled: info · Ready for Streaming: ok · **Live: bad tone + pulsing dot (`animate-pulse`)** · Completed: neutral · Replay Available: info.
Reuse the same tone map for requirement states: satisfied=ok, missing=bad, pending=warn, error=bad.

### `EventHeader.tsx`
Title (once), formatted date (`Intl.DateTimeFormat`, with timezone), `StatusBadge` right-aligned. Remove the duplicate "Event" row from Details.

### `LifecycleStepper.tsx`
`<ol>` with 6 items in `flex`; connector = `flex-1 h-0.5` between nodes (primary when complete, border color when upcoming).
- complete: filled circle with check, text-muted
- current: ring-2 ring-primary, bold label, `aria-current="step"`
- upcoming: hollow circle
Below `md`: labels hidden except current; show "Step 3 of 6 · Ready for Streaming" text instead. Wrap in `overflow-x-auto` as a fallback.

### `ReadinessPanel.tsx` + `RequirementRow.tsx`
Header: "Readiness" with `aside` = "2 of 3 satisfied". Under it a progress bar `h-2 rounded-full` (`role="progressbar"` with `aria-valuenow`), fill `--ok`.
Rows: `flex items-start gap-3 py-3 border-t`. Left: 20px icon (✓ / ✕ / spinner / !) in a tinted circle. Middle: label (`font-medium`) + one-line hint under it for non-satisfied items, e.g. "Assign a production crew to continue." (hint text comes from the requirements registry `blockedMessage`; do not hardcode in JSX). Right: state chip (same tone map). Pending shows `Spinner` and "Verifying…".
Footer line when all satisfied: ok alert "All requirements met."

### `NextStepCard.tsx` (replaces the flat `ActionBar` layout)
Concept: show **the one next action** prominently, not four buttons.
- Title: "Next step". Subtitle: label of the action (e.g. "Go Live").
- Primary `Button` full-width. Disabled when blocked.
- If blocked: below it a `BlockedReason` list in a `bg-[--warn-bg]` box: heading "Resolve to continue", then `<ul>` of short bullets from `readiness.blockers` (e.g. "Ingest not configured", "Ticket pricing not set").
- Other actions (not next): small ghost buttons row under "Other actions", **only enabled ones**; disabled ones are hidden. Terminal state (Replay Available): show a neutral "No further actions" message.
- While running: button shows `Spinner` + "Working…" and `aria-busy`.

Selector (only logic addition, in `useEvent.ts`, pure, ≤10 lines): `nextAction = actions.find(a => a.targetStatus === nextStatus(event.status))`. Everything else is filtered in the component.

### `BlockedReason.tsx`
Props: `reasons: string[]`. Renders the warn box above, linked by `aria-describedby` to the button. Message copy must be user-readable; never print raw guard strings such as "Blocked upstream… — Missing". Map blocker codes to short sentences in the registry.

### `EventDetails.tsx`
`<dl>` of 2-column rows: Starts, Ticket price, Crew, Ingest. Values right aligned; Crew/Ingest show a StatusBadge instead of raw text ("satisfied"/"missing").

### Alerts
`ui/Alert.tsx` variants `info | ok | warn | bad` using token backgrounds, leading icon, `role="status"` (or `role="alert"` for bad). `StreamFailureBanner` = `bad` alert at top while Live: "Stream failure detected. Check the ingest source." Notices auto-dismiss button `Dismiss`.

### Loading / error
Skeletons (`animate-pulse` blocks with the same card shapes) on initial load. Load error: `bad` Alert with a Retry button.

### `SimulationPanel.tsx`
Collapsible `<details>` titled "Developer tools (simulation)", dashed border, muted. Inside, labeled controls:
- Scenario: `<select>` with visible label.
- Requirements: one row per registry entry: label + segmented control `Satisfied | Missing | Pending | Error` (radio group, one per requirement). Replaces ✓/✕ buttons.
- Toggles (`<label>` + checkbox): "Fail next call", "Stream failure (Live only)", "Replay processed".
Closed by default so the product UI is the focus.

### `ui/Button.tsx`
Variants `primary | secondary | ghost`; sizes `md | sm`. `h-10 px-4 rounded-lg text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--primary]`. Disabled: `opacity-50 cursor-not-allowed` (keep contrast ≥ 4.5:1 for label).

## 5. Behavior and a11y rules

- Color is never the only signal: icon + text on every state.
- Touch targets ≥ 40px. Visible focus rings everywhere.
- Status changes announced via `aria-live="polite"` region (notices).
- Auto-promotion/demotion shows an info Alert: "Event moved to Ready for Streaming." / "Moved back to Scheduled: Ingest is no longer configured."
- Respect `prefers-reduced-motion` (disable pulse/spinner animation).

## 6. File plan (all ≤ 160 lines)

```
components/ui/        Card.tsx  Alert.tsx  Button.tsx  StatusBadge.tsx  Spinner.tsx  tones.ts
components/dashboard/ DashboardPage.tsx  EventHeader.tsx  LifecycleStepper.tsx
                      ReadinessPanel.tsx  RequirementRow.tsx  NextStepCard.tsx
                      BlockedReason.tsx  EventDetails.tsx  StreamFailureBanner.tsx
                      DashboardSkeleton.tsx
components/simulation/SimulationPanel.tsx  RequirementControl.tsx
```
`tones.ts` is the single tone map consumed by badges, alerts and rows (DRY).

## 7. Acceptance checklist

- [ ] No duplicated event name/status on screen
- [ ] Stepper shows complete / current / upcoming with a connector line
- [ ] Readiness shows progress bar and a hint for each unmet item
- [ ] One prominent next action; blockers listed in plain language
- [ ] Disabled secondary actions hidden, not listed with errors
- [ ] Simulation panel collapsed by default, controls labeled
- [ ] Works at 375px and 1280px, light and dark
- [ ] Existing tests still pass; add tests for `NextStepCard` blocked state and stepper `aria-current`
- [ ] `lint`, `typecheck`, `test`, `build` pass; no file over 160 lines