import { configureApi, resetApi } from '@/services/mockEventApi';

export function instantLatency() {
  configureApi({ latency: { minMs: 0, maxMs: 0 } });
}

export { configureApi as configureScenario, resetApi as resetScenario };
