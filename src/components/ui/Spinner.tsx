import { cn } from '@/lib/cn';

export function Spinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <span role="status" className="inline-flex items-center gap-2 text-sm text-[--muted]">
      <span
        aria-hidden
        className={cn(
          'h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent',
          'dark:border-zinc-600 dark:border-t-transparent',
        )}
      />
      {label}
    </span>
  );
}
