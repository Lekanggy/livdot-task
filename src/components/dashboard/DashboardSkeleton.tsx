export function DashboardSkeleton() {
  return (
    <main
      className="mx-auto flex max-w-6xl flex-col gap-6 p-6"
      data-testid="dashboard-loading"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="h-9 w-64 animate-pulse rounded-lg bg-zinc-200" />
          <div className="mt-2 h-4 w-48 animate-pulse rounded bg-zinc-100" />
        </div>
        <div className="h-6 w-24 animate-pulse rounded-full bg-zinc-200" />
      </div>

      <div className="flex gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-pulse rounded-full border-2 border-zinc-200 bg-zinc-100" />
            <div className="h-3 w-16 sm:w-24 animate-pulse rounded bg-zinc-100" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 h-64 animate-pulse rounded-xl bg-zinc-100" />
        <div className="lg:col-span-5 h-64 animate-pulse rounded-xl bg-zinc-100" />
      </div>

      <div className="h-24 animate-pulse rounded-xl bg-zinc-100" />
    </main>
  );
}
