import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { RecentExpensesPreview } from "@/components/expenses/recent-expenses-preview";
import { SummaryCard } from "@/components/ui/summary-card";
import { getExpenses } from "@/lib/expenses";
import { getDashboardStats } from "@/lib/stats";
import { formatCurrency, formatDate } from "@/lib/formatters";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const [dbExpenses, stats] = await Promise.all([
    getExpenses(),
    getDashboardStats(),
  ]);

  // Build summary cards with real data
  const summaryData = [
    {
      label: "Monthly expenses",
      value: formatCurrency(stats.currentMonthTotal),
      hint: `${stats.transactionCount} transaction${stats.transactionCount !== 1 ? "s" : ""} this month`,
      variant: "expense" as const,
    },
    {
      label: "Previous month",
      value: formatCurrency(stats.lastMonthTotal),
      hint: `${stats.trend > 0 ? "+" : ""}${stats.trend}% vs this month`,
      variant: "balance" as const,
    },
    {
      label: "Top category",
      value: stats.topCategory,
      hint: "Highest spending this month",
      variant: "income" as const,
    },
    {
      label: "Month trend",
      value: `${stats.trend > 0 ? "+" : ""}${stats.trend}%`,
      hint: stats.trend > 0 ? "Spending increased" : stats.trend < 0 ? "Spending decreased" : "No change",
      variant: stats.trend > 0 ? "expense" as const : "savings" as const,
    },
  ];

  const recentExpenses = dbExpenses.map((e) => ({
    id: e.id,
    category: e.category.name,
    amount: formatCurrency(e.amount),
    date: formatDate(e.date),
    paymentMethod: e.paymentMethod,
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Welcome back. Here&apos;s a quick snapshot of your finances.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryData.map((item) => (
          <SummaryCard
            key={item.label}
            label={item.label}
            value={item.value}
            hint={item.hint}
            variant={item.variant}
          />
        ))}
      </div>
      <RecentExpensesPreview expenses={recentExpenses} />
    </div>
  );
}
