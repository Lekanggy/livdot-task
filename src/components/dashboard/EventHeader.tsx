import { StatusBadge } from '@/components/ui/StatusBadge';
import type { Event } from '@/domain/types';

const dateFormat = new Intl.DateTimeFormat('en', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export function EventHeader({ event }: { event: Event }) {
  return (
    <header className="flex items-center justify-between gap-4">
      <div>
        <h1 className="text-xl font-semibold">{event.details.name}</h1>
        <p className="text-sm text-zinc-600" data-testid="event-date">
          {dateFormat.format(new Date(event.details.startsAt))}
        </p>
      </div>
      <StatusBadge status={event.status} />
    </header>
  );
}
