import { getSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { completeProductionOrder, recordQualityCheck } from "@/domains/production/actions";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getT } from "@/core/i18n/server";

export const dynamic = "force-dynamic";

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: "bg-red-100 text-red-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  LOW: "bg-zinc-100 text-zinc-600",
};

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: "bg-green-100 text-green-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-red-100 text-red-700",
  PENDING: "bg-zinc-100 text-zinc-600",
};

export default async function ProductionOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const t = await getT();

  const { id } = await params;
  const order = await prisma.productionOrder.findUnique({
    where: { id },
    include: {
      qualityChecks: { orderBy: { checkedAt: "desc" } },
      project: { select: { id: true, name: true } },
    },
  });
  if (!order) notFound();

  return (
    <div className="p-6 max-w-4xl">
      <Link href="/dashboard/production" className="text-sm text-zinc-500 hover:text-zinc-900">&larr; {t.nav.production}</Link>

      <div className="mt-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{order.orderNumber}</h1>
          <p className="mt-1 text-zinc-600">{order.productName}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[order.status] || "bg-zinc-100 text-zinc-600"}`}>
            {order.status}
          </span>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${PRIORITY_COLORS[order.priority] || "bg-zinc-100 text-zinc-600"}`}>
            {order.priority}
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-sm text-zinc-500">
        <span>{`${t.production.quantity}: ${order.quantity}`}</span>
        {order.project && <span>{`${t.projects.label}: `}<Link href={`/dashboard/projects/${order.project.id}`} className="text-blue-600 hover:underline">{order.project.name}</Link></span>}
        {order.assignedTo && <span>{`${t.common.assignedTo}: ${order.assignedTo}`}</span>}
        {order.scheduledDate && <span>{`${t.production.scheduled}: ${new Date(order.scheduledDate).toLocaleDateString()}`}</span>}
        {order.completedDate && <span>{`${t.production.completed}: ${new Date(order.completedDate).toLocaleDateString()}`}</span>}
      </div>

      {order.notes && (
        <div className="mt-4 rounded-lg border border-zinc-200 p-3">
          <p className="text-xs text-zinc-400 mb-1">{t.common.notes}</p>
          <p className="text-sm text-zinc-600">{order.notes}</p>
        </div>
      )}

      {order.status === "PENDING" && (
        <form
          action={async () => {
            "use server";
            await completeProductionOrder(order.id);
            redirect(`/dashboard/production/${order.id}`);
          }}
          className="mt-6"
        >
          <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
            {t.production.markInProgress}
          </button>
        </form>
      )}

      {order.status === "IN_PROGRESS" && (
        <form
          action={async () => {
            "use server";
            await completeProductionOrder(order.id);
            redirect(`/dashboard/production/${order.id}`);
          }}
          className="mt-6"
        >
          <button type="submit" className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700">
            {t.production.markCompleted}
          </button>
        </form>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-medium mb-3">{t.production.qualityCheck}</h2>

        <form
          action={async (formData: FormData) => {
            "use server";
            await recordQualityCheck({
              productionOrderId: order.id,
              stage: formData.get("stage") as string,
              passed: formData.get("passed") === "true",
              notes: formData.get("notes") as string || undefined,
            });
            redirect(`/dashboard/production/${order.id}`);
          }}
          className="mb-6 rounded-lg border border-zinc-200 p-4 space-y-3"
        >
          <p className="text-sm font-medium text-zinc-700">{t.production.recordCheck}</p>
          <div>
            <label className="mb-1 block text-xs text-zinc-500">{`${t.production.stage} *`}</label>
            <input name="stage" required className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" placeholder={t.production.stagePlaceholder} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-500">{t.common.result}</label>
            <select name="passed" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm">
              <option value="true">{t.production.passed}</option>
              <option value="false">{t.production.failed}</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-500">{t.common.notes}</label>
            <textarea name="notes" rows={2} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
          </div>
          <button type="submit" className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800">
            {t.production.recordCheck}
          </button>
        </form>

        {order.qualityChecks.length === 0 ? (
          <p className="text-sm text-zinc-400">{t.production.noQualityChecks}</p>
        ) : (
          <div className="space-y-2">
            {order.qualityChecks.map((check) => (
              <div key={check.id} className="flex items-center justify-between rounded-lg border border-zinc-200 p-3">
                <div>
                  <p className="text-sm font-medium">{check.stage}</p>
                  {check.notes && <p className="text-xs text-zinc-400">{check.notes}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded px-2 py-0.5 text-xs ${check.passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {check.passed ? t.production.passed : t.production.failed}
                  </span>
                  <span className="text-xs text-zinc-400">{new Date(check.checkedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
