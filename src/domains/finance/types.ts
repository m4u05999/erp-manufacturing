import { z } from "zod";

export const expenseSchema = z.object({
  projectId: z.string().optional(),
  category: z.string().min(1),
  description: z.string().min(1),
  amount: z.number().positive(),
  receiptUrl: z.string().optional(),
});

export type ExpenseInput = z.infer<typeof expenseSchema>;
