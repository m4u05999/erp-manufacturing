"use server";

import { prisma } from "@/lib/prisma";
import { drawingSchema, type DrawingInput } from "./types";
import { writeAuditLog } from "@/core/audit/service";
import { revalidatePath } from "next/cache";

export async function createDrawing(data: DrawingInput) {
  const parsed = drawingSchema.parse(data);
  const lastVersion = await prisma.drawing.findFirst({
    where: { projectId: parsed.projectId, title: parsed.title },
    orderBy: { version: "desc" },
    select: { version: true },
  });
  const drawing = await prisma.drawing.create({
    data: { ...parsed, version: (lastVersion?.version ?? 0) + 1 },
  });
  await writeAuditLog({ action: "CREATE", entity: "Drawing", entityId: drawing.id });
  revalidatePath("/dashboard/engineering");
  return drawing;
}
