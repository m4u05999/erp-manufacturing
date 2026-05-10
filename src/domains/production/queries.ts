import { prisma } from "@/lib/prisma";

export function getProductionOrders(status?: string) {
  return prisma.productionOrder.findMany({
    where: status ? { status: status as any } : undefined,
    orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
    include: {
      project: { select: { id: true, name: true } },
      qualityChecks: true,
      _count: { select: { qualityChecks: true } },
    },
  });
}

export function getProductionOrderById(id: string) {
  return prisma.productionOrder.findUnique({
    where: { id },
    include: {
      qualityChecks: { orderBy: { checkedAt: "desc" } },
      project: { select: { id: true, name: true } },
    },
  });
}
