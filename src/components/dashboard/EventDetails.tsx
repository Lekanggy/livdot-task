import type { ReactNode } from 'react';
import type { Event, RequirementStatus } from '@/domain/types';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import type { Tone } from '@/components/ui/tones';

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const dateFmt = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' });

export function EventDetails({ event }: { event: Event }) {
  const { startsAt, ticketPrice } = event.details;
  const crew = event.requirements.find((r) => r.id === 'crew');
  const ingest = event.requirements.find((r) => r.id === 'ingest');
  const priceSet = ticketPrice > 0;

  return (
    <Card title="Event details" testId="event-details">
      <dl className="text-sm">
        <Row label="Starts">
          <dd data-testid="detail-starts">{dateFmt.format(new Date(startsAt))}</dd>
        </Row>
        <Row label="Ticket price">
          {priceSet ? (
            <dd data-testid="detail-price">{money.format(ticketPrice)}</dd>
          ) : (
            <dd data-testid="detail-price" className="font-semibold text-red-800">
              Not set
            </dd>
          )}
        </Row>
        <Row label="Crew">
          <Chip tone={toneOf(crew)}>{crew?.state === 'satisfied' ? 'Assigned' : 'Not assigned'}</Chip>
        </Row>
        <Row label="Ingest">
          <Chip tone={toneOf(ingest)}>{ingest?.state === 'satisfied' ? 'Configured' : 'Missing'}</Chip>
        </Row>
      </dl>
    </Card>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-line-soft py-3 first:border-t-0">
      <dt className="text-muted">{label}</dt>
      {children}
    </div>
  );
}

function toneOf(entry?: RequirementStatus): Tone {
  return entry?.state === 'satisfied' ? 'ok' : 'bad';
}
