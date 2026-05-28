/**
 * Shared formatting utilities for currency and dates.
 * Follows the project's 3-layer architecture (lib layer).
 */

/**
 * Formats a number as USD currency.
 * Consistent with existing Intl.NumberFormat usage in the project.
 */
export function formatCurrency(
  amount: number,
  options: { minimumFractionDigits?: number } = {}
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    ...options,
  }).format(amount);
}

/**
 * Formats a Date object or ISO string to a standard YYYY-MM-DD format.
 * Used for table displays and form inputs.
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split("T")[0];
}

/**
 * Formats a Date object to a short month and 2-digit year (e.g., "Jan 24").
 * Used in charts and reports.
 */
export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  });
}
