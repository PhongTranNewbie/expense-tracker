"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

export async function createExpense(formData: {
  category: string;
  amount: number;
  date: string;
  paymentMethod: string;
}) {
  try {
    await prisma.expense.create({
      data: {
        category: formData.category,
        amount: formData.amount,
        date: new Date(formData.date),
        paymentMethod: formData.paymentMethod,
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error creating expense:", error);
    return { success: false, error: "Failed to create expense" };
  }
}

export async function updateExpense(
  id: string,
  formData: {
    category: string;
    amount: number;
    date: string;
    paymentMethod: string;
  }
) {
  try {
    await prisma.expense.update({
      where: { id },
      data: {
        category: formData.category,
        amount: formData.amount,
        date: new Date(formData.date),
        paymentMethod: formData.paymentMethod,
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error updating expense:", error);
    return { success: false, error: "Failed to update expense" };
  }
}

export async function deleteExpense(id: string) {
  try {
    await prisma.expense.delete({
      where: { id },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting expense:", error);
    return { success: false, error: "Failed to delete expense" };
  }
}
