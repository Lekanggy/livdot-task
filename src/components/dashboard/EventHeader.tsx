import type { Event } from '@/domain/types';
import { StatusBadge } from '@/components/ui/StatusBadge';

const dateFmt = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' });

export function EventHeader({ event }: { event: Event }) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-[28px] font-bold tracking-tight">{event.details.name}</h1>
        <p className="mt-1.5 text-muted" data-testid="event-date">
          {dateFmt.format(new Date(event.details.startsAt))}{' '}· Ticketed live event
        </p>
      </div>
      <StatusBadge status={event.status} />
    </header>
  );
}
