"use server";

import { prisma } from "@/lib/prisma";
import { productionOrderSchema, qualityCheckSchema, type ProductionOrderInput } from "./types";
import { writeAuditLog } from "@/core/audit/service";
import { revalidatePath } from "next/cache";

export async function createProductionOrder(data: ProductionOrderInput) {
  const parsed = productionOrderSchema.parse(data);
  const count = await prisma.productionOrder.count();
  const order = await prisma.productionOrder.create({
    data: {
      orderNumber: `MFG-${String(count + 1).padStart(4, "0")}`,
      projectId: parsed.projectId ?? null,
      productName: parsed.productName,
      quantity: parsed.quantity,
      priority: parsed.priority ?? "MEDIUM",
      scheduledDate: parsed.scheduledDate ? new Date(parsed.scheduledDate) : null,
      notes: parsed.notes,
      assignedTo: parsed.assignedTo,
    },
  });
  await writeAuditLog({ action: "CREATE", entity: "ProductionOrder", entityId: order.id });
  revalidatePath("/dashboard/production");
  return order;
}

export async function completeProductionOrder(id: string) {
  const order = await prisma.productionOrder.update({
    where: { id },
    data: { status: "COMPLETED", completedDate: new Date() },
  });
  revalidatePath("/dashboard/production");
  return order;
}

export async function recordQualityCheck(data: unknown) {
  const parsed = qualityCheckSchema.parse(data);
  const check = await prisma.qualityCheck.create({ data: parsed });
  revalidatePath("/dashboard/production");
  return check;
}
