import { getReportData } from "@/lib/expenses";
import { ReportsView } from "@/components/reports/reports-view";
import { Prisma } from "@prisma/client";

export default async function ReportsPage() {
  const expenses = await getReportData();
  
  // Transform the data to match the expected ReportExpense interface
  const transformedExpenses = expenses.map((e) => ({
    id: e.id,
    // Extract the category name from the relation object
    category: e.category, // Handle both object and string cases
    amount: e.amount,
    date: e.date,
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-2 pb-6">
      <ReportsView expenses={transformedExpenses} />
    </div>
  );
}
