import type { Event } from '@/domain/types';

function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

function row(label: string, value: string, testId?: string) {
  return (
    <div key={label} className="flex justify-between gap-4 py-1">
      <dt className="text-zinc-500">{label}</dt>
      <dd data-testid={testId}>{value}</dd>
    </div>
  );
}

export function EventDetails({ event }: { event: Event }) {
  const { name, startsAt, ticketPrice } = event.details;
  const crew = event.requirements.find((r) => r.id === 'crew');
  const ingest = event.requirements.find((r) => r.id === 'ingest');
  return (
    <section aria-label="Event details" className="rounded border p-4">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">
        Details
      </h2>
      <dl className="text-sm">
        {row('Event', name, 'detail-name')}
        {row('Starts', new Date(startsAt).toLocaleString(), 'detail-starts')}
        {row('Ticket price', formatPrice(ticketPrice), 'detail-price')}
        {row('Crew', crew ? crew.state : '—', 'detail-crew')}
        {row('Ingest', ingest ? ingest.state : '—', 'detail-ingest')}
      </dl>
    </section>
  );
}
