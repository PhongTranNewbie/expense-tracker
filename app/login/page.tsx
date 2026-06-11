import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata = {
  title: "Sign in | Expense Tracker",
};

export default async function LoginPage() {
  const session = await auth();

  return (
    <div className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-md items-center">
      <Card className="w-full p-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Sign in
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Use GitHub to access your expense tracker.
          </p>
        </div>

        <div className="mt-6">
          {session?.user ? (
            <div className="space-y-4">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                You are already signed in.
              </p>
              <form
                action={async () => {
                  "use server";

                  redirect("/");
                }}
              >
                <Button type="submit" className="w-full">
                  Go to dashboard
                </Button>
              </form>
            </div>
          ) : (
            <form
              action={async () => {
                "use server";

                await signIn("github", { redirectTo: "/" });
              }}
            >
              <Button type="submit" className="w-full">
                Sign in with GitHub
              </Button>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
}
