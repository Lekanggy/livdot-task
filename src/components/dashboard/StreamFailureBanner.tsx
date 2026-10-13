import { Alert } from '@/components/ui/Alert';
import type { Event } from '@/domain/types';

export function StreamFailureBanner({ event }: { event: Event }) {
  if (event.status !== 'live' || !event.streamFailure) return null;
  return (
    <Alert tone="bad" icon="⚠" data-testid="stream-failure-banner">
      <strong data-testid="stream-failure">Stream failure detected. Check the ingest source.</strong>
    </Alert>
  );
}
