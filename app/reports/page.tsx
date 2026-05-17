import { getExpenses } from "@/lib/expenses";
import { ReportsView } from "@/components/reports/reports-view";

export default async function ReportsPage() {
  const dbExpenses = await getExpenses();
  const expenses = dbExpenses.map((e) => ({
    id: e.id,
    category: e.category,
    amount: new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(e.amount),
    date: e.date.toISOString().split("T")[0],
    paymentMethod: e.paymentMethod,
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-2 pb-6">
      <ReportsView expenses={expenses} />
    </div>
  );
}
