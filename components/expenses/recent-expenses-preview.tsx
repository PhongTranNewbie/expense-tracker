"use client";

import Link from "next/link";
import { ExpensesTable, type ExpenseRow } from "@/components/expenses/expenses-table";

interface RecentExpensesPreviewProps {
  expenses: ExpenseRow[];
}

/**
 * Lightweight preview component for dashboard.
 * Shows recent expenses without CRUD operations.
 * Links to full expenses management page.
 */
export function RecentExpensesPreview({ expenses }: RecentExpensesPreviewProps) {
  // Show only the 5 most recent expenses
  const recentExpenses = expenses.slice(0, 5);

  return (
    <ExpensesTable
      expenses={recentExpenses}
      title="Recent expenses"
      actions={
        <Link
          href="/expenses"
          className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Manage expenses
        </Link>
      }
      emptyTitle="No expenses yet"
      emptyDescription="Add your first expense to see recent activity here."
      emptyAction={
        <Link
          href="/expenses"
          className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Add expense
        </Link>
      }
    />
  );
}
