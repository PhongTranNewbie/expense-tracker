import { redirect } from "next/navigation";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <p className="text-sm text-zinc-600 dark:text-zinc-400">
      App settings will go here.
    </p>
  );
}
