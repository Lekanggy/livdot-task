'use client';

import { SCENARIO_IDS, type ScenarioId } from '@/services/fixtures';
import { useEvent } from '@/state/useEvent';
import { RequirementControl } from './RequirementControl';

export function SimulationPanel() {
  const { event, switchScenario, setRequirement, triggerStreamFailure, processReplay } = useEvent();

  return (
    <details
      className="rounded-xl border border-dashed border-slate-400 bg-slate-50 px-5 py-3.5"
      data-testid="simulation-panel"
    >
      <summary className="cursor-pointer select-none font-semibold text-muted">
        Developer tools (simulation)
      </summary>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-muted">Scenario</span>
          <select
            data-testid="sim-scenario"
            defaultValue="draft-incomplete"
            onChange={(e) => void switchScenario(e.target.value as ScenarioId)}
            className="h-10 rounded-lg border border-slate-300 bg-white px-3"
          >
            {SCENARIO_IDS.map((id) => (
              <option key={id} value={id}>
                {SCENARIO_LABEL[id]}
              </option>
            ))}
          </select>
        </label>

        {event?.requirements.map((entry) => (
          <RequirementControl
            key={entry.id}
            requirementId={entry.id}
            current={entry.state}
            onChange={(state) => void setRequirement(entry.id, state)}
          />
        ))}
      </div>

      <fieldset className="mt-4 border-t border-line pt-4">
        <legend className="text-xs font-semibold text-muted">Toggles</legend>
        <div className="mt-1.5 flex flex-wrap gap-5">
          <Toggle
            label="Fail next call"
            testId="sim-fail-next"
            onChange={() => void import('@/services/mockEventApi').then(({ setFailNext }) => setFailNext(true))}
          />
          <Toggle
            label="Stream failure (Live only)"
            testId="sim-stream-failure"
            disabled={event?.status !== 'live'}
            onChange={(checked) => void triggerStreamFailure(checked)}
          />
          {event?.status === 'completed' && !event.replayProcessed && (
            <Toggle label="Replay processed" testId="sim-replay" onChange={() => void processReplay()} />
          )}
        </div>
      </fieldset>
    </details>
  );
}

function Toggle({
  label,
  testId,
  disabled,
  onChange,
}: {
  label: string;
  testId: string;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-muted">
      <input
        type="checkbox"
        data-testid={testId}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-slate-300 text-primary focus-visible:outline-2 focus-visible:outline-primary"
      />
      {label}
    </label>
  );
}

const SCENARIO_LABEL: Record<ScenarioId, string> = {
  'draft-incomplete': '1 · Draft incomplete',
  'scheduled-missing-crew': '2 · Scheduled, crew missing',
  'scheduled-almost-ready': '3 · Scheduled, ingest pending',
  ready: '4 · Ready for Streaming',
  live: '5 · Live',
  completed: '6 · Completed',
};
