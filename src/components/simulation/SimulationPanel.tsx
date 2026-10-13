'use client';

import { Button } from '@/components/ui/Button';
import { SCENARIO_IDS, type ScenarioId } from '@/services/fixtures';
import { useEvent } from '@/state/useEvent';

const SCENARIO_LABEL: Record<ScenarioId, string> = {
  'draft-incomplete': '1 · Draft incomplete',
  'scheduled-missing-crew': '2 · Scheduled, crew missing',
  'scheduled-almost-ready': '3 · Scheduled, ingest pending',
  ready: '4 · Ready for Streaming',
  live: '5 · Live',
  completed: '6 · Completed',
};

export function SimulationPanel() {
  const {
    event,
    switchScenario,
    setRequirement,
    triggerStreamFailure,
    processReplay,
  } = useEvent();

  return (
    <section
      aria-label="Simulation controls"
      className="rounded border border-dashed p-4 text-sm"
      data-testid="simulation-panel"
    >
      <h2 className="mb-2 font-semibold uppercase tracking-wide text-zinc-500">
        Simulation
      </h2>
      <div className="flex flex-col gap-3">
        <ScenarioSelector onPick={(id) => void switchScenario(id)} />
        <div className="flex flex-wrap gap-2" data-testid="sim-requirement-toggles">
          {event?.requirements.map((entry) => (
            <div key={entry.id} className="flex items-center gap-1">
              <span className="text-xs text-zinc-500">{entry.id}:</span>
              <Button
                className="!px-2 !py-1 text-xs"
                data-testid={`req-${entry.id}-satisfy`}
                onClick={() => void setRequirement(entry.id, 'satisfied')}
              >
                ✓
              </Button>
              <Button
                className="!px-2 !py-1 text-xs"
                data-testid={`req-${entry.id}-missing`}
                onClick={() => void setRequirement(entry.id, 'missing')}
              >
                ✕
              </Button>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            className="!px-2 !py-1 text-xs"
            data-testid="sim-fail-next"
            onClick={() => {
              /* wired in Phase 6 test step below */
              failNextClick();
            }}
          >
            Make next call fail
          </Button>
          {event?.status === 'live' && (
            <Button
              className="!px-2 !py-1 text-xs"
              data-testid="sim-stream-failure"
              onClick={() => void triggerStreamFailure(true)}
            >
              Trigger stream failure
            </Button>
          )}
          {event?.status === 'completed' && !event.replayProcessed && (
            <Button
              className="!px-2 !py-1 text-xs"
              data-testid="sim-replay"
              onClick={processReplay}
            >
              Replay finished processing
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

function ScenarioSelector({ onPick }: { onPick: (id: ScenarioId) => void }) {
  return (
    <label className="flex items-center gap-2 text-xs text-zinc-600">
      Scenario
      <select
        className="rounded border px-2 py-1 text-xs"
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
    </label>
  );
}

function failNextClick() {
  void import('@/services/mockEventApi').then(({ setFailNext }) => setFailNext(true));
}
