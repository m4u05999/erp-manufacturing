import { getSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getT } from "@/core/i18n/server";

export const dynamic = "force-dynamic";

export default async function QuotationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const t = await getT();

  const { id } = await params;
  const quotation = await prisma.quotation.findUnique({
    where: { id },
    include: { lead: { select: { companyName: true, contactName: true, contactEmail: true, contactPhone: true } } },
  });
  if (!quotation) notFound();

  const items = quotation.items as Array<{ description: string; quantity: number; unitPrice: number; unit?: string }>;

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-4 flex items-center justify-between print:hidden">
        <Link href={`/dashboard/sales/leads/${quotation.leadId}`} className="text-sm text-zinc-500 hover:text-zinc-900">&larr; Back</Link>
        <button onClick={() => window.print()} className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800">{t.common.printPDF}</button>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-8">
        <div className="flex items-start justify-between border-b border-zinc-200 pb-6">
          <div>
            <h1 className="text-2xl font-semibold">{quotation.quoteNumber}</h1>
            <p className="mt-1 text-sm text-zinc-500">{`${t.hr.date}: ${new Date(quotation.createdAt).toLocaleDateString()}`}</p>
          </div>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">{quotation.status}</span>
        </div>

        <div className="mt-6">
          <h2 className="text-sm font-medium text-zinc-500 mb-1">{t.sales.client}</h2>
          <p className="font-medium">{quotation.lead.companyName}</p>
          <p className="text-sm text-zinc-600">{quotation.lead.contactName}</p>
          {quotation.lead.contactEmail && <p className="text-sm text-zinc-500">{quotation.lead.contactEmail}</p>}
          {quotation.lead.contactPhone && <p className="text-sm text-zinc-500">{quotation.lead.contactPhone}</p>}
        </div>

        <table className="mt-6 w-full border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-sm text-zinc-500">
              <th className="pb-2 font-medium">{t.common.description}</th>
              <th className="pb-2 font-medium">{t.production.quantity}</th>
              <th className="pb-2 font-medium">{t.common.unitPrice}</th>
              <th className="pb-2 text-right font-medium">{t.common.total}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-b border-zinc-100 text-sm">
                <td className="py-3">{item.description}</td>
                <td className="py-3">{item.quantity} {item.unit || t.inventory.pcs}</td>
                <td className="py-3">{Number(item.unitPrice).toLocaleString()} SAR</td>
                <td className="py-3 text-right">{(item.quantity * item.unitPrice).toLocaleString()} SAR</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 space-y-1 border-t border-zinc-200 pt-4 text-sm">
          {quotation.discount > 0 && (
            <div className="flex justify-between"><span>{t.common.discount}</span><span>-{Number(quotation.discount).toLocaleString()} SAR</span></div>
          )}
          {quotation.taxRate > 0 && (
            <div className="flex justify-between"><span>{t.common.taxWithRate.replace("{rate}", String(quotation.taxRate))}</span><span>{((Number(quotation.subtotal) - Number(quotation.discount)) * Number(quotation.taxRate) / 100).toLocaleString()} SAR</span></div>
          )}
          <div className="flex justify-between text-lg font-semibold pt-2 border-t border-zinc-200">
            <span>{t.common.total}</span>
            <span>{Number(quotation.total).toLocaleString()} SAR</span>
          </div>
        </div>

        {quotation.validUntil && (
          <p className="mt-4 text-xs text-zinc-400">{`${t.common.validUntil}: ${new Date(quotation.validUntil).toLocaleDateString()}`}</p>
        )}
      </div>
    </div>
  );
}
