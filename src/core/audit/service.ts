import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma";

export async function writeAuditLog(params: {
  action: string;
  entity: string;
  entityId?: string;
  userId?: string;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string;
}) {
  await prisma.auditLog.create({ data: params as any }).catch(() => {});
}
