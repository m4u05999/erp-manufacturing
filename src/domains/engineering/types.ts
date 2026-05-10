import { z } from "zod";

export const drawingSchema = z.object({
  projectId: z.string(),
  title: z.string().min(1),
  fileUrl: z.string().min(1),
  notes: z.string().optional(),
});

export type DrawingInput = z.infer<typeof drawingSchema>;
