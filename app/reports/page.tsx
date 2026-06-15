import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getReportsData } from "@/lib/stats";
import { ReportsView } from "@/components/reports/reports-view";

export const metadata = {
  title: "Financial Reports",
  description: "Analyze your monthly spending trends and category distribution.",
};

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  // Fetch fully pre-aggregated data safely on the server side
  const reportsData = await getReportsData(userId);

  return (
    <div className="mx-auto max-w-6xl space-y-2 pb-6">
      {/* Inject clean payload into presentation client view */}
      <ReportsView data={reportsData} />
    </div>
  );
}
