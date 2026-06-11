import Link from "next/link";
import { signOut } from "@/auth";

interface AuthControlsProps {
  user?: {
    name?: string | null;
    email?: string | null;
  };
}

export function AuthControls({ user }: AuthControlsProps) {
  if (!user) {
    return (
      <Link
        href="/login"
        className="inline-flex h-8 items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-800 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
      >
        Sign in
      </Link>
    );
  }

  const label = user.name || user.email || "Signed in";

  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="hidden max-w-40 truncate text-xs text-zinc-600 sm:inline dark:text-zinc-400">
        {label}
      </span>
      <form
        action={async () => {
          "use server";

          await signOut({ redirectTo: "/login" });
        }}
      >
        <button
          type="submit"
          className="inline-flex h-8 items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-800 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
