import type { Event } from '@/domain/types';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';

export function EventDetails({ event }: { event: Event }) {
  const { startsAt, ticketPrice } = event.details;
  const crew = event.requirements.find((r) => r.id === 'crew');
  const ingest = event.requirements.find((r) => r.id === 'ingest');

  const crewStatus = crew && crew.state === 'satisfied' ? 'ready' : 'draft';
  const ingestStatus = ingest && ingest.state === 'satisfied' ? 'ready' : 'draft';

  return (
    <Card title="Details" testId="event-details">
      <dl className="mt-4 text-sm">
        <div className="flex justify-between gap-4 py-2">
          <dt className="text-zinc-500">Starts</dt>
          <dd className="text-right font-medium" data-testid="detail-starts">
            {new Date(startsAt).toLocaleString()}
          </dd>
        </div>
        <div className="flex justify-between gap-4 py-2">
          <dt className="text-zinc-500">Ticket price</dt>
          <dd className="text-right font-medium" data-testid="detail-price">
            ${ticketPrice.toFixed(2)}
          </dd>
        </div>
        <div className="flex justify-between gap-4 py-2">
          <dt className="text-zinc-500">Crew</dt>
          <dd className="shrink-0">
            <StatusBadge status={crewStatus} />
          </dd>
        </div>
        <div className="flex justify-between gap-4 py-2">
          <dt className="text-zinc-500">Ingest</dt>
          <dd className="shrink-0">
            <StatusBadge status={ingestStatus} />
          </dd>
        </div>
      </dl>
    </Card>
  );
}
