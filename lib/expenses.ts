import { prisma } from "./db";

/**
 * Pure Database Queries Layer for Expenses.
 * No edge-case handling for UI, no caching revalidation.
 */

export async function getExpenses(userId: string) {
  try {
    const expenses = await prisma.expense.findMany({
      where: {
        userId,
      },
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

export async function getRecentExpenses(userId: string, limit = 5) {
  try {
    return await prisma.expense.findMany({
      where: {
        userId,
      },
      include: {
        category: true,
      },
      orderBy: {
        date: "desc",
      },
      take: limit,
    });
  } catch (error) {
    console.error("Error fetching recent expenses:", error);
    throw new Error("Failed to fetch recent expenses");
  }
}

export async function getExpenseById(userId: string, id: string) {
  try {
    const expense = await prisma.expense.findFirst({
      where: {
        id,
        userId,
      },
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

interface ExpenseData {
  categoryId: string;
  amount: number;
  date: Date;
  paymentMethod: string;
}

async function verifyCategoryOwnership(userId: string, categoryId: string) {
  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
      userId,
    },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  return category;
}

export async function createExpense(userId: string, data: ExpenseData) {
  try {
    await verifyCategoryOwnership(userId, data.categoryId);

    return await prisma.expense.create({
      data: {
        amount: data.amount,
        date: data.date,
        paymentMethod: data.paymentMethod,
        categoryId: data.categoryId,
        userId,
      },
    });
  } catch (error) {
    console.error("Database error in createExpense:", error);
    throw error;
  }
}

export async function updateExpense(userId: string, id: string, data: ExpenseData) {
  try {
    await verifyCategoryOwnership(userId, data.categoryId);

    const result = await prisma.expense.updateMany({
      where: {
        id,
        userId,
      },
      data: {
        amount: data.amount,
        date: data.date,
        paymentMethod: data.paymentMethod,
        categoryId: data.categoryId,
      },
    });

    if (result.count === 0) {
      throw new Error("Expense not found");
    }

    return await prisma.expense.findFirstOrThrow({
      where: {
        id,
        userId,
      },
      include: {
        category: true,
      },
    });
  } catch (error) {
    console.error("Database error in updateExpense:", error);
    throw error;
  }
}

export async function deleteExpense(userId: string, id: string) {
  try {
    const expense = await prisma.expense.findFirstOrThrow({
      where: {
        id,
        userId,
      },
    });

    await prisma.expense.delete({
      where: {
        id: expense.id,
      },
    });

    return expense;
  } catch (error) {
    console.error("Database error in deleteExpense:", error);
    throw error;
  }
}
