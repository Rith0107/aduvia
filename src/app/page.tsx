const habits = [
  { name: "Morning walk", detail: "30 minutes", complete: true },
  { name: "Deep work", detail: "90 minutes", complete: true },
  { name: "Read", detail: "20 pages", complete: false },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-stone-100 px-5 py-8 text-slate-950 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
              QuestLog
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Good morning. Here’s today.
            </h1>
          </div>
          <div className="grid size-11 place-items-center rounded-full bg-slate-950 text-sm font-semibold text-white">
            QL
          </div>
        </header>

        <section className="grid gap-5 md:grid-cols-[1.5fr_1fr]">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Tuesday, August 4</p>
                <h2 className="mt-1 text-2xl font-semibold">Daily routine</h2>
              </div>
              <p className="text-3xl font-semibold text-emerald-700">67%</p>
            </div>

            <div className="mt-7 space-y-3">
              {habits.map((habit) => (
                <article
                  className="flex items-center gap-4 rounded-2xl border border-slate-200 p-4"
                  key={habit.name}
                >
                  <span
                    aria-label={habit.complete ? "Complete" : "Incomplete"}
                    className={`grid size-7 place-items-center rounded-full border text-sm ${
                      habit.complete
                        ? "border-emerald-700 bg-emerald-700 text-white"
                        : "border-slate-300 bg-white text-transparent"
                    }`}
                  >
                    ✓
                  </span>
                  <div className="flex-1">
                    <h3 className="font-semibold">{habit.name}</h3>
                    <p className="text-sm text-slate-500">{habit.detail}</p>
                  </div>
                  <button className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium">
                    {habit.complete ? "Done" : "Check in"}
                  </button>
                </article>
              ))}
            </div>
          </div>

          <aside className="grid gap-5">
            <section className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm sm:p-8">
              <p className="text-sm font-medium text-slate-400">Routine efficiency</p>
              <p className="mt-3 text-5xl font-semibold">82%</p>
              <p className="mt-5 text-sm leading-6 text-slate-300">
                You completed both high-priority habits. Reading is still open.
              </p>
            </section>

            <section className="rounded-3xl bg-amber-200 p-6 shadow-sm sm:p-8">
              <p className="text-sm font-medium text-amber-900/70">August side quest</p>
              <h2 className="mt-2 text-xl font-semibold">Build portfolio homepage</h2>
              <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/70">
                <div className="h-full w-3/5 rounded-full bg-amber-950" />
              </div>
              <div className="mt-3 flex justify-between text-sm font-medium">
                <span>3 of 5 milestones</span>
                <span>60%</span>
              </div>
            </section>
          </aside>
        </section>

        <p className="mt-8 text-center text-sm text-slate-500">
          Product foundation preview · sample data only
        </p>
      </div>
    </main>
  );
}
