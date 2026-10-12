import { Alert } from '@/components/ui/Alert';
import type { Event } from '@/domain/types';

export function StreamFailureBanner({ event }: { event: Event }) {
  if (event.status !== 'live' || !event.streamFailure) return null;
  return (
    <Alert tone="warning" >
      <strong data-testid="stream-failure">
        Warning while Live: stream failure reported — viewers may see an interrupted
        signal.
      </strong>
    </Alert>
  );
}
