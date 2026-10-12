import { autoTransition, canTransition } from '@/domain/lifecycle';
import type { Event, EventStatus, RequirementId, RequirementState } from '@/domain/types';
import { apiError, type Result } from './result';
import { getScenario, SCENARIO_IDS, type ScenarioId } from './fixtures';
import { withLatency, type WithLatencyOptions } from './latency';

let current: Event = getScenario('draft-incomplete');
let options: WithLatencyOptions = {};
let failNext = false;

export function setFailNext(next: boolean): void {
  failNext = next;
}

export type ApiConfig = {
  scenario?: ScenarioId;
  latency?: WithLatencyOptions;
};

export function configureApi(config: ApiConfig = {}): void {
  if (config.scenario && SCENARIO_IDS.includes(config.scenario)) {
    current = getScenario(config.scenario);
  }
  if (config.latency) options = config.latency;
}

export function resetApi(): void {
  configureApi({ scenario: 'draft-incomplete', latency: {} });
  failNext = false;
}

export function getEvent(): Promise<Result<Event>> {
  return withLatency(() => maybeFail({ ok: true, value: clone(current) }), options);
}

function maybeFail<T>(result: Result<T>): Result<T> {
  if (failNext) {
    failNext = false;
    return { ok: false, error: apiError('network', 'Simulated failure — the next call was made to fail.') };
  }
  return result;
}

export function setRequirement(
  id: RequirementId,
  state: RequirementState,
): Promise<Result<Event>> {
  return withLatency(() => maybeFail(applyEvent(() => applySetRequirement(id, state))), options);
}

export function setStreamFailure(on: boolean): void {
  current = { ...clone(current), streamFailure: on };
}

export function transition(
  to: EventStatus,
  opts: { auto?: boolean } = {},
): Promise<Result<Event>> {
  return withLatency(() => maybeFail(applyEvent(() => applyTransition(to, opts.auto ?? false))), options);
}

export function markReplayProcessed(): void {
  current = { ...clone(current), replayProcessed: true };
}

function applyEvent(mutate: () => Result<Event>): Result<Event> {
  const result = mutate();
  if (result.ok) current = result.value;
  return result;
}

export function snapshot(): Event {
  return current;
}

function clone(event: Event): Event {
  return structuredClone(event);
}

function applySetRequirement(
  id: RequirementId,
  state: RequirementState,
): Result<Event> {
  const entry = current.requirements.find((r) => r.id === id);
  if (!entry) {
    return { ok: false, error: apiError('invalid_requirement', `Unknown requirement "${id}".`) };
  }
  const next = clone(current);
  const target = next.requirements.find((r) => r.id === id);
  target!.state = state;
  delete target!.detail;
  return { ok: true, value: next };
}

function applyTransition(to: EventStatus, allowAuto: boolean): Result<Event> {
  const blocker = canTransition(current, to);
  if (blocker) {
    return { ok: false, error: apiError('invalid_transition', blocker.message) };
  }
  const next = clone(current);
  if (next.status === 'completed' && to === 'replay' && !next.replayProcessed) {
    next.replayProcessed = true;
  }
  next.status = to;
  if (allowAuto) {
    const auto = autoTransition(next);
    if (auto) next.status = auto;
  }
  return { ok: true, value: next };
}

export function autoTransitionEvent(): Promise<Result<Event>> {
  return withLatency(() => {
    const auto = autoTransition(current);
    if (!auto) return { ok: true, value: clone(current) };
    return applyEvent(() => {
      const next = clone(current);
      next.status = auto;
      return { ok: true, value: next };
    });
  }, options);
}
