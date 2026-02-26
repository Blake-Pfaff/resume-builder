export default function EditorLoading() {
  return (
    <main className="flex min-h-screen min-w-[1100px] flex-col">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-80 animate-pulse rounded bg-zinc-200" />
          <div className="h-10 w-40 animate-pulse rounded bg-zinc-200" />
        </div>
        <div className="h-9 w-28 animate-pulse rounded bg-zinc-200" />
      </header>

      <section className="grid flex-1 grid-cols-[1fr_1.1fr] bg-zinc-100">
        <div className="space-y-4 overflow-y-auto border-r border-zinc-200 p-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="rounded-md border border-zinc-200 bg-white p-4">
              <div className="h-5 w-24 animate-pulse rounded bg-zinc-200" />
              <div className="mt-3 h-10 w-full animate-pulse rounded bg-zinc-200" />
              <div className="mt-2 h-10 w-full animate-pulse rounded bg-zinc-200" />
            </div>
          ))}
        </div>
        <div className="overflow-auto p-6">
          <div className="mx-auto h-[900px] max-w-[860px] animate-pulse rounded bg-zinc-200" />
        </div>
      </section>
    </main>
  );
}
