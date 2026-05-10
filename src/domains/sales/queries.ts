import { prisma } from "@/lib/prisma";

export function getLeads(stage?: string) {
  return prisma.lead.findMany({
    where: stage ? { stage: stage as any } : undefined,
    orderBy: { createdAt: "desc" },
    include: { assignedUser: { select: { id: true, name: true } } },
  });
}

export function getLeadById(id: string) {
  return prisma.lead.findUnique({
    where: { id },
    include: { quotations: true, assignedUser: { select: { id: true, name: true } } },
  });
}

export function getQuotations(leadId?: string) {
  return prisma.quotation.findMany({
    where: leadId ? { leadId } : undefined,
    orderBy: { createdAt: "desc" },
  });
}
