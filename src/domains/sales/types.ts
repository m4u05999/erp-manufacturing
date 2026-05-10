import { z } from "zod";

export const leadSchema = z.object({
  companyName: z.string().min(1),
  contactName: z.string().min(1),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  source: z.string().optional(),
  notes: z.string().optional(),
});

export const quotationSchema = z.object({
  leadId: z.string(),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number().positive(),
    unitPrice: z.number().min(0),
  })),
  discount: z.number().min(0).optional(),
  taxRate: z.number().min(0).optional(),
  validUntil: z.string().optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;
export type QuotationInput = z.infer<typeof quotationSchema>;
