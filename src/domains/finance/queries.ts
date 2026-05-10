import { prisma } from "@/lib/prisma";

export function getExpenses(projectId?: string) {
  return prisma.expense.findMany({
    where: projectId ? { projectId } : undefined,
    orderBy: { createdAt: "desc" },
    include: { project: { select: { id: true, name: true } } },
  });
}

export function getExpenseById(id: string) {
  return prisma.expense.findUnique({
    where: { id },
    include: { project: { select: { id: true, name: true } } },
  });
}

export function getExpenseCategories() {
  return prisma.expense.groupBy({ by: ["category"], _sum: { amount: true }, orderBy: { category: "asc" } });
}
