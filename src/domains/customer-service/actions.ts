"use server";

import { prisma } from "@/lib/prisma";
import { supportTicketSchema, type SupportTicketInput } from "./types";
import { writeAuditLog } from "@/core/audit/service";
import { revalidatePath } from "next/cache";

export async function createTicket(data: SupportTicketInput) {
  const parsed = supportTicketSchema.parse(data);
  const ticket = await prisma.supportTicket.create({
    data: {
      projectId: parsed.projectId ?? null,
      customerName: parsed.customerName,
      customerPhone: parsed.customerPhone,
      subject: parsed.subject,
      description: parsed.description,
      category: parsed.category,
      priority: parsed.priority ?? "MEDIUM",
    },
  });
  await writeAuditLog({ action: "CREATE", entity: "SupportTicket", entityId: ticket.id });
  revalidatePath("/dashboard/customer-service");
  return ticket;
}

export async function updateTicketStatus(id: string, status: string) {
  const data: any = { status };
  if (status === "RESOLVED" || status === "CLOSED") data.resolvedAt = new Date();
  const ticket = await prisma.supportTicket.update({ where: { id }, data });
  if (status === "RESOLVED" || status === "CLOSED") {
    const { createNotification } = await import("@/core/notifications/service");
    const recipients = ticket.assignedTo
      ? [ticket.assignedTo]
      : (await prisma.user.findMany({ where: { role: { in: ["ADMIN", "MANAGER"] } }, select: { id: true } })).map((u) => u.id);
    await Promise.all(recipients.map((userId) =>
      createNotification({
        userId,
        title: `Ticket ${status.toLowerCase()}: ${ticket.subject}`,
        message: `Ticket from ${ticket.customerName} was marked as ${status}`,
        type: "ticket_resolved",
        link: `/dashboard/customer-service/${ticket.id}`,
      }),
    ));
  }
  revalidatePath("/dashboard/customer-service");
  return ticket;
}
