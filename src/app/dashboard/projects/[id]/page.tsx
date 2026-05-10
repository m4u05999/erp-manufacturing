import { getSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getT } from "@/core/i18n/server";

export const dynamic = "force-dynamic";
import Link from "next/link";

const STATUS_LABELS: Record<string, string> = {
  PLANNING: "statusPlanning", IN_PROGRESS: "statusInProgress", ON_HOLD: "statusOnHold",
  COMPLETED: "statusCompleted", CANCELLED: "statusCancelled",
};

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const t = await getT();

  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      tasks: { orderBy: { createdAt: "desc" } },
      dailyReports: { orderBy: { reportDate: "desc" }, take: 5 },
      manager: { select: { name: true } },
      _count: { select: { purchaseOrders: true, productionOrders: true, supportTickets: true } },
    },
  });
  if (!project) notFound();

  return (
    <div className="p-6 max-w-4xl">
      <Link href="/dashboard/projects" className="text-sm text-zinc-500 hover:text-zinc-900">&larr; {t.dashboard.projects}</Link>

      <div className="mt-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{project.name}</h1>
          {project.location && <p className="text-sm text-zinc-500">{project.location}</p>}
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${
          project.status === "COMPLETED" ? "bg-green-100 text-green-700" :
          project.status === "CANCELLED" ? "bg-red-100 text-red-700" :
          project.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-700" :
          "bg-zinc-100 text-zinc-600"
        }`}>
          {t.projects[STATUS_LABELS[project.status] as keyof typeof t.projects]}
        </span>
      </div>

      <div className="mt-4 flex gap-6 text-sm text-zinc-500">
        {project.clientName && <span>{t.projects.clientName}: {project.clientName}</span>}
        {project.manager && <span>{t.projects.projectManager}: {project.manager.name}</span>}
        {project.budget && <span>{t.projects.budget}: {Number(project.budget).toLocaleString()} SAR</span>}
        {project.actualCost && <span>{t.projects.actualCost}: {Number(project.actualCost).toLocaleString()} SAR</span>}
      </div>

      <div className="mt-4 flex gap-3 text-xs text-zinc-400">
        <span>{project._count.purchaseOrders} {t.projects.pos}</span>
        <span>{project._count.productionOrders} {t.projects.productionOrders}</span>
        <span>{project._count.supportTickets} {t.projects.tickets}</span>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">{t.projects.tasksSection}</h2>
          <Link
            href={`/dashboard/projects/${project.id}/tasks/new`}
            className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs text-white hover:bg-zinc-800"
          >
            {t.projects.addTask}
          </Link>
        </div>
        {project.tasks.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-400">{t.projects.noTasks}</p>
        ) : (
          <div className="mt-3 space-y-2">
            {project.tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between rounded-lg border border-zinc-200 p-3">
                <div>
                  <p className="text-sm font-medium">{task.title}</p>
                  {task.dueDate && (
                    <p className="text-xs text-zinc-400">{t.projects.due}: {new Date(task.dueDate).toLocaleDateString()}</p>
                  )}
                </div>
                <span className={`rounded px-2 py-0.5 text-xs ${
                  task.status === "DONE" ? "bg-green-100 text-green-700" :
                  task.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-700" :
                  "bg-zinc-100 text-zinc-600"
                }`}>
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">{t.projects.dailyReports}</h2>
          <Link
            href={`/dashboard/projects/${project.id}/reports/new`}
            className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs text-white hover:bg-zinc-800"
          >
            {t.projects.newReport}
          </Link>
        </div>
        {project.dailyReports.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-400">{t.projects.noReports}</p>
        ) : (
          <div className="mt-3 space-y-2">
            {project.dailyReports.map((report) => (
              <div key={report.id} className="rounded-lg border border-zinc-200 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-zinc-400">{new Date(report.reportDate).toLocaleDateString()}</p>
                  {report.weather && <span className="text-xs text-zinc-400">{report.weather}</span>}
                </div>
                <p className="mt-1 text-sm">{report.summary}</p>
                {report.delays && <p className="mt-1 text-xs text-red-500">{t.projects.delays}: {report.delays}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
