import { prisma } from "@/lib/db";

/**
 * Pure Database Queries Layer for Categories.
 * No edge-case handling for UI, no caching revalidation.
 */

export async function getCategories(userId: string) {
  try {
    return await prisma.category.findMany({
      where: {
        userId,
      },
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

export async function createCategory(userId: string, data: CategoryData) {
  try {
    return await prisma.category.create({
      data: {
        name: data.name,
        userId,
      },
    });
  } catch (error) {
    console.error("Database error in createCategory:", error);
    throw error;
  }
}

export async function updateCategory(
  userId: string,
  id: string,
  data: CategoryData
) {
  try {
    const result = await prisma.category.updateMany({
      where: {
        id,
        userId,
      },
      data: {
        name: data.name,
      },
    });

    if (result.count === 0) {
      throw new Error("Category not found");
    }

    return await prisma.category.findFirstOrThrow({
      where: {
        id,
        userId,
      },
    });
  } catch (error) {
    console.error("Database error in updateCategory:", error);
    throw error;
  }
}

export async function deleteCategory(userId: string, id: string) {
  try {
    const category = await prisma.category.findFirstOrThrow({
      where: {
        id,
        userId,
      },
    });

    await prisma.category.delete({
      where: {
        id: category.id,
      },
    });

    return category;
  } catch (error) {
    console.error("Database error in deleteCategory:", error);
    throw error;
  }
}
