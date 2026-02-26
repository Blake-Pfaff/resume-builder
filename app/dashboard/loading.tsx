export default function DashboardLoading() {
  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-40 animate-pulse rounded bg-zinc-200" />
          <div className="h-4 w-64 animate-pulse rounded bg-zinc-200" />
        </div>
        <div className="h-10 w-32 animate-pulse rounded bg-zinc-200" />
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="h-5 w-40 animate-pulse rounded bg-zinc-200" />
            <div className="mt-3 h-4 w-28 animate-pulse rounded bg-zinc-200" />
            <div className="mt-5 flex gap-2">
              <div className="h-8 w-16 animate-pulse rounded bg-zinc-200" />
              <div className="h-8 w-20 animate-pulse rounded bg-zinc-200" />
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
