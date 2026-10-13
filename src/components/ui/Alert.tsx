import { cn } from '@/lib/cn';

export type AlertTone = 'info' | 'warning' | 'error';

const TONES: Record<AlertTone, string> = {
  info: 'border-blue-300 bg-blue-50 text-blue-900',
  warning: 'border-amber-300 bg-amber-50 text-amber-900',
  error: 'border-red-300 bg-red-50 text-red-900',
};

export function Alert({
  tone = 'info',
  children,
  ...rest
}: {
  tone?: AlertTone;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div role="alert" className={cn('rounded border px-4 py-3 text-sm', TONES[tone])} {...rest}>
      {children}
    </div>
  );
}
