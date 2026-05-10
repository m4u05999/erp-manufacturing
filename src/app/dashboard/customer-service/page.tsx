import { getSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getT } from "@/core/i18n/server";

export const dynamic = "force-dynamic";

const PRIORITY_COLORS: Record<string, string> = {
  URGENT: "bg-red-100 text-red-700",
  HIGH: "bg-orange-100 text-orange-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  LOW: "bg-zinc-100 text-zinc-600",
};

const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  RESOLVED: "bg-green-100 text-green-700",
  CLOSED: "bg-zinc-100 text-zinc-600",
};

export default async function CustomerServicePage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  const t = await getT();

  const tickets = await prisma.supportTicket.findMany({
    orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
    include: { project: { select: { id: true, name: true } } },
  });

  return (
    <div className="p-6">
<div className="mb-6 flex items-center justify-between">
         <h1 className="text-2xl font-semibold">{t.nav.customerService}</h1>
         <Link href="/dashboard/customer-service/new" className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800">{t.customerService.newTicket}</Link>
       </div>

       <div className="mb-6 grid gap-4 sm:grid-cols-3">
         <div className="rounded-lg border border-zinc-200 bg-white p-4">
           <p className="text-xs text-zinc-500">{t.customerService.open}</p>
           <p className="mt-1 text-xl font-semibold">{tickets.filter((ticket) => ticket.status === "OPEN").length}</p>
         </div>
         <div className="rounded-lg border border-zinc-200 bg-white p-4">
           <p className="text-xs text-zinc-500">{t.customerService.inProgress}</p>
           <p className="mt-1 text-xl font-semibold">{tickets.filter((ticket) => ticket.status === "IN_PROGRESS").length}</p>
         </div>
         <div className="rounded-lg border border-zinc-200 bg-white p-4">
           <p className="text-xs text-zinc-500">{t.customerService.resolved}</p>
           <p className="mt-1 text-xl font-semibold">{tickets.filter((ticket) => ticket.status === "RESOLVED").length}</p>
         </div>
       </div>

       <div className="space-y-2">
         {tickets.length === 0 && <p className="text-sm text-zinc-400">{t.customerService.noTickets}</p>}
        {tickets.map((ticket) => (
          <Link
            key={ticket.id}
            href={`/dashboard/customer-service/${ticket.id}`}
            className="block rounded-lg border border-zinc-200 p-3 transition hover:shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium">{ticket.subject}</p>
                <p className="text-xs text-zinc-500">{ticket.customerName}{ticket.project ? ` · ${ticket.project.name}` : ""}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded px-2 py-0.5 text-xs ${PRIORITY_COLORS[ticket.priority] || "bg-zinc-100 text-zinc-600"}`}>{ticket.priority}</span>
                <span className={`rounded px-2 py-0.5 text-xs ${STATUS_COLORS[ticket.status] || "bg-zinc-100 text-zinc-600"}`}>{ticket.status}</span>
              </div>
            </div>
            <p className="mt-1 text-xs text-zinc-400 line-clamp-1">{ticket.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
