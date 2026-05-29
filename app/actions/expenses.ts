"use server";

import { revalidatePath } from "next/cache";
import * as dbLayer from "@/lib/expenses";
import { createExpenseSchema, updateExpenseSchema } from "@/lib/validations/expense-schema";

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
    // Validate input using Zod schema
    const validation = createExpenseSchema.safeParse(formData);
    
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      return { success: false, error: firstError.message };
    }

    const validatedData = validation.data;

    // Call the underlying database operation from lib
    // ✅ CORRECT: Passing flat data, no Prisma relation syntax
    await dbLayer.createExpense({
      categoryId: validatedData.categoryId,
      amount: validatedData.amount,
      date: new Date(validatedData.date),
      paymentMethod: validatedData.paymentMethod,
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
    // Validate expense ID
    if (!id) return { success: false, error: "Expense ID is required" };

    // Validate input using Zod schema
    const validation = updateExpenseSchema.safeParse(formData);
    
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      return { success: false, error: firstError.message };
    }

    const validatedData = validation.data;

    // ✅ CORRECT: Passing flat data, no Prisma relation syntax
    await dbLayer.updateExpense(id, {
      categoryId: validatedData.categoryId,
      amount: validatedData.amount,
      date: new Date(validatedData.date),
      paymentMethod: validatedData.paymentMethod,
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
