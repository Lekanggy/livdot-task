import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Props = {
  title?: string;
  aside?: ReactNode;
  className?: string;
  testId?: string;
  children: ReactNode;
};

export function Card({ title, aside, className, testId, children }: Props) {
  const id = title ? `card-${title.toLowerCase().replace(/\s+/g, '-')}` : undefined;

  return (
    <section
      aria-labelledby={title ? id : undefined}
      data-testid={testId}
      className={cn('rounded-xl border border-line bg-surface p-6', className)}
    >
      {title && (
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 id={id} className="text-[15px] font-semibold">
            {title}
          </h2>
          {aside && <span className="text-muted">{aside}</span>}
        </div>
      )}
      {children}
    </section>
  );
}
