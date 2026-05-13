export default function Home() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Welcome back. Here&apos;s a quick snapshot of your finances.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "This month", value: "—" },
          { label: "Transactions", value: "—" },
          { label: "Top category", value: "—" },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {card.label}
            </p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
              {card.value}
            </p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 p-6 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-400">
        Connect accounts or add expenses to see activity here.
      </div>
    </div>
  );
}
