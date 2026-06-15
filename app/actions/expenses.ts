"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import * as dbLayer from "@/lib/expenses";
import {
  createExpenseSchema,
  updateExpenseSchema,
  type CreateExpenseInput,
  type UpdateExpenseInput,
} from "@/lib/validations/expense-schema";

/**
 * Server Actions Layer acting as the secure bridge between Client UI and Database Layer.
 * Manages mutations, data stabilization, and UI cache revalidation.
 */
async function getCurrentUserId() {
  const session = await auth();
  return session?.user?.id;
}

export async function createExpense(formData: CreateExpenseInput) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate input using Zod schema
    const validation = createExpenseSchema.safeParse(formData);
    
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      return { success: false, error: firstError.message };
    }

    const validatedData = validation.data;

    // Call the underlying database operation from lib
    // ✅ CORRECT: Passing flat data, no Prisma relation syntax
    const expense = await dbLayer.createExpense(userId, {
      categoryId: validatedData.categoryId,
      amount: validatedData.amount,
      date: new Date(validatedData.date),
      paymentMethod: validatedData.paymentMethod,
    });

    // Clear next.js path cache to reflect changes immediately on UI
    revalidatePath("/");
    revalidatePath("/reports");
    return { success: true, data: expense };
  } catch (error) {
    console.error("Server Action Error [createExpense]:", error);
    return { success: false, error: "Failed to create expense" };
  }
}

export async function updateExpense(
  id: string,
  formData: UpdateExpenseInput
) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

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
    await dbLayer.updateExpense(userId, id, {
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
    const userId = await getCurrentUserId();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    if (!id) return { success: false, error: "Expense ID is required" };

    await dbLayer.deleteExpense(userId, id);

    revalidatePath("/");
    revalidatePath("/reports");
    return { success: true };
  } catch (error) {
    console.error("Server Action Error [deleteExpense]:", error);
    return { success: false, error: "Failed to delete expense" };
  }
}
