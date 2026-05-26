import { getReportsData } from "@/lib/stats";
import { ReportsView } from "@/components/reports/reports-view";

export const metadata = {
  title: "Financial Reports | MoneyVis",
  description: "Analyze your monthly spending trends and category distribution.",
};

export default async function ReportsPage() {
  // Fetch fully pre-aggregated data safely on the server side
  const reportsData = await getReportsData();

  return (
    <div className="mx-auto max-w-6xl space-y-2 pb-6">
      {/* Inject clean payload into presentation client view */}
      <ReportsView data={reportsData} />
    </div>
  );
}