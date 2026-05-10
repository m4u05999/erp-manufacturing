"use server";

import { prisma } from "@/lib/prisma";
import { expenseSchema, type ExpenseInput } from "./types";
import { writeAuditLog } from "@/core/audit/service";
import { revalidatePath } from "next/cache";

export async function createExpense(data: ExpenseInput) {
  const parsed = expenseSchema.parse(data);
  const expense = await prisma.expense.create({ data: parsed });
  await writeAuditLog({ action: "CREATE", entity: "Expense", entityId: expense.id });
  revalidatePath("/dashboard/finance");
  return expense;
}
