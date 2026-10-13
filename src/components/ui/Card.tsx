import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Props = {
  title?: string;
  aside?: string;
  children: ReactNode;
  className?: string;
  testId?: string;
};

export function Card({ title, aside, children, className, testId }: Props) {
  const id = title ? `card-${title.toLowerCase().replace(/\s+/g, '-')}` : undefined;

  return (
    <section
      data-testid={testId}
      aria-labelledby={id}
      className={cn(
        'rounded-xl border border-[--border] bg-[--surface] p-5 shadow-sm',
        className,
      )}
    >
      {(title || aside) && (
        <div className="flex items-baseline justify-between gap-4">
          <div>
            {title && (
              <h2
                id={id}
                className="text-sm font-semibold uppercase tracking-wide text-[--muted]"
              >
                {title}
              </h2>
            )}
            {aside && <p className="mt-0.5 text-xs text-[--muted]">{aside}</p>}
          </div>
        </div>
      )}
      {children}
    </section>
  );
}
