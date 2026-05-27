import { prisma } from "@/lib/db";

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

interface CategoryData {
  name: string;
}

export async function createCategory(data: CategoryData) {
  try {
    return await prisma.category.create({
      data: {
        name: data.name,
      },
    });
  } catch (error) {
    console.error("Database error in createCategory:", error);
    throw error;
  }
}

export async function updateCategory(id: string, data: CategoryData) {
  try {
    return await prisma.category.update({
      where: { id },
      data: {
        name: data.name,
      },
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
