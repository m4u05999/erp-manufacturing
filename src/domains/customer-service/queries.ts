import { prisma } from "@/lib/prisma";

export function getTickets(status?: string) {
  return prisma.supportTicket.findMany({
    where: status ? { status } : undefined,
    orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
    include: {
      project: { select: { id: true, name: true } },
      assignedUser: { select: { id: true, name: true } },
    },
  });
}

export function getTicketById(id: string) {
  return prisma.supportTicket.findUnique({
    where: { id },
    include: {
      project: { select: { id: true, name: true } },
      assignedUser: { select: { id: true, name: true } },
    },
  });
}
