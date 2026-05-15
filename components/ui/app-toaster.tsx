"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      richColors={false}
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "rounded-xl border border-zinc-200 bg-white text-zinc-900 shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50",
          title: "text-sm font-medium",
          description: "text-sm text-zinc-500 dark:text-zinc-400",
          closeButton:
            "border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800",
        },
      }}
    />
  );
}
