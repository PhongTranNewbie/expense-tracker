import type { ExpenseRow } from "@/components/expenses/expenses-table";

export const EXPENSES_STORAGE_KEY = "expense-tracker:expenses:v1";

export function isExpenseRow(value: unknown): value is ExpenseRow {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.category === "string" &&
    typeof o.amount === "string" &&
    typeof o.date === "string" &&
    typeof o.paymentMethod === "string"
  );
}

/** Result of reading localStorage: persisted rows, empty list, or use mock seed. */
export type ExpenseStorageRead =
  | { kind: "rows"; rows: ExpenseRow[] }
  | { kind: "default" };

export function readExpenseRowsFromLocalStorage(): ExpenseStorageRead {
  if (typeof window === "undefined") return { kind: "default" };
  try {
    const raw = localStorage.getItem(EXPENSES_STORAGE_KEY);
    if (raw === null || raw === "") return { kind: "default" };

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return { kind: "default" };
    if (parsed.length === 0) return { kind: "rows", rows: [] };
    if (parsed.every(isExpenseRow)) {
      return { kind: "rows", rows: parsed as ExpenseRow[] };
    }
    return { kind: "default" };
  } catch {
    return { kind: "default" };
  }
}
