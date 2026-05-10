import { prisma } from "@/lib/prisma";

export function getAttendanceRecords(userId?: string, date?: string) {
  return prisma.attendance.findMany({
    where: {
      ...(userId ? { userId } : {}),
      ...(date ? { date: new Date(date) } : {}),
    },
    orderBy: { date: "desc" },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
}

export function getAttendanceById(id: string) {
  return prisma.attendance.findUnique({
    where: { id },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
}

export function getUsers() {
  return prisma.user.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
}
