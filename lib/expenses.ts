import { prisma } from "./db";

/**
 * Pure Database Queries Layer for Expenses.
 * No edge-case handling for UI, no caching revalidation.
 */

export async function getExpenses() {
  try {
    const expenses = await prisma.expense.findMany({
      include: {
        category: true,
      },
      orderBy: {
        date: "desc",
      },
    });
    return expenses;
  } catch (error) {
    console.error("Error fetching expenses:", error);
    throw new Error("Failed to fetch expenses");
  }
}

export async function getExpenseById(id: string) {
  try {
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });
    return expense;
  } catch (error) {
    console.error(`Error fetching expense with id ${id}:`, error);
    throw new Error("Failed to fetch expense");
  }
}

export async function getReportData() {
  try {
    const expenses = await prisma.expense.findMany({
      include: {
        category: true,
      },
      orderBy: {
        date: "asc",
      },
    });
    return expenses;
  } catch (error) {
    console.error("Error fetching report data:", error);
    throw new Error("Failed to fetch report data");
  }
}

interface ExpenseData {
  categoryId: string;
  amount: number;
  date: Date;
  paymentMethod: string;
}

export async function createExpense(data: ExpenseData) {
  try {
    return await prisma.expense.create({
      data: {
        amount: data.amount,
        date: data.date,
        paymentMethod: data.paymentMethod,
        categoryId: data.categoryId,
      },
    });
  } catch (error) {
    console.error("Database error in createExpense:", error);
    throw error;
  }
}

export async function updateExpense(id: string, data: ExpenseData) {
  try {
    return await prisma.expense.update({
      where: { id },
      data: {
        amount: data.amount,
        date: data.date,
        paymentMethod: data.paymentMethod,
        categoryId: data.categoryId,
      },
    });
  } catch (error) {
    console.error("Database error in updateExpense:", error);
    throw error;
  }
}

export async function deleteExpense(id: string) {
  try {
    return await prisma.expense.delete({
      where: { id },
    });
  } catch (error) {
    console.error("Database error in deleteExpense:", error);
    throw error;
  }
}
