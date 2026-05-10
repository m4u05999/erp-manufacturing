"use server";

import { chatCompletion } from "./client";
import { LEAD_SCORING_SYSTEM } from "./prompts";

export async function scoreLead(lead: {
  companyName: string;
  contactName: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  source?: string | null;
  notes?: string | null;
  estimatedValue?: number | null;
}) {
  try {
    const result = await chatCompletion([
      { role: "system", content: LEAD_SCORING_SYSTEM },
      {
        role: "user",
        content: JSON.stringify({
          companyName: lead.companyName,
          contactName: lead.contactName,
          contactEmail: lead.contactEmail,
          contactPhone: lead.contactPhone,
          source: lead.source,
          notes: lead.notes,
          estimatedValue: lead.estimatedValue,
        }),
      },
    ]);
    return JSON.parse(result) as { score: number; reasoning: string; suggestedAction: string };
  } catch (e) {
    console.error("AI scoring failed:", e);
    return { score: 0, reasoning: "AI scoring unavailable", suggestedAction: "Review manually" };
  }
}

export async function scoreLeadAndSave(leadId: string, lead: Parameters<typeof scoreLead>[0]) {
  const { prisma } = await import("@/lib/prisma");
  const result = await scoreLead(lead);
  await prisma.lead.update({ where: { id: leadId }, data: { score: result.score } });
  return result;
}
