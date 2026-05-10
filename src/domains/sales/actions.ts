"use server";

import { prisma } from "@/lib/prisma";
import { leadSchema, quotationSchema, type LeadInput } from "./types";
import { writeAuditLog } from "@/core/audit/service";
import { revalidatePath } from "next/cache";

export async function createLead(data: LeadInput) {
  const parsed = leadSchema.parse(data);
  const lead = await prisma.lead.create({ data: parsed });
  await writeAuditLog({ action: "CREATE", entity: "Lead", entityId: lead.id });
  revalidatePath("/dashboard/sales");
  return lead;
}

export async function updateLeadStage(id: string, stage: string) {
  const lead = await prisma.lead.update({
    where: { id },
    data: { stage: stage as any },
  });
  await writeAuditLog({ action: "UPDATE", entity: "Lead", entityId: id, metadata: { stage } });
  const { createNotification } = await import("@/core/notifications/service");
  const recipients = lead.assignedTo
    ? [lead.assignedTo]
    : (await prisma.user.findMany({ where: { role: { in: ["ADMIN", "MANAGER"] } }, select: { id: true } })).map((u) => u.id);
  await Promise.all(recipients.map((userId) =>
    createNotification({
      userId,
      title: `Lead stage changed: ${lead.companyName}`,
      message: `Moved to ${stage}`,
      type: "lead_stage",
      link: `/dashboard/sales/leads/${lead.id}`,
    }),
  ));
  revalidatePath("/dashboard/sales");
  return lead;
}

export async function createQuotation(data: unknown) {
  const parsed = quotationSchema.parse(data);
  const subtotal = parsed.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const discount = parsed.discount ?? 0;
  const taxRate = parsed.taxRate ?? 0;
  const afterDiscount = subtotal - discount;
  const total = afterDiscount + afterDiscount * (taxRate / 100);
  const count = await prisma.quotation.count();
  const quotation = await prisma.quotation.create({
    data: {
      leadId: parsed.leadId,
      quoteNumber: `Q-${String(count + 1).padStart(4, "0")}`,
      items: parsed.items,
      subtotal,
      discount,
      taxRate,
      total,
      validUntil: parsed.validUntil ? new Date(parsed.validUntil) : null,
    },
  });
  await writeAuditLog({ action: "CREATE", entity: "Quotation", entityId: quotation.id });
  revalidatePath("/dashboard/sales");
  return quotation;
}
