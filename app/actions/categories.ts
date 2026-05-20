"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

// Create a new category
export async function createCategory(name: string) {
  try {
    const category = await db.category.create({
      data: {
        name,
      },
    });
    revalidatePath("/categories");
    return { success: true, data: JSON.parse(JSON.stringify(category)) };
  } catch (error) {
    console.error("Error creating category:", error);
    return { success: false, error: "Failed to create category" };
  }
}

// Get all categories
export async function getCategories() {
  try {
    const categories = await db.category.findMany({
      orderBy: {
        name: "asc",
      },
    });
    return { success: true, data: categories };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { success: false, error: "Failed to fetch categories" };
  }
}

// Update a category
export async function updateCategory(id: string, name: string) {
  try {
    const category = await db.category.update({
      where: { id },
      data: { name },
    });
    revalidatePath("/categories");
    return { success: true, data: category };
  } catch (error) {
    console.error("Error updating category:", error);
    return { success: false, error: "Failed to update category" };
  }
}

// Delete a category
export async function deleteCategory(id: string) {
  try {
    const category = await db.category.delete({
      where: { id },
    });
    revalidatePath("/categories");
    return { success: true, data: category };
  } catch (error) {
    // Check if error is due to foreign key constraint (category in use)
    if (error instanceof Error && error.message.includes('Constraint failed')) {
      return { success: false, error: "Cannot delete category because it is in use" };
    }
    console.error("Error deleting category:", error);
    return { success: false, error: "Failed to delete category" };
  }
}