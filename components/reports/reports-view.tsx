"use client";

import React from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LabelList,
} from "recharts";
import { TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import { CategoryPieData, ReportsData } from "@/lib/stats";
import { formatCurrency } from "@/lib/formatters";
import { Card } from "@/components/ui/card";

interface ReportsViewProps {
  data: ReportsData;
}

// Visual themes matching application design system
const TREND_COLOR = "#2563eb"; // Tailwind blue-600
const COLORS = ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#c7d2fe", "#e0e7ff"];

const formatAxisMoney = (value: number) => {
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
  return `$${value}`;
};

const getTrendCopy = (trend: number) => {
  if (trend > 0) return "Spending is up from last month";
  if (trend < 0) return "Spending is down from last month";
  return "Spending is even with last month";
};

export function ReportsView({ data }: ReportsViewProps) {
  const { stats, monthlySeries, categoryPieData } = data;

  const hasMonthlyData = monthlySeries.some((m) => m.total > 0);
  const hasCategoryData = categoryPieData.length > 0;
  const topCategory = categoryPieData[0];
  const categoryTotal = categoryPieData.reduce((sum, item) => sum + item.value, 0);
  const highestMonth = monthlySeries.reduce(
    (highest, item) => (item.total > highest.total ? item : highest),
    monthlySeries[0],
  );

  return (
    <div className="space-y-6">
      {/* KPI Stats Panel */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">This Month Expenses</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {formatCurrency(stats.currentMonthTotal)}
          </p>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {topCategory
              ? `${topCategory.name} leads this month`
              : "No expenses recorded this month"}
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Last Month Expenses</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {formatCurrency(stats.lastMonthTotal)}
          </p>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Comparison baseline for the trend
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Month-over-Month Trend</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {stats.trend > 0 ? `+${stats.trend}%` : `${stats.trend}%`}
            </span>
            {stats.trend > 0 ? (
              <TrendingUp className="h-6 w-6 text-red-500" />
            ) : stats.trend < 0 ? (
              <TrendingDown className="h-6 w-6 text-green-500" />
            ) : (
              <Minus className="h-6 w-6 text-zinc-400" />
            )}
          </div>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {getTrendCopy(stats.trend)}
          </p>
        </Card>
      </div>

      {hasMonthlyData ? (
        <Card className="p-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Highest month in this view:{" "}
            <span className="font-medium text-zinc-900 dark:text-zinc-50">
              {highestMonth.label}
            </span>{" "}
            at{" "}
            <span className="font-medium text-zinc-900 dark:text-zinc-50">
              {formatCurrency(highestMonth.total)}
            </span>
            {topCategory ? (
              <>
                {" "}
                • Top current category:{" "}
                <span className="font-medium text-zinc-900 dark:text-zinc-50">
                  {topCategory.name}
                </span>
              </>
            ) : null}
          </p>
        </Card>
      ) : null}

      {/* Main Analytical Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Trend Analytics */}
        <ChartCard title="Monthly Spending" description="Evolution of overall expenses over the last 6 months.">
          {!hasMonthlyData ? (
            <EmptyChartState
              message="Add an expense to start building your monthly trend."
              actionLabel="Add expense"
            />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlySeries} margin={{ top: 16, right: 10, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                <XAxis dataKey="label" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#71717a"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatAxisMoney}
                />
                <Tooltip content={<CustomChartTooltip />} cursor={{ fill: "#f4f4f5", opacity: 0.4 }} />
                <Bar dataKey="total" fill={TREND_COLOR} radius={[6, 6, 0, 0]}>
                  <LabelList
                    dataKey="total"
                    position="top"
                    formatter={(value: number) => (value > 0 ? formatAxisMoney(value) : "")}
                    className="fill-zinc-500 text-[11px] dark:fill-zinc-400"
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Category Breakdown Analytics */}
        <ChartCard title="Category Breakdown" description="Distribution of current month expenses across active categories.">
          {!hasCategoryData ? (
            <EmptyChartState
              message="Add this month's expenses to see your category breakdown."
              actionLabel="Add expense"
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_180px] md:items-center">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={categoryPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={92}
                    paddingAngle={4}
                    dataKey="value"
                    nameKey="name"
                  >
                    {categoryPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <CategoryRanking data={categoryPieData} total={categoryTotal} />
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  );
}

function CategoryRanking({
  data,
  total,
}: {
  data: CategoryPieData[];
  total: number;
}) {
  return (
    <div className="space-y-3">
      {data.slice(0, 5).map((item, index) => {
        const percent = total === 0 ? 0 : Math.round((item.value / total) * 100);

        return (
          <div key={item.name} className="space-y-1">
            <div className="flex items-center justify-between gap-3 text-sm">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  aria-hidden="true"
                />
                <span className="truncate font-medium text-zinc-700 dark:text-zinc-200">
                  {item.name}
                </span>
              </div>
              <span className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
                {percent}%
              </span>
            </div>
            <p className="pl-4 text-xs text-zinc-500 dark:text-zinc-400">
              {formatCurrency(item.value)}
            </p>
          </div>
        );
      })}
    </div>
  );
}

/* --- Reusable Scoped Subcomponents for Layout Organization --- */

interface ChartCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

function ChartCard({ title, description, children }: ChartCardProps) {
  return (
    <Card className="flex flex-col p-6">
      <div>
        <h3 className="font-semibold leading-none tracking-tight text-zinc-900 dark:text-zinc-50">{title}</h3>
        <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
      </div>
      <div className="mt-6 flex-1 flex flex-col justify-center">{children}</div>
    </Card>
  );
}

function EmptyChartState({
  message,
  actionLabel,
}: {
  message: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Info className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
      <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-500">{message}</p>
      {actionLabel ? (
        <Link
          href="/expenses"
          className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

interface TooltipPayloadItem {
  name?: string;
  value: number;
  payload: {
    label?: string;
  };
}

interface CustomChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

function CustomChartTooltip({ active, payload }: CustomChartTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-white p-3 shadow-md dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {payload[0].name || payload[0].payload.label}
        </p>
        <p className="mt-0.5 text-sm font-semibold text-zinc-950 dark:text-zinc-50">
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
}
