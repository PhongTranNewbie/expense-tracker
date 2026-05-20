export default function ReportsLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-6 animate-pulse">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-[400px] rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
        <div className="h-[400px] rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
      </div>
    </div>
  );
}
