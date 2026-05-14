"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ExpenseRow } from "@/components/expenses/expenses-table";
import { mockExpenses } from "@/components/expenses/mock-expenses";
import {
  EXPENSES_STORAGE_KEY,
  readExpenseRowsFromLocalStorage,
} from "@/lib/expenses-storage";

const MONTH_COUNT = 6;

const CATEGORY_BAR_COLORS = [
  "bg-violet-500",
  "bg-sky-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-indigo-500",
  "bg-teal-500",
  "bg-orange-500",
];

function parseExpenseAmount(display: string): number {
  const n = Number.parseFloat(display.replace(/[$\s]/g, "").replace(/,/g, ""));
  return Number.isNaN(n) ? 0 : n;
}

function monthKeyFromDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getTrailingMonthKeys(count: number, anchor = new Date()): string[] {
  const keys: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(anchor.getFullYear(), anchor.getMonth() - i, 1);
    keys.push(monthKeyFromDate(d));
  }
  return keys;
}

function shortMonthLabel(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, (m ?? 1) - 1, 1);
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function resolveExpenses(
  read: ReturnType<typeof readExpenseRowsFromLocalStorage>,
): ExpenseRow[] {
  return read.kind === "rows" ? read.rows : [...mockExpenses];
}

export function ReportsView() {
  const [expenses, setExpenses] = useState<ExpenseRow[]>(() => [
    ...mockExpenses,
  ]);

  const reload = useCallback(() => {
    setExpenses(resolveExpenses(readExpenseRowsFromLocalStorage()));
  }, []);

  useEffect(() => {
    reload();
    const onStorage = (e: StorageEvent) => {
      if (e.key === EXPENSES_STORAGE_KEY || e.key === null) reload();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") reload();
    };
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [reload]);

  const monthKeys = useMemo(() => getTrailingMonthKeys(MONTH_COUNT), []);
  const monthKeySet = useMemo(() => new Set(monthKeys), [monthKeys]);

  const monthlySeries = useMemo(() => {
    const sums = new Map<string, number>();
    for (const key of monthKeys) sums.set(key, 0);
    for (const row of expenses) {
      const ym = row.date.slice(0, 7);
      if (!monthKeySet.has(ym)) continue;
      sums.set(ym, (sums.get(ym) ?? 0) + parseExpenseAmount(row.amount));
    }
    return monthKeys.map((key) => ({
      key,
      label: shortMonthLabel(key),
      total: sums.get(key) ?? 0,
    }));
  }, [expenses, monthKeys, monthKeySet]);

  const categoryBreakdown = useMemo(() => {
    const sums = new Map<string, number>();
    for (const row of expenses) {
      const ym = row.date.slice(0, 7);
      if (!monthKeySet.has(ym)) continue;
      const amt = parseExpenseAmount(row.amount);
      sums.set(row.category, (sums.get(row.category) ?? 0) + amt);
    }
    const entries = [...sums.entries()].sort((a, b) => b[1] - a[1]);
    const max = entries.reduce((m, [, v]) => Math.max(m, v), 0);
    return { entries, max };
  }, [expenses, monthKeySet]);

  const monthlyMax = useMemo(
    () => monthlySeries.reduce((m, x) => Math.max(m, x.total), 0),
    [monthlySeries],
  );

  const formatMoney = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);

  const hasAnyInWindow =
    monthlySeries.some((m) => m.total > 0) ||
    categoryBreakdown.entries.length > 0;

  return (
    <div className="space-y-8">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Based on saved expenses from the last {MONTH_COUNT} months (localStorage
        or mock data when nothing is stored yet).
      </p>

      <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm ring-1 ring-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-900/80 dark:ring-white/10 sm:p-6">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          Monthly expenses
        </h2>
        {!hasAnyInWindow ? (
          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
            No expenses in this window yet.
          </p>
        ) : (
          <div className="mt-6">
            <div className="flex h-48 min-h-[12rem] items-end gap-2 sm:gap-3">
              {monthlySeries.map((m) => {
                const h =
                  monthlyMax <= 0
                    ? 0
                    : Math.max(8, (m.total / monthlyMax) * 100);
                return (
                  <div
                    key={m.key}
                    className="flex min-w-0 flex-1 flex-col items-center gap-2"
                  >
                    <div className="flex w-full flex-1 items-end justify-center rounded-xl bg-zinc-100 px-1 pb-0 pt-2 dark:bg-zinc-800/60">
                      <div
                        className="w-full max-w-14 rounded-t-lg bg-violet-500 transition-[height] dark:bg-violet-400"
                        style={{ height: `${h}%` }}
                        title={`${m.label}: ${formatMoney(m.total)}`}
                      />
                    </div>
                    <span className="w-full truncate text-center text-[11px] font-medium text-zinc-500 dark:text-zinc-400 sm:text-xs">
                      {m.label}
                    </span>
                    <span className="w-full truncate text-center text-[10px] tabular-nums text-zinc-600 dark:text-zinc-300 sm:text-xs">
                      {formatMoney(m.total)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm ring-1 ring-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-900/80 dark:ring-white/10 sm:p-6">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          Category breakdown
        </h2>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Share of spending in the same {MONTH_COUNT}-month window.
        </p>
        {categoryBreakdown.entries.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
            No categories to show for this period.
          </p>
        ) : (
          <ul className="mt-5 space-y-4">
            {categoryBreakdown.entries.map(([name, total], i) => {
              const pct =
                categoryBreakdown.max <= 0
                  ? 0
                  : Math.round((total / categoryBreakdown.max) * 100);
              const color =
                CATEGORY_BAR_COLORS[i % CATEGORY_BAR_COLORS.length] ??
                "bg-zinc-400";
              return (
                <li key={name}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="truncate font-medium text-zinc-800 dark:text-zinc-100">
                      {name}
                    </span>
                    <span className="shrink-0 tabular-nums text-zinc-600 dark:text-zinc-300">
                      {formatMoney(total)}
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className={`h-full rounded-full ${color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
