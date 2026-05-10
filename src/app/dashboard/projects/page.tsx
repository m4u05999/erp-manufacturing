import { getSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getT } from "@/core/i18n/server";

export const dynamic = "force-dynamic";
import Link from "next/link";

const STATUS_LABELS: Record<string, string> = {
  PLANNING: "statusPlanning", IN_PROGRESS: "statusInProgress", ON_HOLD: "statusOnHold",
  COMPLETED: "statusCompleted", CANCELLED: "statusCancelled",
};

export default async function ProjectsPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const t = await getT();

  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      manager: { select: { name: true } },
      _count: { select: { tasks: true, dailyReports: true } },
    },
  });

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t.dashboard.projects}</h1>
        <Link
          href="/dashboard/projects/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800"
        >
          + {t.common.new} {t.dashboard.projects}
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.length === 0 && (
          <p className="text-sm text-zinc-400 col-span-full">{t.projects.noProjects}</p>
        )}
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/dashboard/projects/${project.id}`}
            className="rounded-xl border border-zinc-200 bg-white p-5 transition hover:shadow-sm"
          >
            <div className="flex items-start justify-between">
              <h2 className="font-medium text-zinc-900">{project.name}</h2>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                project.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                project.status === "CANCELLED" ? "bg-red-100 text-red-700" :
                project.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-700" :
                "bg-zinc-100 text-zinc-600"
              }`}>
                {t.projects[STATUS_LABELS[project.status] as keyof typeof t.projects]}
              </span>
            </div>
            {project.location && (
              <p className="mt-2 text-xs text-zinc-500">{project.location}</p>
            )}
            <div className="mt-3 flex gap-3 text-xs text-zinc-400">
              <span>{project._count.tasks} {t.projects.tasks}</span>
              <span>{project._count.dailyReports} {t.projects.reports}</span>
            </div>
            {project.budget && (
              <p className="mt-2 text-sm font-medium text-zinc-700">
                {t.projects.budget}: {Number(project.budget).toLocaleString()} SAR
              </p>
            )}
            {project.manager && (
              <p className="mt-1 text-xs text-zinc-400">{t.projects.projectManager}: {project.manager.name}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
