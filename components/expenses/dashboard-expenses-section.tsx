"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { ExpensesTable, type ExpenseRow } from "@/components/expenses/expenses-table";
import { toast } from "sonner";
import { createExpense, updateExpense, deleteExpense } from "@/app/actions/expenses";
import { getCategories } from "@/app/actions/categories";

const PAYMENT_OPTIONS = [
  "Credit card",
  "Debit card",
  "Bank transfer",
  "PayPal",
  "Cash",
] as const;

type FormErrors = Partial<
  Record<"category" | "amount" | "date" | "paymentMethod", string>
>;

function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

/** Parse stored display amount (e.g. "$124.50") for the amount input */
function amountForInput(displayAmount: string): string {
  const cleaned = displayAmount.replace(/[$\s]/g, "").replace(/,/g, "");
  const n = Number.parseFloat(cleaned);
  if (Number.isNaN(n)) return "";
  return (Math.round(n * 100) / 100).toString();
}

function validate(
  category: string,
  amountRaw: string,
  date: string,
  paymentMethod: string,
): FormErrors {
  const errors: FormErrors = {};
  const cat = category.trim();
  if (!cat) errors.category = "Enter a category.";

  const amountStr = amountRaw.trim();
  if (!amountStr) {
    errors.amount = "Enter an amount.";
  } else {
    const n = Number.parseFloat(amountStr.replace(/,/g, ""));
    if (Number.isNaN(n) || n <= 0) {
      errors.amount = "Enter a valid amount greater than zero.";
    }
  }

  if (!date) errors.date = "Pick a date.";
  else if (Number.isNaN(Date.parse(date))) errors.date = "Invalid date.";

  if (!paymentMethod) errors.paymentMethod = "Select a payment method.";

  return errors;
}

type SortOption = "newest" | "oldest" | "amount";

function parseAmountForSort(display: string): number {
  const n = Number.parseFloat(display.replace(/[$\s]/g, "").replace(/,/g, ""));
  return Number.isNaN(n) ? 0 : n;
}

export function DashboardExpensesSection({ initialExpenses }: { initialExpenses?: ExpenseRow[] } = {}) {
  const [expenses, setExpenses] = useState<ExpenseRow[]>(() =>
    initialExpenses ? [...initialExpenses] : []
  );
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>(
    PAYMENT_OPTIONS[0],
  );
  const [errors, setErrors] = useState<FormErrors>({});

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  const isEdit = editingId !== null;

  // Load categories when component mounts
  useEffect(() => {
    async function loadCategories() {
      const result = await getCategories();
      if (result.success && result.data) {
        setCategories(result.data);
        // Set first category as default if available
        if (result.data.length > 0 && !category) {
          setCategory(result.data[0].name);
        }
      }
    }
    loadCategories();
  }, []);

  const resetForm = useCallback(() => {
    setCategory(categories.length > 0 ? categories[0].name : "");
    setAmount("");
    setDate("");
    setPaymentMethod(PAYMENT_OPTIONS[0]);
    setErrors({});
    setEditingId(null);
  }, [categories]);

  const closeModal = useCallback(() => {
    setOpen(false);
    resetForm();
  }, [resetForm]);

  const openAddModal = useCallback(() => {
    resetForm();
    setOpen(true);
  }, [resetForm]);

  const openEditModal = useCallback((row: ExpenseRow) => {
    setEditingId(row.id);
    setCategory(row.category);
    setAmount(amountForInput(row.amount));
    setDate(row.date);
    setPaymentMethod(row.paymentMethod);
    setErrors({});
    setOpen(true);
  }, []);

  const handleDelete = useCallback(async (row: ExpenseRow) => {
    if (!window.confirm("Remove this expense?")) return;
    const result = await deleteExpense(row.id);
    if (result.success) {
      setExpenses((prev) => prev.filter((r) => r.id !== row.id));
      toast.success("Expense deleted");
    } else {
      toast.error(result.error || "Failed to delete expense");
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeModal]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const next = validate(category, amount, date, paymentMethod);
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const n = Number.parseFloat(amount.trim().replace(/,/g, ""));
    const selectedCategory = categories.find(cat => cat.name === category);
    
    if (!selectedCategory) {
      toast.error("Please select a valid category");
      return;
    }
    
    const formData = {
      category: category.trim(),
      categoryId: selectedCategory.id,
      amount: n,
      date,
      paymentMethod,
    };

    if (editingId) {
      const result = await updateExpense(editingId, formData);
      if (result.success) {
        setExpenses((prev) =>
          prev.map((r) => (r.id === editingId ? { ...r, category: formData.category, amount: formatUsd(n), date: formData.date, paymentMethod: formData.paymentMethod } : r)),
        );
        toast.success("Expense updated");
        closeModal();
      } else {
        toast.error(result.error || "Failed to update expense");
      }
    } else {
      const result = await createExpense(formData);
      if (result.success) {
        const row: ExpenseRow = {
          id: crypto.randomUUID(),
          category: formData.category,
          amount: formatUsd(n),
          date: formData.date,
          paymentMethod: formData.paymentMethod,
        };
        setExpenses((prev) => [row, ...prev]);
        toast.success("Expense added");
        closeModal();
      } else {
        toast.error(result.error || "Failed to create expense");
      }
    }
  }

  const paymentKnown = PAYMENT_OPTIONS.some((p) => p === paymentMethod);

  const categoryOptions = useMemo(() => {
    const names = new Set(expenses.map((e) => e.category));
    return [...names].sort((a, b) => a.localeCompare(b));
  }, [expenses]);

  const displayedExpenses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = expenses.filter((row) => {
      if (categoryFilter && row.category !== categoryFilter) return false;
      if (q) {
        const cat = row.category.toLowerCase();
        const pm = row.paymentMethod.toLowerCase();
        if (!cat.includes(q) && !pm.includes(q)) return false;
      }
      return true;
    });
    const next = [...filtered];
    if (sortBy === "newest") {
      next.sort(
        (a, b) =>
          b.date.localeCompare(a.date) || b.id.localeCompare(a.id),
      );
    } else if (sortBy === "oldest") {
      next.sort(
        (a, b) =>
          a.date.localeCompare(b.date) || a.id.localeCompare(b.id),
      );
    } else {
      next.sort(
        (a, b) =>
          parseAmountForSort(b.amount) - parseAmountForSort(a.amount) ||
          b.date.localeCompare(a.date),
      );
    }
    return next;
  }, [expenses, searchQuery, categoryFilter, sortBy]);


  return (
    <>
      <div className="space-y-3">
        <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/90 p-4 shadow-sm ring-1 ring-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-950/40 dark:ring-white/10 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
            <div className="grid min-w-0 flex-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="expense-search"
                  className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
                >
                  Search
                </label>
                <input
                  id="expense-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Category or payment method"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none ring-zinc-400/30 placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500"
                />
              </div>
              <div>
                <label
                  htmlFor="expense-category-filter"
                  className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
                >
                  Category
                </label>
                <select
                  id="expense-category-filter"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none ring-zinc-400/30 focus:border-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500"
                >
                  <option value="">All categories</option>
                  {categoryOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="w-full shrink-0 sm:max-w-xs lg:w-56">
              <label
                htmlFor="expense-sort"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
              >
                Sort
              </label>
              <select
                id="expense-sort"
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as SortOption)
                }
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none ring-zinc-400/30 focus:border-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="amount">Highest amount</option>
              </select>
            </div>
          </div>
          {expenses.length > 0 ? (
            <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
              Showing{" "}
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                {displayedExpenses.length}
              </span>{" "}
              of {expenses.length}
            </p>
          ) : null}
        </div>

        <ExpensesTable
          expenses={displayedExpenses}
          onEdit={openEditModal}
          onDelete={handleDelete}
          actions={
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Add expense
            </button>
          }
        />
        {expenses.length > 0 && displayedExpenses.length === 0 ? (
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            No expenses match your search or filters.
          </p>
        ) : null}
      </div>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
          role="presentation"
        >
          <button
            type="button"
            className="absolute inset-0 bg-zinc-950/60 backdrop-blur-[1px]"
            aria-label="Close dialog"
            onClick={closeModal}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="expense-modal-title"
            className="relative z-10 flex max-h-[min(92vh,640px)] w-full max-w-md flex-col rounded-t-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900 sm:rounded-2xl"
          >
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
              <h3
                id="expense-modal-title"
                className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
              >
                {isEdit ? "Edit expense" : "Add expense"}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                aria-label="Close"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4 sm:p-5"
            >
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="expense-category"
                    className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Category
                  </label>
                  <select
                    id="expense-category"
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      if (errors.category)
                        setErrors((o) => ({ ...o, category: undefined }));
                    }}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none ring-zinc-400/30 focus:border-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-500"
                  >
                    {categories.length === 0 ? (
                      <option value="">No categories available</option>
                    ) : (
                      categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))
                    )}
                  </select>
                  {errors.category ? (
                    <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                      {errors.category}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor="expense-amount"
                    className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Amount
                  </label>
                  <input
                    id="expense-amount"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      if (errors.amount)
                        setErrors((o) => ({ ...o, amount: undefined }));
                    }}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none ring-zinc-400/30 placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-500"
                    placeholder="0.00"
                  />
                  {errors.amount ? (
                    <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                      {errors.amount}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor="expense-date"
                    className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Date
                  </label>
                  <input
                    id="expense-date"
                    type="date"
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value);
                      if (errors.date)
                        setErrors((o) => ({ ...o, date: undefined }));
                    }}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none ring-zinc-400/30 focus:border-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:[color-scheme:dark] dark:focus:border-zinc-500"
                  />
                  {errors.date ? (
                    <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                      {errors.date}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor="expense-payment"
                    className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Payment method
                  </label>
                  <select
                    id="expense-payment"
                    value={paymentMethod}
                    onChange={(e) => {
                      setPaymentMethod(e.target.value);
                      if (errors.paymentMethod)
                        setErrors((o) => ({ ...o, paymentMethod: undefined }));
                    }}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none ring-zinc-400/30 focus:border-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-500"
                  >
                    {!paymentKnown && paymentMethod ? (
                      <option value={paymentMethod}>{paymentMethod}</option>
                    ) : null}
                    {PAYMENT_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  {errors.paymentMethod ? (
                    <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                      {errors.paymentMethod}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  {isEdit ? "Update expense" : "Save expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
