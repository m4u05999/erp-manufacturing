import { z } from "zod";

export const productionOrderSchema = z.object({
  projectId: z.string().optional(),
  productName: z.string().min(1),
  quantity: z.number().positive(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  scheduledDate: z.string().optional(),
  notes: z.string().optional(),
  assignedTo: z.string().optional(),
});

export const qualityCheckSchema = z.object({
  productionOrderId: z.string(),
  stage: z.string().min(1),
  passed: z.boolean(),
  notes: z.string().optional(),
});

export type ProductionOrderInput = z.infer<typeof productionOrderSchema>;
export type QualityCheckInput = z.infer<typeof qualityCheckSchema>;
