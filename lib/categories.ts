import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getCategories() {
  try {
    const categories = await db.category.findMany({
      orderBy: {
        name: "asc",
      },
    });
    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw new Error("Failed to fetch categories");
  }
}

export async function createCategory(data: Prisma.CategoryCreateInput) {
  try {
    const category = await db.category.create({
      data: {
        ...data,
      },
    });
    revalidatePath("/categories");
    return category;
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
}

export async function updateCategory(id: string, data: Prisma.CategoryUpdateInput) {
  try {
    const category = await db.category.update({
      where: { id },
      data: {
        ...data,
      },
    });
    revalidatePath("/categories");
    return category;
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
}

export async function deleteCategory(id: string) {
  try {
    const category = await db.category.delete({
      where: { id },
    });
    revalidatePath("/categories");
    return category;
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
}