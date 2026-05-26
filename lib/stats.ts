import { prisma } from "@/lib/db";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

export interface MonthlySeriesData {
  label: string;
  total: number;
}

export interface CategoryPieData {
  name: string;
  value: number;
}

export interface ReportsData {
  stats: {
    currentMonthTotal: number;
    lastMonthTotal: number;
    trend: number;
  };
  monthlySeries: MonthlySeriesData[];
  categoryPieData: CategoryPieData[];
}

/**
 * Fetches and aggregates expense data for reports on the server side.
 * Reduces client-side computational overhead and solves serialization issues.
 */
export async function getReportsData(): Promise<ReportsData> {
  const now = new Date();
  
  // Calculate the starting point for a rolling 6-month window
  const sixMonthsAgo = startOfMonth(subMonths(now, 5));
  const currentMonthStr = format(now, "yyyy-MM");
  const lastMonthStr = format(subMonths(now, 1), "yyyy-MM");

  // Fetch only the raw records falling within the 6-month window
  const expenses = await prisma.expense.findMany({
    where: {
      date: {
        gte: sixMonthsAgo,
        lte: endOfMonth(now),
      },
    },
    include: {
      category: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      date: "asc",
    },
  });

  let currentMonthTotal = 0;
  let lastMonthTotal = 0;

  // Initialize a map for the last 6 months to guarantee all months appear on the chart
  const monthlyMap = new Map<string, number>();
  for (let i = 5; i >= 0; i--) {
    const monthKey = format(subMonths(now, i), "yyyy-MM");
    monthlyMap.set(monthKey, 0);
  }

  // Initialize a map to aggregate totals per category for the current month
  const categoryMap = new Map<string, number>();

  // Process data in a single linear pass (O(N))
  for (const expense of expenses) {
    const expenseMonthStr = format(expense.date, "yyyy-MM");
    const amount = expense.amount;
    const categoryName = expense.category?.name || "Uncategorized";

    // Aggregate totals for current month and last month to calculate trend
    if (expenseMonthStr === currentMonthStr) {
      currentMonthTotal += amount;
      categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + amount);
    } else if (expenseMonthStr === lastMonthStr) {
      lastMonthTotal += amount;
    }

    // Accumulate the amount if the month falls into our 6-month chart window
    if (monthlyMap.has(expenseMonthStr)) {
      monthlyMap.set(expenseMonthStr, (monthlyMap.get(expenseMonthStr) || 0) + amount);
    }
  }

  // Calculate percentage trend comparison vs previous month
  const difference = currentMonthTotal - lastMonthTotal;
  const trend = lastMonthTotal === 0 ? 0 : Math.round((difference / lastMonthTotal) * 100);

  // Format monthly map into an array compatible with Recharts components
  const monthlySeries: MonthlySeriesData[] = Array.from(monthlyMap.entries()).map(([key, total]) => {
    const [year, month] = key.split("-");
    const dateObject = new Date(Number(year), Number(month) - 1, 1);
    return {
      label: dateObject.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      total,
    };
  });

  // Format category map into an array and sort by value descending
  const categoryPieData: CategoryPieData[] = Array.from(categoryMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return {
    stats: {
      currentMonthTotal,
      lastMonthTotal,
      trend,
    },
    monthlySeries,
    categoryPieData,
  };
}