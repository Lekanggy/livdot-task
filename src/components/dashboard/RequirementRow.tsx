import type { RequirementState, RequirementStatus } from '@/domain/types';
import { requirementLabel } from '@/domain/requirements';
import { IconCircle, type IconKind } from '@/components/ui/IconCircle';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { REQUIREMENT_TONE } from '@/components/ui/tones';

const HINTS = {
  satisfied: {
    crew: 'Studio team confirmed.',
    ingest: 'Broadcast feed is ready to receive.',
    pricing: 'Ticket price is set for viewers.',
  },
  blocked: {
    crew: 'Assign a production crew to continue.',
    ingest: 'Add a valid ingest source to receive the broadcast feed.',
    pricing: 'Set at least one ticket price so viewers can buy access.',
  },
} as const;

const CHIP_LABEL: Record<RequirementState, string> = {
  satisfied: 'Satisfied',
  missing: 'Missing',
  pending: 'Verifying…',
  error: 'Error',
};

const ICON: Record<RequirementState, IconKind> = {
  satisfied: 'check',
  missing: 'cross',
  pending: 'spinner',
  error: 'exclamation',
};

type Props = {
  entry: RequirementStatus;
  onConfigure: () => void;
};

export function RequirementRow({ entry, onConfigure }: Props) {
  const tone = REQUIREMENT_TONE[entry.state];
  const hint = entry.state === 'satisfied' ? HINTS.satisfied[entry.id] : HINTS.blocked[entry.id];

  return (
    <li
      data-testid={`req-${entry.id}`}
      data-state={entry.state}
      className="flex items-center gap-3.5 border-t border-line-soft py-4"
    >
      <IconCircle tone={tone} kind={ICON[entry.state]} />
      <div className="min-w-0 flex-1">
        <strong className="font-semibold">{requirementLabel(entry.id)}</strong>
        <p className="mt-0.5 text-muted">{hint}</p>
      </div>
      <Chip tone={tone}>{CHIP_LABEL[entry.state]}</Chip>
      {(entry.state === 'missing' || entry.state === 'error') && (
        <Button variant="secondary" onClick={onConfigure} data-testid={`configure-${entry.id}`}>
          Configure
        </Button>
      )}
    </li>
  );
}
