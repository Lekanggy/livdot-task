import type { Event } from '@/domain/types';
import { Alert } from '@/components/ui/Alert';

export function StreamFailureBanner({ event }: { event: Event }) {
  if (event.status !== 'live' || !event.streamFailure) return null;
  return (
    <Alert tone="bad" title="Stream failure detected." data-testid="stream-failure-banner">
      Check the ingest source.
    </Alert>
  );
}
