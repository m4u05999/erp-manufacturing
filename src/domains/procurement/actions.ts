"use server";

import { prisma } from "@/lib/prisma";
import { purchaseOrderSchema, inventoryItemSchema, type SupplierInput, type PurchaseOrderInput, type InventoryItemInput } from "./types";
import { writeAuditLog } from "@/core/audit/service";
import { revalidatePath } from "next/cache";

export async function createSupplier(data: SupplierInput) {
  const supplier = await prisma.supplier.create({ data });
  await writeAuditLog({ action: "CREATE", entity: "Supplier", entityId: supplier.id });
  revalidatePath("/dashboard/procurement");
  return supplier;
}

export async function createPurchaseOrder(data: PurchaseOrderInput) {
  const parsed = purchaseOrderSchema.parse(data);
  const totalAmount = parsed.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const count = await prisma.purchaseOrder.count();
  const po = await prisma.purchaseOrder.create({
    data: {
      poNumber: `PO-${String(count + 1).padStart(4, "0")}`,
      supplierId: parsed.supplierId,
      projectId: parsed.projectId ?? null,
      items: parsed.items,
      totalAmount,
      expectedDate: parsed.expectedDate ? new Date(parsed.expectedDate) : null,
      notes: parsed.notes,
    },
  });
  await writeAuditLog({ action: "CREATE", entity: "PurchaseOrder", entityId: po.id });
  revalidatePath("/dashboard/procurement");
  return po;
}

export async function receivePurchaseOrder(id: string) {
  const po = await prisma.purchaseOrder.update({
    where: { id },
    data: { status: "RECEIVED", receivedDate: new Date() },
  });
  const { createNotification } = await import("@/core/notifications/service");
  const admins = await prisma.user.findMany({ where: { role: { in: ["ADMIN", "MANAGER"] } }, select: { id: true } });
  await Promise.all(admins.map((u) =>
    createNotification({
      userId: u.id,
      title: `PO received: ${po.poNumber}`,
      message: `Purchase order from supplier has been received`,
      type: "po_received",
      link: `/dashboard/procurement`,
    }),
  ));
  revalidatePath("/dashboard/procurement");
  return po;
}

export async function createInventoryItem(data: InventoryItemInput) {
  const parsed = inventoryItemSchema.parse(data);
  const item = await prisma.inventoryItem.create({ data: parsed });
  revalidatePath("/dashboard/procurement");
  return item;
}
