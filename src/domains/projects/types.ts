import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  leadId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  budget: z.number().positive().optional(),
  location: z.string().optional(),
  clientName: z.string().optional(),
  clientPhone: z.string().optional(),
});

export const taskSchema = z.object({
  projectId: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  assigneeId: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
});

export const dailyReportSchema = z.object({
  projectId: z.string(),
  summary: z.string().min(1),
  weather: z.string().optional(),
  delays: z.string().optional(),
  notes: z.string().optional(),
});

export type ProjectInput = z.infer<typeof projectSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
export type DailyReportInput = z.infer<typeof dailyReportSchema>;
