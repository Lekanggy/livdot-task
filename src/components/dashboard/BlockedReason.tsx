import type { AvailableAction } from '@/domain/actions';
import type { Event, RequirementId } from '@/domain/types';

/** Short, plain-language reasons for requirement blockers (spec §5). */
const BLOCKER_COPY: Record<RequirementId, string> = {
  crew: 'Crew is not confirmed.',
  ingest: 'Ingest is not configured.',
  pricing: 'Ticket pricing is not set.',
};

export function blockedReasonsFor(action: AvailableAction, event: Event): string[] {
  if (action.action === 'goLive') {
    const open = event.requirements.filter((r) => r.state !== 'satisfied');
    if (open.length > 0) return open.map((r) => BLOCKER_COPY[r.id]);
  }
  return [plainReason(action.reason)];
}

/** Guard strings must never reach the UI — fall back to plain wording. */
function plainReason(reason?: string): string {
  if (!reason) return 'This action is not available right now.';
  if (/blocked upstream|cannot/i.test(reason)) return 'Finish the earlier steps first.';
  return reason.split(' — ')[0];
}

export function BlockedReason({ id, reasons }: { id: string; reasons: string[] }) {
  return (
    <div id={id} data-testid={id} role="status" className="mt-3.5 rounded-lg bg-amber-100 p-3 text-amber-900">
      <p className="font-semibold">Resolve to continue</p>
      <ul className="mt-1.5 space-y-1">
        {reasons.map((reason, i) => (
          <li key={i}>• {reason}</li>
        ))}
      </ul>
    </div>
  );
}
