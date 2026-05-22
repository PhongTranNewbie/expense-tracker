"use client";

import { useState, type ReactNode } from "react";

export type ExpenseRow = {
  id: string;
  category: string;
  amount: string;
  date: string;
  paymentMethod: string;
};

type ExpensesTableProps = {
  expenses: ExpenseRow[];
  isLoading?: boolean;
  title?: string;
  /** e.g. primary actions shown next to the section title */
  actions?: ReactNode;
  onEdit?: (row: ExpenseRow) => void;
  onDelete?: (row: ExpenseRow) => void;
};

const th =
  "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400";
const td =
  "px-4 py-3 text-sm text-zinc-800 tabular-nums dark:text-zinc-200";

const rowActions =
  "inline-flex h-8 items-center justify-center rounded-lg px-2.5 text-xs font-medium transition-colors";

export function ExpensesTable({
  expenses,
  isLoading = false,
  title = "Recent expenses",
  actions,
  onEdit,
  onDelete,
}: ExpensesTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Reset to page 1 when expenses change (search/filter)
  const [prevExpenses, setPrevExpenses] = useState(expenses);
  if (expenses !== prevExpenses) {
    setPrevExpenses(expenses);
    setCurrentPage(1);
  }

  const totalPages = Math.ceil(expenses.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedExpenses = expenses.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const showRowActions = Boolean(onEdit || onDelete);

  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          {title}
        </h2>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>

      <ul className="space-y-3 sm:hidden">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <li
              key={i}
              className="animate-pulse rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm ring-1 ring-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-900/80 dark:ring-white/10"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="h-5 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-5 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <div className="h-3 w-10 rounded bg-zinc-100 dark:bg-zinc-800/50" />
                  <div className="h-4 w-20 rounded bg-zinc-100 dark:bg-zinc-800/50" />
                </div>
                <div className="space-y-1">
                  <div className="h-3 w-10 rounded bg-zinc-100 dark:bg-zinc-800/50" />
                  <div className="h-4 w-20 rounded bg-zinc-100 dark:bg-zinc-800/50" />
                </div>
              </div>
            </li>
          ))
        ) : expenses.length === 0 ? (
          <li className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50 py-12 text-center dark:border-zinc-800 dark:bg-zinc-950/30">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No expenses found.
            </p>
          </li>
        ) : (
          paginatedExpenses.map((row) => (
            <li
              key={row.id}
              className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm ring-1 ring-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-900/80 dark:ring-white/10"
            >
            <div className="flex items-start justify-between gap-3">
              <p className="font-medium text-zinc-900 dark:text-zinc-50">
                {row.category}
              </p>
              <p className="shrink-0 text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                {row.amount}
              </p>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <div>
                <dt className="font-medium text-zinc-400 dark:text-zinc-500">
                  Date
                </dt>
                <dd className="mt-0.5 text-zinc-700 dark:text-zinc-300">
                  {row.date}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-zinc-400 dark:text-zinc-500">
                  Payment
                </dt>
                <dd className="mt-0.5 text-zinc-700 dark:text-zinc-300">
                  {row.paymentMethod}
                </dd>
              </div>
            </dl>
            {showRowActions ? (
              <div className="mt-4 flex flex-wrap gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                {onEdit ? (
                  <button
                    type="button"
                    onClick={() => onEdit(row)}
                    className={`${rowActions} border border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-800`}
                  >
                    Edit
                  </button>
                ) : null}
                {onDelete ? (
                  <button
                    type="button"
                    onClick={() => onDelete(row)}
                    className={`${rowActions} border border-red-200 bg-white text-red-700 hover:bg-red-50 dark:border-red-900/60 dark:bg-zinc-950 dark:text-red-400 dark:hover:bg-red-950/40`}
                  >
                    Delete
                  </button>
                ) : null}
              </div>
            ) : null}
          </li>
        ))
        )}
      </ul>

      <div className="hidden sm:block overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm ring-1 ring-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-900/80 dark:ring-white/10">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-left">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-950/50">
                <th className={th}>Category</th>
                <th className={th}>Amount</th>
                <th className={th}>Date</th>
                <th className={th}>Payment method</th>
                {showRowActions ? (
                  <th className={`${th} text-right`}>Actions</th>
                ) : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className={td}>
                      <div className="h-4 w-24 rounded bg-zinc-100 dark:bg-zinc-800/50" />
                    </td>
                    <td className={td}>
                      <div className="h-4 w-16 rounded bg-zinc-100 dark:bg-zinc-800/50" />
                    </td>
                    <td className={td}>
                      <div className="h-4 w-20 rounded bg-zinc-100 dark:bg-zinc-800/50" />
                    </td>
                    <td className={td}>
                      <div className="h-4 w-24 rounded bg-zinc-100 dark:bg-zinc-800/50" />
                    </td>
                    {showRowActions ? (
                      <td className={td}>
                        <div className="flex justify-end gap-1.5">
                          <div className="h-8 w-12 rounded-lg bg-zinc-100 dark:bg-zinc-800/50" />
                          <div className="h-8 w-16 rounded-lg bg-zinc-100 dark:bg-zinc-800/50" />
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))
              ) : expenses.length === 0 ? (
                <tr>
                  <td
                    colSpan={showRowActions ? 5 : 4}
                    className="py-12 text-center"
                  >
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      No expenses found.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedExpenses.map((row) => (
                  <tr
                    key={row.id}
                    className="transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40"
                  >
                    <td className={`${td} font-medium`}>{row.category}</td>
                    <td className={td}>{row.amount}</td>
                    <td className={`${td} text-zinc-600 dark:text-zinc-400`}>
                      {row.date}
                    </td>
                    <td className={`${td} text-zinc-600 dark:text-zinc-400`}>
                      {row.paymentMethod}
                    </td>
                    {showRowActions ? (
                      <td className={`${td} text-right`}>
                        <div className="flex flex-wrap justify-end gap-1.5">
                          {onEdit ? (
                            <button
                              type="button"
                              onClick={() => onEdit(row)}
                              className={`${rowActions} border border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-800`}
                            >
                              Edit
                            </button>
                          ) : null}
                          {onDelete ? (
                            <button
                              type="button"
                              onClick={() => onDelete(row)}
                              className={`${rowActions} border border-red-200 bg-white text-red-700 hover:bg-red-50 dark:border-red-900/60 dark:bg-zinc-950 dark:text-red-400 dark:hover:bg-red-950/40`}
                            >
                              Delete
                            </button>
                          ) : null}
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 pt-2">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Showing {startIndex + 1} to{" "}
            {Math.min(startIndex + ITEMS_PER_PAGE, expenses.length)} of{" "}
            {expenses.length} expenses
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`${rowActions} border border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50 disabled:opacity-50 disabled:hover:bg-white dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:disabled:hover:bg-zinc-950`}
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`${rowActions} border border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50 disabled:opacity-50 disabled:hover:bg-white dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:disabled:hover:bg-zinc-950`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
