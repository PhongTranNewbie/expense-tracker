import { getReportData } from "@/lib/expenses";
import { ReportsView } from "@/components/reports/reports-view";

export default async function ReportsPage() {
  const expenses = await getReportData();

  return (
    <div className="mx-auto max-w-6xl space-y-2 pb-6">
      <ReportsView expenses={expenses} />
    </div>
  );
}
