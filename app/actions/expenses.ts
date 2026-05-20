"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

export async function createExpense(formData: {
  category: string;     // Tên danh mục (ví dụ: "Ăn uống") để phục vụ code hiển thị cũ
  categoryId: string;   // ID danh mục từ bảng Category mới để tạo liên kết chuẩn
  amount: number;
  date: string;
  paymentMethod: string;
}) {
  try {
    await prisma.expense.create({
      data: {
        categoryId: formData.categoryId, // Lưu ID liên kết xuống DB
        amount: formData.amount,
        date: new Date(formData.date),
        paymentMethod: formData.paymentMethod,
      },
    });

    revalidatePath("/");
    revalidatePath("/reports");
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
    categoryId: string;
    amount: number;
    date: string;
    paymentMethod: string;
  }
) {
  try {
    await prisma.expense.update({
      where: { id },
      data: {
        categoryId: formData.categoryId, // Cập nhật lại ID liên kết mới
        amount: formData.amount,
        date: new Date(formData.date),
        paymentMethod: formData.paymentMethod,
      },
    });

    revalidatePath("/");
    revalidatePath("/reports");
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
    revalidatePath("/reports");
    return { success: true };
  } catch (error) {
    console.error("Error deleting expense:", error);
    return { success: false, error: "Failed to delete expense" };
  }
}