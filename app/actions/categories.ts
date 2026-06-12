"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import * as dbLayer from "@/lib/categories";
import { createCategorySchema, updateCategorySchema } from "@/lib/validations/category-schema";

/**
 * Server Actions Layer acting as the secure bridge between Client UI and Database Layer.
 * Manages mutations, data stabilization, and UI cache revalidation.
 */
async function getCurrentUserId() {
  const session = await auth();
  return session?.user?.id;
}

export async function createCategoryAction(name: string) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate input using Zod schema
    const validation = createCategorySchema.safeParse({ name });
    
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      return { success: false, error: firstError.message };
    }

    const validatedData = validation.data;

    // Check for duplicate category (case-insensitive)
    const existingCategories = await dbLayer.getCategories(userId);
    const normalizedName = validatedData.name.toLowerCase();
    const isDuplicate = existingCategories.some(
      (cat) => cat.name.toLowerCase() === normalizedName
    );

    if (isDuplicate) {
      return { success: false, error: "A category with this name already exists" };
    }

    // Call the underlying database operation from lib
    const category = await dbLayer.createCategory(userId, { name: validatedData.name });
    
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
    const userId = await getCurrentUserId();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate category ID
    if (!id) return { success: false, error: "Category ID is required" };

    // Validate input using Zod schema
    const validation = updateCategorySchema.safeParse({ name });
    
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      return { success: false, error: firstError.message };
    }

    const validatedData = validation.data;

    // Check for duplicate category (case-insensitive), excluding current category
    const existingCategories = await dbLayer.getCategories(userId);
    const normalizedName = validatedData.name.toLowerCase();
    const isDuplicate = existingCategories.some(
      (cat) => cat.id !== id && cat.name.toLowerCase() === normalizedName
    );

    if (isDuplicate) {
      return { success: false, error: "A category with this name already exists" };
    }

    const category = await dbLayer.updateCategory(userId, id, { name: validatedData.name });
    
    revalidatePath("/categories");
    return { success: true, data: category };
  } catch (error) {
    console.error("Server Action Error [updateCategoryAction]:", error);
    return { success: false, error: "Failed to update category" };
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    if (!id) return { success: false, error: "Category ID is required" };

    const category = await dbLayer.deleteCategory(userId, id);
    
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
