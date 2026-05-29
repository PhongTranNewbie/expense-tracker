import { z } from "zod";

/**
 * Expense Validation Schemas
 * 
 * Centralized validation rules for expense operations.
 * Used by server actions to validate input before calling lib layer.
 */

/**
 * Base expense schema with shared validation rules
 */
const baseExpenseSchema = z.object({
  categoryId: z
    .string({ message: "Category is required" })
    .min(1, "Category is required"),
  
  amount: z
    .number({ message: "Amount must be a number" })
    .positive("Amount must be greater than 0")
    .finite("Amount must be a valid number"),
  
  date: z
    .string({ message: "Date is required" })
    .min(1, "Date is required")
    .refine(
      (dateStr) => {
        const date = new Date(dateStr);
        return !isNaN(date.getTime());
      },
      { message: "Invalid date format" }
    ),
  
  paymentMethod: z
    .string({ message: "Payment method is required" })
    .min(1, "Payment method cannot be empty")
    .trim(),
});

/**
 * Schema for creating a new expense
 * Includes optional legacy 'category' field for UI compatibility
 */
export const createExpenseSchema = baseExpenseSchema.extend({
  category: z.string().optional(), // Legacy field for UI compatibility
});

/**
 * Schema for updating an existing expense
 * Includes optional legacy 'category' field for UI compatibility
 */
export const updateExpenseSchema = baseExpenseSchema.extend({
  category: z.string().optional(), // Legacy field for UI compatibility
});

/**
 * Type inference for create expense input
 */
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;

/**
 * Type inference for update expense input
 */
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
