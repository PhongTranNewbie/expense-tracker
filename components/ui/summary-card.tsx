type SummaryCardVariant = "balance" | "expense" | "income" | "savings";

const accent: Record<SummaryCardVariant, string> = {
  balance: "border-l-violet-500",
  expense: "border-l-rose-500",
  income: "border-l-emerald-500",
  savings: "border-l-sky-500",
};

type SummaryCardProps = {
  label: string;
  value: string;
  hint?: string;
  variant: SummaryCardVariant;
};

export function SummaryCard({ label, value, hint, variant }: SummaryCardProps) {
  return (
    <div
      className={
        "rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm ring-1 ring-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-900/80 dark:ring-white/10 " +
        "border-l-4 " +
        accent[variant]
      }
    >
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums text-zinc-900 dark:text-zinc-50 sm:text-3xl">
        {value}
      </p>
      {hint ? (
        <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">{hint}</p>
      ) : null}
    </div>
  );
}
