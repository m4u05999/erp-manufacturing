import { z } from "zod";

export const supplierSchema = z.object({
  name: z.string().min(1),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  category: z.string().optional(),
});

export const purchaseOrderSchema = z.object({
  supplierId: z.string(),
  projectId: z.string().optional(),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number().positive(),
    unitPrice: z.number().positive(),
  })),
  expectedDate: z.string().optional(),
  notes: z.string().optional(),
});

export const inventoryItemSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  category: z.string().optional(),
  unit: z.string().optional(),
  minQuantity: z.number().min(0).optional(),
  unitCost: z.number().positive().optional(),
  location: z.string().optional(),
});

export type SupplierInput = z.infer<typeof supplierSchema>;
export type PurchaseOrderInput = z.infer<typeof purchaseOrderSchema>;
export type InventoryItemInput = z.infer<typeof inventoryItemSchema>;
