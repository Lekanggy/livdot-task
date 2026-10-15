type IconProps = { className?: string };

const base = {
  width: 16,
  height: 16,
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 3,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

export function CheckIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M3 8.5l3.5 3.5L13 4.5" />
    </svg>
  );
}

export function CrossIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  );
}

export function ExclamationIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M8 3.5v6" />
      <circle cx="8" cy="12.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function InfoIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} strokeWidth={2.5}>
      <circle cx="8" cy="8" r="6" />
      <path d="M8 7.2v3.4" />
      <circle cx="8" cy="4.9" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}
