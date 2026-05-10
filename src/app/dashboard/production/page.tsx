import { getSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getT } from "@/core/i18n/server";

export const dynamic = "force-dynamic";

const STATUSES = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;
function getStatusLabel(status: string, t: any): string {
  const map: Record<string, string> = {
    PENDING: t.production.statusPending, IN_PROGRESS: t.production.statusInProgress, COMPLETED: t.production.statusCompleted, CANCELLED: t.production.statusCancelled,
  };
  return map[status] || status;
}
const PRIORITY_COLORS: Record<string, string> = {
  HIGH: "bg-red-100 text-red-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  LOW: "bg-zinc-100 text-zinc-600",
};

export default async function ProductionPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const t = await getT();

  const orders = await prisma.productionOrder.findMany({
    orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
    include: {
      project: { select: { id: true, name: true } },
      _count: { select: { qualityChecks: true } },
    },
  });

  const grouped = STATUSES.reduce((acc, status) => {
    acc[status] = orders.filter((o) => o.status === status);
    return acc;
  }, {} as Record<string, typeof orders>);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t.nav.production}</h1>
        <Link
          href="/dashboard/production/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800"
        >
          {`+ ${t.production.newOrder}`}
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {STATUSES.map((status) => (
          <div key={status} className="min-w-[280px] flex-shrink-0">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-medium text-zinc-700">{getStatusLabel(status, t)}</h2>
              <span className="text-xs text-zinc-400">{grouped[status].length}</span>
            </div>
            <div className="flex flex-col gap-3">
              {grouped[status].map((order) => (
                <OrderCard key={order.id} order={order} t={t} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrderCard({ order, t }: { order: any; t: any }) {
  return (
    <Link
      href={`/dashboard/production/${order.id}`}
      className="block rounded-lg border border-zinc-200 bg-white p-4 transition hover:shadow-sm"
    >
      <div className="flex items-start justify-between">
        <p className="font-medium text-zinc-900">{order.orderNumber}</p>
        <span className={`rounded px-2 py-0.5 text-xs ${PRIORITY_COLORS[order.priority] || "bg-zinc-100 text-zinc-600"}`}>
          {order.priority}
        </span>
      </div>
      <p className="mt-1 text-sm text-zinc-700">{order.productName}</p>
      <p className="text-xs text-zinc-400">{`${t.production.quantity}: ${order.quantity}`}</p>
      {order.project && <p className="text-xs text-zinc-400">{`${t.projects.label}: ${order.project.name}`}</p>}
      <div className="mt-2 flex items-center gap-2 text-xs text-zinc-400">
        <span>{order._count.qualityChecks} {t.production.qualityCheck}</span>
        {order.scheduledDate && <span>{`${t.projects.due}: ${new Date(order.scheduledDate).toLocaleDateString()}`}</span>}
      </div>
    </Link>
  );
}
