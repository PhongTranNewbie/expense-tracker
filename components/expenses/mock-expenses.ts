import type { ExpenseRow } from "./expenses-table";

export const mockExpenses: ExpenseRow[] = [
  {
    id: "1",
    category: "Groceries",
    amount: "$124.50",
    date: "2026-05-12",
    paymentMethod: "Credit card",
  },
  {
    id: "2",
    category: "Transport",
    amount: "$45.00",
    date: "2026-05-11",
    paymentMethod: "Debit card",
  },
  {
    id: "3",
    category: "Utilities",
    amount: "$189.20",
    date: "2026-05-10",
    paymentMethod: "Bank transfer",
  },
  {
    id: "4",
    category: "Dining",
    amount: "$62.75",
    date: "2026-05-09",
    paymentMethod: "Credit card",
  },
  {
    id: "5",
    category: "Subscriptions",
    amount: "$29.99",
    date: "2026-05-08",
    paymentMethod: "PayPal",
  },
];
