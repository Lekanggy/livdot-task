type Props = { eventName: string };

export function TopBar({ eventName }: Props) {
  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex h-[60px] max-w-[1200px] items-center justify-between gap-4 px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            aria-hidden
            className="grid h-7 w-7 flex-none place-items-center rounded-lg bg-primary text-sm font-bold text-white"
          >
            L
          </span>
          <span className="flex-none font-bold">LIV DOT</span>
          <span className="truncate text-muted">/ Events / {eventName}</span>
        </div>
        <span className="flex-none text-muted">Host console</span>
      </div>
    </header>
  );
}
