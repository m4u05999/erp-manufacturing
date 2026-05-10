import { getT } from "@/core/i18n/server";
import { getSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const t = await getT();

  const [
    leads, wonLeads, projects, activeProjects,
    pos, openPos, production, inProgressProduction,
    expenses, expenseTotal, tickets, openTickets,
    employees, presentToday, drawings, inventory, lowStock,
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { stage: "CLOSED_WON" } }),
    prisma.project.count(),
    prisma.project.count({ where: { status: "IN_PROGRESS" } }),
    prisma.purchaseOrder.count(),
    prisma.purchaseOrder.count({ where: { status: { notIn: ["RECEIVED", "CANCELLED"] } } }),
    prisma.productionOrder.count(),
    prisma.productionOrder.count({ where: { status: "IN_PROGRESS" } }),
    prisma.expense.count(),
    prisma.expense.aggregate({ _sum: { amount: true } }),
    prisma.supportTicket.count(),
    prisma.supportTicket.count({ where: { status: { notIn: ["RESOLVED", "CLOSED"] } } }),
    prisma.user.count({ where: { isActive: true } }),
    prisma.attendance.count({ where: { status: "PRESENT", date: { gte: new Date(new Date().toDateString()) } } }),
    prisma.drawing.count(),
    prisma.inventoryItem.count(),
    prisma.inventoryItem.count({ where: { quantity: { lte: 0 } } }),
  ]);

  const recentLeads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, companyName: true, stage: true, estimatedValue: true } });
  const recentTickets = await prisma.supportTicket.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, subject: true, customerName: true, priority: true, status: true } });
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyExpenses = await prisma.expense.aggregate({ where: { createdAt: { gte: monthStart } }, _sum: { amount: true } });

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-semibold">{t.dashboard.title}</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <KpiCard label={t.dashboard.leads} value={leads} sub={`${wonLeads} ${t.dashboard.leadsWon}`} href="/dashboard/sales" color="blue" />
        <KpiCard label={t.dashboard.projects} value={activeProjects} sub={`${projects} ${t.dashboard.total}`} href="/dashboard/projects" color="green" />
        <KpiCard label={t.dashboard.openPOs} value={openPos} sub={`${pos} ${t.dashboard.total}`} href="/dashboard/procurement" color="orange" />
        <KpiCard label={t.dashboard.production} value={inProgressProduction} sub={`${production} ${t.dashboard.total}`} href="/dashboard/production" color="purple" />
        <KpiCard label={t.dashboard.expenses} value={`${Number(expenseTotal._sum.amount ?? 0).toLocaleString()} SAR`} sub={`${expenses} ${t.dashboard.transactions}`} href="/dashboard/finance" color="red" />
        <KpiCard label={t.dashboard.openTickets} value={openTickets} sub={`${tickets} ${t.dashboard.total}`} href="/dashboard/customer-service" color="red" />
        <KpiCard label={t.dashboard.employees} value={employees} sub={`${presentToday} ${t.dashboard.presentToday}`} href="/dashboard/hr" color="cyan" />
        <KpiCard label={t.dashboard.drawings} value={drawings} href="/dashboard/engineering" color="indigo" />
        <KpiCard label={t.dashboard.inventory} value={inventory} sub={`${lowStock} ${t.dashboard.emptyItems}`} href="/dashboard/procurement" color="zinc" />
        <KpiCard label={t.dashboard.monthlyExpenses} value={`${Number(monthlyExpenses._sum.amount ?? 0).toLocaleString()} SAR`} href="/dashboard/finance" color="amber" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-medium">{t.dashboard.recentLeads}</h2>
            <Link href="/dashboard/sales" className="text-xs text-zinc-400 hover:text-zinc-600">{t.common.viewAll}</Link>
          </div>
          {recentLeads.length === 0 ? (
            <p className="text-sm text-zinc-400">{t.sales.noLeads}</p>
          ) : (
            <div className="space-y-2">
              {recentLeads.map((lead) => (
                <Link key={lead.id} href={`/dashboard/sales/leads/${lead.id}`} className="flex items-center justify-between rounded-lg border border-zinc-100 p-3 transition hover:bg-zinc-50">
                  <div>
                    <p className="text-sm font-medium">{lead.companyName}</p>
                    {lead.estimatedValue && <p className="text-xs text-zinc-400">{Number(lead.estimatedValue).toLocaleString()} SAR</p>}
                  </div>
                  <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">{lead.stage}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-medium">{t.dashboard.recentTickets}</h2>
            <Link href="/dashboard/customer-service" className="text-xs text-zinc-400 hover:text-zinc-600">{t.common.viewAll}</Link>
          </div>
          {recentTickets.length === 0 ? (
            <p className="text-sm text-zinc-400">{t.customerService.noTickets}</p>
          ) : (
            <div className="space-y-2">
              {recentTickets.map((t) => (
                <Link key={t.id} href={`/dashboard/customer-service/${t.id}`} className="flex items-center justify-between rounded-lg border border-zinc-100 p-3 transition hover:bg-zinc-50">
                  <div>
                    <p className="text-sm font-medium">{t.subject}</p>
                    <p className="text-xs text-zinc-400">{t.customerName}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`rounded px-2 py-0.5 text-xs ${t.priority === "URGENT" || t.priority === "HIGH" ? "bg-red-100 text-red-700" : "bg-zinc-100 text-zinc-600"}`}>{t.priority}</span>
                    <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">{t.status}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, sub, href, color }: { label: string; value: string | number; sub?: string; href: string; color: string }) {
  const colors: Record<string, string> = {
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    green: "border-green-200 bg-green-50 text-green-700",
    orange: "border-orange-200 bg-orange-50 text-orange-700",
    purple: "border-purple-200 bg-purple-50 text-purple-700",
    red: "border-red-200 bg-red-50 text-red-700",
    cyan: "border-cyan-200 bg-cyan-50 text-cyan-700",
    indigo: "border-indigo-200 bg-indigo-50 text-indigo-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    zinc: "border-zinc-200 bg-zinc-50 text-zinc-700",
  };
  return (
    <Link href={href} className={`rounded-xl border p-4 transition hover:shadow-sm ${colors[color] || "border-zinc-200 bg-white text-zinc-700"}`}>
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
      {sub && <p className="mt-0.5 text-xs opacity-60">{sub}</p>}
    </Link>
  );
}
