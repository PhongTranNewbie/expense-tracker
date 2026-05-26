import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

/**
 * Pure Database Queries Layer for Categories.
 * No edge-case handling for UI, no caching revalidation.
 */

export async function getCategories() {
  try {
    return await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    });
  } catch (error) {
    console.error("Database error in getCategories:", error);
    throw new Error("Failed to fetch categories from database");
  }
}

export async function createCategory(data: Prisma.CategoryCreateInput) {
  try {
    return await prisma.category.create({ data });
  } catch (error) {
    console.error("Database error in createCategory:", error);
    throw error;
  }
}

export async function updateCategory(id: string, data: Prisma.CategoryUpdateInput) {
  try {
    return await prisma.category.update({
      where: { id },
      data,
    });
  } catch (error) {
    console.error("Database error in updateCategory:", error);
    throw error;
  }
}

export async function deleteCategory(id: string) {
  try {
    return await prisma.category.delete({
      where: { id },
    });
  } catch (error) {
    console.error("Database error in deleteCategory:", error);
    throw error;
  }
}