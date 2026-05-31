"use client";

import { useEffect } from "react";

/**
 * Global Error Boundary for App Router
 * 
 * This is the last resort error handler that catches errors in:
 * - Root layout (app/layout.tsx)
 * - Errors not caught by route-level error.tsx
 * 
 * IMPORTANT: Must include <html> and <body> tags because it replaces
 * the root layout when an error occurs.
 * 
 * Note: This is rarely triggered in practice. Most errors are caught
 * by the route-level error.tsx boundary.
 */

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console for debugging (in production, send to error tracking service)
    console.error("Global Error Boundary caught:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-white dark:bg-zinc-950">
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="w-full max-w-2xl rounded-lg border border-red-200 bg-red-50 p-8 dark:border-red-900/50 dark:bg-red-950/20">
            {/* Error Icon */}
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/30">
                <svg
                  className="h-8 w-8 text-red-600 dark:text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>

            {/* Error Message */}
            <h2 className="mb-2 text-center text-2xl font-semibold text-red-900 dark:text-red-100">
              Application Error
            </h2>
            <p className="mb-6 text-center text-sm text-red-700 dark:text-red-300">
              A critical error occurred. Please refresh the page or contact support if the problem persists.
            </p>

            {/* Error Details (only in development) */}
            {process.env.NODE_ENV === "development" && (
              <div className="mb-6 rounded border border-red-300 bg-red-100 p-4 dark:border-red-800 dark:bg-red-950/40">
                <p className="mb-2 text-xs font-semibold text-red-800 dark:text-red-200">
                  Development Error Details:
                </p>
                <p className="text-xs font-mono text-red-700 dark:text-red-300">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                    Error ID: {error.digest}
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={reset}
                className="rounded-md bg-red-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-700 dark:hover:bg-red-600"
              >
                Try again
              </button>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a
                href="/"
                className="rounded-md border border-red-300 bg-white px-6 py-2.5 text-center text-sm font-medium text-red-700 transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:border-red-800 dark:bg-zinc-900 dark:text-red-300 dark:hover:bg-zinc-800"
              >
                Go to dashboard
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
