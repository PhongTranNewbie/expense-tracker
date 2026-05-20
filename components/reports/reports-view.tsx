"use client";

import { useMemo, type ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
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

interface ReportExpense {
  id: string;
  category: string;
  amount: number;
  date: Date;
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

export function ReportsView({ expenses }: { expenses: ReportExpense[] }) {
  const { currentMonthKey, lastMonthKey, monthKeys } = useMemo(() => {
    const now = new Date();
    const current = monthKeyFromDate(now);
    const lastDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const last = monthKeyFromDate(lastDate);
    const trailing = getTrailingMonthKeys(MONTH_COUNT, now);
    return { currentMonthKey: current, lastMonthKey: last, monthKeys: trailing };
  }, []);

  const monthKeySet = useMemo(() => new Set(monthKeys), [monthKeys]);

  const stats = useMemo(() => {
    let currentMonthTotal = 0;
    let lastMonthTotal = 0;

    for (const row of expenses) {
      const ym = monthKeyFromDate(row.date);
      if (ym === currentMonthKey) currentMonthTotal += row.amount;
      if (ym === lastMonthKey) lastMonthTotal += row.amount;
    }

    const diff = currentMonthTotal - lastMonthTotal;
    const trend =
      lastMonthTotal === 0
        ? 0
        : Math.round((diff / lastMonthTotal) * 100);

    return {
      currentMonthTotal,
      lastMonthTotal,
      trend,
    };
  }, [expenses, currentMonthKey, lastMonthKey]);

  const monthlySeries = useMemo(() => {
    const sums = new Map<string, number>();
    for (const key of monthKeys) sums.set(key, 0);
    for (const row of expenses) {
      const ym = monthKeyFromDate(row.date);
      if (!monthKeySet.has(ym)) continue;
      sums.set(ym, (sums.get(ym) ?? 0) + row.amount);
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
      const ym = monthKeyFromDate(row.date);
      if (!monthKeySet.has(ym)) continue;
      sums.set(row.category, (sums.get(row.category) ?? 0) + row.amount);
    }
    return [...sums.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [expenses, monthKeySet]);

  const hasMonthlyData = monthlySeries.some((m) => m.total > 0);
  const hasCategoryData = categoryPieData.length > 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">This Month</p>
          <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">{formatMoney(stats.currentMonthTotal)}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Last Month</p>
          <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">{formatMoney(stats.lastMonthTotal)}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Monthly Trend</p>
          <p className={`mt-2 text-3xl font-bold ${stats.trend > 0 ? 'text-rose-500' : stats.trend < 0 ? 'text-emerald-500' : 'text-zinc-900 dark:text-zinc-50'}`}>
            {stats.trend > 0 ? '+' : ''}{stats.trend}%
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Monthly Spending"
          description="Total expenses per month."
        >
          {!hasMonthlyData ? (
            <EmptyChart message="No expenses found." />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlySeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID_STROKE} />
                <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} tickFormatter={formatAxisMoney} />
                <Tooltip content={<MoneyTooltip />} cursor={{ fill: '#f4f4f5', opacity: 0.4 }} />
                <Bar dataKey="total" fill={TREND_COLOR} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title="Category Breakdown"
          description="Spending distribution by category."
        >
          {!hasCategoryData ? (
            <EmptyChart message="No category data." />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={categoryPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                >
                  {categoryPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CategoryTooltip />} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
