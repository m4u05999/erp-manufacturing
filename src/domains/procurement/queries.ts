import { prisma } from "@/lib/prisma";

export function getSuppliers() {
  return prisma.supplier.findMany({ orderBy: { name: "asc" } });
}

export function getPurchaseOrders(status?: string) {
  return prisma.purchaseOrder.findMany({
    where: status ? { status: status as any } : undefined,
    orderBy: { createdAt: "desc" },
    include: { supplier: { select: { id: true, name: true } } },
  });
}

export function getInventory(category?: string) {
  return prisma.inventoryItem.findMany({
    where: category ? { category } : undefined,
    orderBy: { name: "asc" },
  });
}

export function getLowStockItems() {
  return prisma.inventoryItem.findMany({
    where: { quantity: { lte: prisma.inventoryItem.fields.minQuantity } },
  });
}
