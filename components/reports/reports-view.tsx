"use client";

import { useMemo, type ReactNode } from "react";
import type { ExpenseRow } from "@/components/expenses/expenses-table";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const MONTH_COUNT = 6;

const CHART_COLORS = [
  "#8b5cf6",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#f43f5e",
  "#6366f1",
  "#14b8a6",
  "#f97316",
];

const AXIS_TICK = { fontSize: 12, fill: "#71717a" };
const GRID_STROKE = "#e4e4e7";
const TREND_COLOR = "#8b5cf6";

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

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatAxisMoney(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return `$${n}`;
}

type TooltipPayload = { value?: number; name?: string };

function MoneyTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const value = payload[0]?.value ?? 0;
  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
      {label ? (
        <p className="mb-0.5 text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
      ) : null}
      <p className="font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
        {formatMoney(value)}
      </p>
    </div>
  );
}

function CategoryTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
      <p className="font-medium text-zinc-900 dark:text-zinc-50">{item?.name}</p>
      <p className="tabular-nums text-zinc-600 dark:text-zinc-300">
        {formatMoney(item?.value ?? 0)}
      </p>
    </div>
  );
}

function ChartCard({
  title,
  description,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={
        "rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm ring-1 ring-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-900/80 dark:ring-white/10 sm:p-6 " +
        className
      }
    >
      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
        {title}
      </h2>
      {description ? (
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      ) : null}
      <div className="mt-5 min-h-[260px] w-full">{children}</div>
    </section>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-[260px] items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 dark:border-zinc-700 dark:bg-zinc-950/30">
      <p className="px-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
        {message}
      </p>
    </div>
  );
}

export function ReportsView({ expenses }: { expenses: ExpenseRow[] }) {
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

  const categoryPieData = useMemo(() => {
    const sums = new Map<string, number>();
    for (const row of expenses) {
      const ym = row.date.slice(0, 7);
      if (!monthKeySet.has(ym)) continue;
      const amt = parseExpenseAmount(row.amount);
      sums.set(row.category, (sums.get(row.category) ?? 0) + amt);
    }
    return [...sums.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [expenses, monthKeySet]);

  const hasMonthlyData = monthlySeries.some((m) => m.total > 0);
  const hasCategoryData = categoryPieData.length > 0;

  const totalInWindow = useMemo(
    () => categoryPieData.reduce((s, c) => s + c.value, 0),
    [categoryPieData],
  );

  return (
    <div className="space-y-6">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Charts show your spending from the last {MONTH_COUNT} months.
      </p>

      <div className="grid gap-6 xl:grid-cols-5">
        <ChartCard
          className="xl:col-span-3"
          title="Monthly expense trend"
          description="Total spending per month over the selected period."
        >
          {!hasMonthlyData ? (
            <EmptyChart message="No expenses in this period yet." />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart
                data={monthlySeries}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={TREND_COLOR} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={TREND_COLOR} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={GRID_STROKE}
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={AXIS_TICK}
                  axisLine={false}
                  tickLine={false}
                  dy={8}
                />
                <YAxis
                  tick={AXIS_TICK}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatAxisMoney}
                  width={48}
                />
                <Tooltip
                  content={<MoneyTooltip />}
                  cursor={{ stroke: TREND_COLOR, strokeOpacity: 0.2 }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke={TREND_COLOR}
                  strokeWidth={2}
                  fill="url(#trendFill)"
                  activeDot={{ r: 5, fill: TREND_COLOR, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          className="xl:col-span-2"
          title="Spending by category"
          description={
            hasCategoryData
              ? `${formatMoney(totalInWindow)} total in this window.`
              : "Share of spending in the same period."
          }
        >
          {!hasCategoryData ? (
            <EmptyChart message="No category data for this period." />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={categoryPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  innerRadius="52%"
                  outerRadius="78%"
                  paddingAngle={2}
                  stroke="transparent"
                >
                  {categoryPieData.map((entry, i) => (
                    <Cell
                      key={entry.name}
                      fill={CHART_COLORS[i % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CategoryTooltip />} />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                  formatter={(value: string) => (
                    <span className="text-zinc-600 dark:text-zinc-400">
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
