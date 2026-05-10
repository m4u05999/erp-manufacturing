import { getSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { updateTicketStatus } from "@/domains/customer-service/actions";
import { notFound, redirect } from "next/navigation";
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

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  const t = await getT();

  const { id } = await params;
  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: { project: { select: { id: true, name: true } }, assignedUser: { select: { name: true } } },
  });
  if (!ticket) notFound();

  return (
    <div className="p-6 max-w-3xl">
      <Link href="/dashboard/customer-service" className="text-sm text-zinc-500 hover:text-zinc-900">&larr; {t.nav.customerService}</Link>

      <div className="mt-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{ticket.subject}</h1>
          <p className="text-sm text-zinc-500">{ticket.customerName}{ticket.customerPhone ? ` · ${ticket.customerPhone}` : ""}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[ticket.status] || "bg-zinc-100 text-zinc-600"}`}>{ticket.status}</span>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${PRIORITY_COLORS[ticket.priority] || "bg-zinc-100 text-zinc-600"}`}>{ticket.priority}</span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-sm text-zinc-500">
        {ticket.category && <span>{`${t.finance.category}:`} {ticket.category}</span>}
        {ticket.project && <span>{`${t.projects.label}:`} <Link href={`/dashboard/projects/${ticket.project.id}`} className="text-blue-600 hover:underline">{ticket.project.name}</Link></span>}
        {ticket.assignedUser && <span>{`${t.common.assignedTo}:`} {ticket.assignedUser.name}</span>}
        <span>{`${t.common.created}:`} {new Date(ticket.createdAt).toLocaleDateString()}</span>
      </div>

      <div className="mt-4 rounded-lg border border-zinc-200 p-4">
        <p className="text-sm text-zinc-700 whitespace-pre-wrap">{ticket.description}</p>
      </div>

      {ticket.status !== "CLOSED" && (
        <div className="mt-6">
          <p className="text-sm font-medium text-zinc-700 mb-2">{t.customerService.updateStatus}</p>
          <div className="flex gap-2">
            {["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].filter((s) => s !== ticket.status).map((status) => (
              <form
                key={status}
                action={async () => {
                  "use server";
                  await updateTicketStatus(ticket.id, status);
                  redirect(`/dashboard/customer-service/${ticket.id}`);
                }}
              >
                <button type="submit" className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs hover:bg-zinc-100">
                  {status === "IN_PROGRESS" ? t.customerService.actionStart : status === "RESOLVED" ? t.customerService.actionResolve : status === "CLOSED" ? t.customerService.actionClose : t.customerService.actionReopen}
                </button>
              </form>
            ))}
          </div>
        </div>
      )}

      {ticket.resolvedAt && (
        <p className="mt-4 text-xs text-zinc-400">{t.customerService.resolvedOn} {new Date(ticket.resolvedAt).toLocaleDateString()}</p>
      )}
    </div>
  );
}
