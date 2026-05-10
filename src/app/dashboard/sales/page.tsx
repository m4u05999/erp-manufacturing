import { getSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { getT } from "@/core/i18n/server";

const STAGES = ["LEAD", "QUALIFIED", "QUOTATION", "NEGOTIATION", "CLOSED_WON", "CLOSED_LOST"] as const;

export default async function SalesPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const t = await getT();

  const STAGE_LABELS: Record<string, string> = {
    LEAD: t.sales.stageLead, QUALIFIED: t.sales.stageQualified, QUOTATION: t.sales.stageQuotation,
    NEGOTIATION: t.sales.stageNegotiation, CLOSED_WON: t.sales.stageWon, CLOSED_LOST: t.sales.stageLost,
  };

  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    include: { quotations: { take: 1 }, assignedUser: { select: { name: true } } },
  });

  const grouped = STAGES.reduce((acc, stage) => {
    acc[stage] = leads.filter((l) => l.stage === stage);
    return acc;
  }, {} as Record<string, typeof leads>);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t.sales.pipeline}</h1>
        <Link
          href="/dashboard/sales/leads/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800"
        >
          + {t.sales.newLead}
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => (
          <div key={stage} className="min-w-[260px] flex-shrink-0">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-medium text-zinc-700">{STAGE_LABELS[stage]}</h2>
              <span className="text-xs text-zinc-400">{grouped[stage].length}</span>
            </div>
            <div className="flex flex-col gap-3">
              {grouped[stage].map((lead) => (
                <LeadCard key={lead.id} lead={lead} t={t} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LeadCard({ lead, t }: { lead: any; t: any }) {
  return (
    <Link
      href={`/dashboard/sales/leads/${lead.id}`}
      className="block rounded-lg border border-zinc-200 bg-white p-4 transition hover:shadow-sm"
    >
      <p className="font-medium text-zinc-900">{lead.companyName}</p>
      <p className="mt-1 text-xs text-zinc-500">{lead.contactName}</p>
      {lead.estimatedValue && (
        <p className="mt-2 text-sm font-medium text-zinc-700">
          {Number(lead.estimatedValue).toLocaleString()} SAR
        </p>
      )}
      <div className="mt-2 flex items-center gap-2">
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          lead.score >= 70 ? "bg-green-100 text-green-700" :
          lead.score >= 40 ? "bg-yellow-100 text-yellow-700" :
          "bg-zinc-100 text-zinc-600"
        }`}>
          {`${t.sales.score} ${lead.score}`}
        </span>
      </div>
    </Link>
  );
}
