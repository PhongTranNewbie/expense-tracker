import { mockExpenses } from "@/components/expenses/mock-expenses";
import { ExpensesTable } from "@/components/expenses/expenses-table";
import { SummaryCard } from "@/components/ui/summary-card";

const summaryMock = [
  {
    label: "Total balance",
    value: "$24,580.50",
    hint: "Across all accounts",
    variant: "balance" as const,
  },
  {
    label: "Monthly expenses",
    value: "$3,240.00",
    hint: "So far this month",
    variant: "expense" as const,
  },
  {
    label: "Monthly income",
    value: "$8,500.00",
    hint: "After tax estimate",
    variant: "income" as const,
  },
  {
    label: "Savings",
    value: "$5,260.00",
    hint: "Income minus expenses",
    variant: "savings" as const,
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Welcome back. Here&apos;s a quick snapshot of your finances.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryMock.map((item) => (
          <SummaryCard
            key={item.label}
            label={item.label}
            value={item.value}
            hint={item.hint}
            variant={item.variant}
          />
        ))}
      </div>
      <ExpensesTable expenses={mockExpenses} />
    </div>
  );
}
