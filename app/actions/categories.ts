"use server";

import { revalidatePath } from "next/cache";
import * as dbLayer from "@/lib/categories";
import { getCategories } from "@/lib/categories";

/**
 * Server Actions Layer acting as the secure bridge between Client UI and Database Layer.
 * Manages mutations, data stabilization, and UI cache revalidation.
 */

export async function createCategoryAction(name: string) {
  try {
    if (!name || name.trim() === "") {
      return { success: false, error: "Category name cannot be empty" };
    }

    // Call the underlying database operation from lib
    const category = await dbLayer.createCategory({ name: name.trim() });
    
    // Clear next.js path cache to reflect changes immediately on UI
    revalidatePath("/categories");
    return { success: true, data: category };
  } catch (error) {
    console.error("Server Action Error [createCategoryAction]:", error);
    return { success: false, error: "Failed to create category" };
  }
}

export async function updateCategoryAction(id: string, name: string) {
  try {
    if (!id) return { success: false, error: "Category ID is required" };
    if (!name || name.trim() === "") return { success: false, error: "Category name cannot be empty" };

    const category = await dbLayer.updateCategory(id, { name: name.trim() });
    
    revalidatePath("/categories");
    return { success: true, data: category };
  } catch (error) {
    console.error("Server Action Error [updateCategoryAction]:", error);
    return { success: false, error: "Failed to update category" };
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    if (!id) return { success: false, error: "Category ID is required" };

    const category = await dbLayer.deleteCategory(id);
    
    revalidatePath("/categories");
    return { success: true, data: category };
  } catch (error) {
    // Elegant check for Prisma foreign key constraint violations
    if (error instanceof Error && error.message.includes("Constraint failed")) {
      return { success: false, error: "Cannot delete category because it is currently linked to existing expenses" };
    }
    
    console.error("Server Action Error [deleteCategoryAction]:", error);
    return { success: false, error: "Failed to delete category due to a system error" };
  }
}

export async function getCategoriesAction() {
  try {
    const data = await getCategories();
    return { success: true, data };
  } catch (error) {
    console.error("Failed to fetch categories via action:", error);
    return { success: false, data: [], error: "Failed to fetch categories" };
  }
}