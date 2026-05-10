import { z } from "zod";

export const supportTicketSchema = z.object({
  projectId: z.string().optional(),
  customerName: z.string().min(1),
  customerPhone: z.string().optional(),
  subject: z.string().min(1),
  description: z.string().min(1),
  category: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
});

export type SupportTicketInput = z.infer<typeof supportTicketSchema>;
