import { StatusBadge } from '@/components/ui/StatusBadge';
import type { Event } from '@/domain/types';

export function EventHeader({ event }: { event: Event }) {
  const dateFmt = new Intl.DateTimeFormat('en', {
    dateStyle: 'long',
    timeStyle: 'short',
  });

  return (
    <header className="flex flex-col gap-2">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{event.details.name}</h1>
          <p className="text-sm text-[--muted] mt-1" data-testid="event-date">
            {dateFmt.format(new Date(event.details.startsAt))}
          </p>
        </div>
        <StatusBadge status={event.status} />
      </div>
    </header>
  );
}
