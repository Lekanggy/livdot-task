'use client';

import { Button } from '@/components/ui/Button';
import { SCENARIO_IDS, type ScenarioId } from '@/services/fixtures';
import { useEvent } from '@/state/useEvent';
import { RequirementControl } from './RequirementControl';

export function SimulationPanel() {
  const {
    event,
    switchScenario,
    setRequirement,
    triggerStreamFailure,
    processReplay,
  } = useEvent();

  return (
    <details
      className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm dark:border-zinc-600 dark:bg-zinc-900"
      data-testid="simulation-panel"
    >
      <summary className="cursor-pointer font-semibold uppercase tracking-wide text-[--muted] select-none">
        Developer tools (simulation){' '}
        <span aria-hidden className="text-xs opacity-60">↕</span>
      </summary>
      <div className="mt-4 flex flex-col gap-4">
        <ScenarioSelector onPick={(id) => void switchScenario(id)} />
        {event && (
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-[--muted]">
              Requirements
            </span>
            <div className="flex flex-col gap-2">
              {event.requirements.map((entry) => (
                <RequirementControl
                  key={entry.id}
                  requirementId={entry.id}
                  current={entry.state}
                  onChange={(state) => void setRequirement(entry.id, state)}
                />
              ))}
            </div>
          </div>
        )}
        <fieldset className="flex flex-col gap-2">
          <legend className="text-xs font-medium uppercase tracking-wide text-[--muted]">
            Toggles
          </legend>
          <div className="flex flex-wrap gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                data-testid="sim-fail-next"
                onChange={() => failNextClick()}
                className="h-4 w-4 rounded border-zinc-300 text-[--primary] focus:ring-[--primary]"
              />
              Fail next call
            </label>
            {event?.status === 'live' && (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  data-testid="sim-stream-failure"
                  onChange={() => void triggerStreamFailure(!event.streamFailure)}
                  className="h-4 w-4 rounded border-zinc-300 text-[--primary] focus:ring-[--primary]"
                />
                Stream failure (Live only)
              </label>
            )}
            {event?.status === 'completed' && !event.replayProcessed && (
              <Button
                data-testid="sim-replay"
                variant="secondary"
                size="sm"
                onClick={processReplay}
              >
                Replay processed
              </Button>
            )}
          </div>
        </fieldset>
      </div>
    </details>
  );
}

function ScenarioSelector({ onPick }: { onPick: (id: ScenarioId) => void }) {
  return (
    <fieldset className="flex items-center gap-2">
      <legend className="text-xs font-medium uppercase tracking-wide text-[--muted]">
        Scenario
      </legend>
      <select
        className="rounded-lg border border-[--border] bg-[--surface] px-3 py-1.5 text-sm focus:border-[--primary] focus:outline-none focus:ring-2 focus:ring-[--primary]/20"
        data-testid="sim-scenario"
        defaultValue="draft-incomplete"
        onChange={(e) => onPick(e.target.value as ScenarioId)}
      >
        {SCENARIO_IDS.map((id) => (
          <option key={id} value={id}>
            {SCENARIO_LABEL[id]}
          </option>
        ))}
      </select>
    </fieldset>
  );
}

function failNextClick() {
  void import('@/services/mockEventApi').then(({ setFailNext }) => setFailNext(true));
}

const SCENARIO_LABEL: Record<ScenarioId, string> = {
  'draft-incomplete': '1 · Draft incomplete',
  'scheduled-missing-crew': '2 · Scheduled, crew missing',
  'scheduled-almost-ready': '3 · Scheduled, ingest pending',
  ready: '4 · Ready for Streaming',
  live: '5 · Live',
  completed: '6 · Completed',
};
