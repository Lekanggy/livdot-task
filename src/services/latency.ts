import { apiError, type Result } from './result';
import { randomInt, rollFailure } from './timing';

export type WithLatencyOptions = {
  minMs?: number;
  maxMs?: number;
  failRate?: number;
};

export const DEFAULT_OPTIONS: Required<WithLatencyOptions> = {
  minMs: 300,
  maxMs: 900,
  failRate: 0,
};

function nextTick(options: WithLatencyOptions): number {
  const { minMs, maxMs } = { ...DEFAULT_OPTIONS, ...options };
  return randomInt(minMs, maxMs);
}

export function willFail(options: WithLatencyOptions): boolean {
  const { failRate } = { ...DEFAULT_OPTIONS, ...options };
  return rollFailure(failRate);
}

export async function withLatency<T>(
  fn: () => Result<T> | Promise<Result<T>>,
  options: WithLatencyOptions = {},
): Promise<Result<T>> {
  await new Promise((r) => setTimeout(r, nextTick(options)));
  if (willFail(options)) return { ok: false, error: apiError('network', 'Request failed — try again.') };
  return fn();
}
