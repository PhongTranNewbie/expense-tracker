import { prisma } from "./db";

export async function getExpenses() {
  try {
    const expenses = await prisma.expense.findMany({
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
    });
    return expense;
  } catch (error) {
    console.error(`Error fetching expense with id ${id}:`, error);
    throw new Error("Failed to fetch expense");
  }
}
