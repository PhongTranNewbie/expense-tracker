import { z } from "zod";

/**
 * Category Validation Schemas
 * 
 * Centralized validation rules for category operations.
 * Used by server actions to validate input before calling lib layer.
 */

/**
 * Base category schema with shared validation rules
 */
const baseCategorySchema = z.object({
  name: z
    .string({ message: "Category name is required" })
    .min(1, "Category name cannot be empty")
    .trim()
    .min(2, "Category name must be at least 2 characters")
    .max(50, "Category name must be less than 50 characters"),
});

/**
 * Schema for creating a new category
 */
export const createCategorySchema = baseCategorySchema;

/**
 * Schema for updating an existing category
 */
export const updateCategorySchema = baseCategorySchema;

/**
 * Type inference for create category input
 */
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

/**
 * Type inference for update category input
 */
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
