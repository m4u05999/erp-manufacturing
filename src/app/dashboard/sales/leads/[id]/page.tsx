import { getSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";
import Link from "next/link";
import { updateLeadStage } from "@/domains/sales/actions";
import { scoreLead } from "@/core/ai/lead-scoring";
import { getT } from "@/core/i18n/server";

const STAGES = ["LEAD", "QUALIFIED", "QUOTATION", "NEGOTIATION", "CLOSED_WON", "CLOSED_LOST"];

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const t = await getT();

  const STAGE_LABELS: Record<string, string> = {
    LEAD: t.sales.stageLead, QUALIFIED: t.sales.stageQualified, QUOTATION: t.sales.stageQuotation,
    NEGOTIATION: t.sales.stageNegotiation, CLOSED_WON: t.sales.stageWon, CLOSED_LOST: t.sales.stageLost,
  };

  const { id } = await params;
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: { quotations: { orderBy: { createdAt: "desc" } } },
  });
  if (!lead) notFound();

  return (
    <div className="p-6 max-w-3xl">
      <Link href="/dashboard/sales" className="text-sm text-zinc-500 hover:text-zinc-900">&larr; {t.sales.pipeline}</Link>

      <div className="mt-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{lead.companyName}</h1>
          <p className="text-zinc-500">{lead.contactName} · {lead.contactEmail} · {lead.contactPhone}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${
          lead.stage === "CLOSED_WON" ? "bg-green-100 text-green-700" :
          lead.stage === "CLOSED_LOST" ? "bg-red-100 text-red-700" :
          "bg-blue-100 text-blue-700"
        }`}>
          {STAGE_LABELS[lead.stage]}
        </span>
      </div>

      <div className="mt-6">
        <p className="text-sm text-zinc-500">{`${t.sales.source}: ${lead.source || "—"}`}</p>
        {lead.estimatedValue && (
          <p className="mt-1 text-sm text-zinc-500">{`${t.sales.estimatedValue}: ${Number(lead.estimatedValue).toLocaleString()} SAR`}</p>
        )}
        <p className="mt-1 text-sm text-zinc-500">{`${t.sales.score}: ${lead.score}`}</p>
        {lead.notes && <p className="mt-3 text-sm text-zinc-600">{lead.notes}</p>}
      </div>

      <div className="mt-6">
        <h2 className="mb-2 text-sm font-medium text-zinc-700">{t.sales.moveToStage}</h2>
        <div className="flex flex-wrap gap-2">
          {STAGES.map((stage) => (
            <form
              key={stage}
              action={async () => {
                "use server";
                await updateLeadStage(lead.id, stage);
                redirect(`/dashboard/sales/leads/${lead.id}`);
              }}
            >
              <button
                type="submit"
                disabled={lead.stage === stage}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  lead.stage === stage
                    ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                }`}
              >
                {STAGE_LABELS[stage]}
              </button>
            </form>
          ))}
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-zinc-200 p-4">
        <h2 className="text-lg font-medium mb-2">{t.ai.analyze}</h2>
        {lead.score > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-3">
              <span className={`text-sm font-medium ${lead.score >= 70 ? "text-green-600" : lead.score >= 40 ? "text-yellow-600" : "text-red-600"}`}>
                {`${t.sales.score}: ${lead.score}/100`}
              </span>
              <div className="h-2 flex-1 rounded-full bg-zinc-100">
                <div className={`h-2 rounded-full ${lead.score >= 70 ? "bg-green-500" : lead.score >= 40 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${lead.score}%` }} />
              </div>
            </div>
          </div>
        )}
        <form
          action={async () => {
            "use server";
            await (await import("@/core/ai/lead-scoring")).scoreLeadAndSave(lead.id, {
              companyName: lead.companyName,
              contactName: lead.contactName,
              contactEmail: lead.contactEmail,
              contactPhone: lead.contactPhone,
              source: lead.source,
              notes: lead.notes,
              estimatedValue: lead.estimatedValue,
            });
            redirect(`/dashboard/sales/leads/${lead.id}`);
          }}
        >
          <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
            {lead.score > 0 ? t.ai.reanalyze : t.ai.analyze}
          </button>
        </form>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">{t.sales.quotation}</h2>
          <Link
            href={`/dashboard/sales/quotations/new?leadId=${lead.id}`}
            className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs text-white hover:bg-zinc-800"
          >
            + {t.sales.newQuotation}
          </Link>
        </div>
        {lead.quotations.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-400">{t.sales.noQuotations}</p>
        ) : (
          <div className="mt-3 space-y-2">
            {lead.quotations.map((q) => (
              <div key={q.id} className="rounded-lg border border-zinc-200 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{q.quoteNumber}</span>
                  <span className="text-xs text-zinc-400">{q.status}</span>
                </div>
                <p className="mt-1 text-sm font-medium">{Number(q.total).toLocaleString()} SAR</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
