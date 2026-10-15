import type { Event } from '@/domain/types';
import { useEvent } from '@/state/useEvent';
import { Alert } from '@/components/ui/Alert';
import { StreamFailureBanner } from './StreamFailureBanner';

type Props = { event: Event };

export function NoticeStack({ event }: Props) {
  const { readiness, notice, clearNotice, async } = useEvent();

  const needsAttention =
    (event.status === 'draft' || event.status === 'scheduled') && !readiness.isReady;
  const blockers = readiness.total - readiness.satisfied;

  return (
    <div aria-live="polite" className="flex flex-col gap-3">
      {needsAttention && (
        <Alert tone="warn" title="Not ready to go live." data-testid="readiness-summary-alert">
          {blockers} requirement{blockers === 1 ? '' : 's'} still need{blockers === 1 ? 's' : ''}{' '}
          attention before this event can move to Ready for Streaming.
        </Alert>
      )}

      <StreamFailureBanner event={event} />

      {notice && (
        <Alert tone={isFailure(notice) ? 'bad' : 'info'} onDismiss={clearNotice} data-testid="notice">
          {plain(notice)}
        </Alert>
      )}

      {async.kind === 'loading' && <span className="sr-only" data-testid="dashboard-updating">Updating…</span>}
    </div>
  );
}

function isFailure(text: string): boolean {
  return /fail/i.test(text);
}

/** Raw guard / transport wording must never reach the UI. */
function plain(text: string): string {
  if (/blocked upstream|cannot/i.test(text)) return 'That action is not available right now.';
  if (/^Simulated failure — /i.test(text)) return 'The last action failed. Try again.';
  return text.replace(' — ', ': ').replace(/—/g, ': ');
}
