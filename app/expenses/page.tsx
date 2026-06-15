import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ExpensesManagementSection } from "@/components/expenses/expenses-management-section";
import { getCategories } from "@/lib/categories";
import { getExpenses } from "@/lib/expenses";
import { formatCurrency, formatDate } from "@/lib/formatters";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const [dbExpenses, initialCategories] = await Promise.all([
    getExpenses(userId),
    getCategories(userId),
  ]);

  const initialExpenses = dbExpenses.map((e) => ({
    id: e.id,
    category: e.category.name,
    amount: formatCurrency(e.amount),
    date: formatDate(e.date),
    paymentMethod: e.paymentMethod,
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Expenses
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Manage your expenses, add new entries, and track your spending.
        </p>
      </div>
      <ExpensesManagementSection
        key={JSON.stringify(initialExpenses)}
        initialExpenses={initialExpenses}
        initialCategories={initialCategories}
      />
    </div>
  );
}
