const block = 'animate-pulse rounded-xl bg-slate-200';

export function DashboardSkeleton() {
  return (
    <div data-testid="dashboard-loading">
      <div className="h-[60px] border-b border-line bg-surface">
        <div className="mx-auto flex h-full max-w-[1200px] items-center gap-3 px-6">
          <div className="h-7 w-7 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
        </div>
      </div>
      <main className="mx-auto flex max-w-[1200px] flex-col gap-6 px-6 py-8">
        <div className="flex items-start justify-between gap-4">
          <div className="w-full max-w-md">
            <div className={`${block} h-8 w-72`} />
            <div className="mt-3 h-4 w-56 animate-pulse rounded bg-slate-200" />
          </div>
          <div className={`${block} h-9 w-44`} />
        </div>

        <div className={`${block} h-24 w-full`} />

        <div className="grid gap-6 lg:grid-cols-12">
          <div className={`${block} h-72 lg:col-span-7`} />
          <div className="flex flex-col gap-6 lg:col-span-5">
            <div className={`${block} h-40`} />
            <div className={`${block} h-60`} />
          </div>
        </div>

        <div className={`${block} h-14 w-full`} />
      </main>
    </div>
  );
}
