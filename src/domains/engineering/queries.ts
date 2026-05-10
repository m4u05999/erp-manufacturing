import { prisma } from "@/lib/prisma";

export function getDrawings(projectId?: string) {
  return prisma.drawing.findMany({
    where: projectId ? { projectId } : undefined,
    orderBy: [{ projectId: "asc" }, { version: "desc" }],
    include: { project: { select: { id: true, name: true } } },
  });
}

export function getDrawingById(id: string) {
  return prisma.drawing.findUnique({
    where: { id },
    include: { project: { select: { id: true, name: true } } },
  });
}
