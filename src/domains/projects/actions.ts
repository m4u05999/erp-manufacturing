"use server";

import { prisma } from "@/lib/prisma";
import { projectSchema, taskSchema, dailyReportSchema, type ProjectInput } from "./types";
import { writeAuditLog } from "@/core/audit/service";
import { revalidatePath } from "next/cache";

export async function createProject(data: ProjectInput) {
  const parsed = projectSchema.parse(data);
  const project = await prisma.project.create({
    data: {
      ...parsed,
      startDate: parsed.startDate ? new Date(parsed.startDate) : null,
      endDate: parsed.endDate ? new Date(parsed.endDate) : null,
      budget: parsed.budget ?? null,
    },
  });
  await writeAuditLog({ action: "CREATE", entity: "Project", entityId: project.id });
  revalidatePath("/dashboard/projects");
  return project;
}

export async function createTask(data: unknown) {
  const parsed = taskSchema.parse(data);
  const task = await prisma.task.create({
    data: {
      ...parsed,
      dueDate: parsed.dueDate ? new Date(parsed.dueDate) : null,
    },
  });
  revalidatePath("/dashboard/projects");
  return task;
}

export async function createDailyReport(data: unknown) {
  const parsed = dailyReportSchema.parse(data);
  const report = await prisma.dailyReport.create({ data: parsed });
  revalidatePath("/dashboard/projects");
  return report;
}
