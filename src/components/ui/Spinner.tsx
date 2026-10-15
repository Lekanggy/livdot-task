import { cn } from '@/lib/cn';

type Props = {
  className?: string;
  label?: string;
};

export function Spinner({ className, label }: Props) {
  if (!label) {
    return <span aria-hidden className={cn('h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent', className)} />;
  }
  return (
    <span role="status" className="inline-flex items-center gap-2 text-muted">
      <span
        aria-hidden
        className={cn('h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent', className)}
      />
      {label}
    </span>
  );
}
