"use server";

import { chatCompletion } from "./client";
import { QUOTATION_SYSTEM } from "./prompts";

export async function generateQuotation(requirements: {
  customerName: string;
  projectType: string;
  dimensions?: string;
  material?: string;
  quantity?: number;
  additionalNotes?: string;
}) {
  try {
    const result = await chatCompletion([
      { role: "system", content: QUOTATION_SYSTEM },
      { role: "user", content: JSON.stringify(requirements) },
    ]);
    return JSON.parse(result) as {
      items: Array<{ description: string; quantity: number; unit: string; unitPrice: number; total: number }>;
      subtotal: number;
      notes: string;
      validDays: number;
    };
  } catch (e) {
    console.error("AI quotation generation failed:", e);
    return null;
  }
}
