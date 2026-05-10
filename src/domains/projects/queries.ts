import { prisma } from "@/lib/prisma";

export function getProjects(status?: string) {
  return prisma.project.findMany({
    where: status ? { status: status as any } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      manager: { select: { id: true, name: true } },
      _count: { select: { tasks: true, dailyReports: true } },
    },
  });
}

export function getProjectById(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      tasks: { orderBy: { createdAt: "desc" } },
      dailyReports: { orderBy: { reportDate: "desc" }, take: 10 },
      manager: { select: { id: true, name: true } },
    },
  });
}
