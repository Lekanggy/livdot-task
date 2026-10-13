
import { cn } from '@/lib/cn';

type Props = {
  id: string;
  reasons: string[];
};

export function BlockedReason({ id, reasons }: Props) {
  return (
    <div
      id={id}
      data-testid={id}
      className={cn(
        'rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm',
        'dark:bg-amber-900/20 dark:border-amber-700',
      )}
      role="alert"
    >
      <p className="mb-2 font-medium text-amber-800 dark:text-amber-300">Resolve to continue</p>
      <ul className="list-disc space-y-1 pl-5 text-amber-700 dark:text-amber-200">
        {reasons.map((reason, i) => (
          <li key={i}>{reason}</li>
        ))}
      </ul>
    </div>
  );
}
