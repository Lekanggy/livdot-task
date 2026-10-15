import type { EventStatus } from '@/domain/types';
import { statusLabel } from '@/domain/lifecycle';
import { STATUS_TONE } from './tones';
import { Chip } from './Chip';

export function StatusBadge({ status }: { status: EventStatus }) {
  return (
    <Chip
      size="lg"
      tone={STATUS_TONE[status]}
      pulse={status === 'live'}
      data-testid="status-badge"
      data-status={status}
    >
      {statusLabel(status)}
    </Chip>
  );
}
