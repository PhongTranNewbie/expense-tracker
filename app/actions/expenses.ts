"use server";

import { revalidatePath } from "next/cache";
import * as dbLayer from "@/lib/expenses";

/**
 * Server Actions Layer acting as the secure bridge between Client UI and Database Layer.
 * Manages mutations, data stabilization, and UI cache revalidation.
 */

export async function createExpense(formData: {
  category: string;     // Legacy field for UI compatibility
  categoryId: string;   // Standard category ID
  amount: number;
  date: string;
  paymentMethod: string;
}) {
  try {
    // Validation
    if (!formData.categoryId) return { success: false, error: "Category is required" };
    if (!formData.amount || formData.amount <= 0) return { success: false, error: "Amount must be greater than 0" };
    if (!formData.date) return { success: false, error: "Date is required" };

    // Call the underlying database operation from lib
    // ✅ CORRECT: Passing flat data, no Prisma relation syntax
    await dbLayer.createExpense({
      categoryId: formData.categoryId,
      amount: formData.amount,
      date: new Date(formData.date),
      paymentMethod: formData.paymentMethod,
    });

    // Clear next.js path cache to reflect changes immediately on UI
    revalidatePath("/");
    revalidatePath("/reports");
    return { success: true };
  } catch (error) {
    console.error("Server Action Error [createExpense]:", error);
    return { success: false, error: "Failed to create expense" };
  }
}

export async function updateExpense(
  id: string,
  formData: {
    category: string;
    categoryId: string;
    amount: number;
    date: string;
    paymentMethod: string;
  }
) {
  try {
    // Validation
    if (!id) return { success: false, error: "Expense ID is required" };
    if (!formData.categoryId) return { success: false, error: "Category is required" };
    if (!formData.amount || formData.amount <= 0) return { success: false, error: "Amount must be greater than 0" };
    if (!formData.date) return { success: false, error: "Date is required" };

    // ✅ CORRECT: Passing flat data, no Prisma relation syntax
    await dbLayer.updateExpense(id, {
      categoryId: formData.categoryId,
      amount: formData.amount,
      date: new Date(formData.date),
      paymentMethod: formData.paymentMethod,
    });

    revalidatePath("/");
    revalidatePath("/reports");
    return { success: true };
  } catch (error) {
    console.error("Server Action Error [updateExpense]:", error);
    return { success: false, error: "Failed to update expense" };
  }
}

export async function deleteExpense(id: string) {
  try {
    if (!id) return { success: false, error: "Expense ID is required" };

    await dbLayer.deleteExpense(id);

    revalidatePath("/");
    revalidatePath("/reports");
    return { success: true };
  } catch (error) {
    console.error("Server Action Error [deleteExpense]:", error);
    return { success: false, error: "Failed to delete expense" };
  }
}
