import { getSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getT } from "@/core/i18n/server";

export const dynamic = "force-dynamic";

export default async function EngineeringPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const t = await getT();

  const drawings = await prisma.drawing.findMany({
    orderBy: [{ projectId: "asc" }, { version: "desc" }],
    include: { project: { select: { id: true, name: true } } },
  });

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t.engineering.drawings}</h1>
        <Link href="/dashboard/engineering/new" className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800">+ {t.engineering.uploadDrawing}</Link>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-xs text-zinc-500">{t.engineering.totalDrawings}</p>
          <p className="mt-1 text-xl font-semibold">{drawings.length}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-xs text-zinc-500">{t.engineering.projectsWithDrawings}</p>
          <p className="mt-1 text-xl font-semibold">{new Set(drawings.map((d) => d.projectId)).size}</p>
        </div>
      </div>

      <div className="space-y-2">
        {drawings.length === 0 && <p className="text-sm text-zinc-400">{t.engineering.noDrawings}</p>}
        {drawings.map((drawing) => (
          <div key={drawing.id} className="flex items-center justify-between rounded-lg border border-zinc-200 p-3">
            <div>
              <p className="text-sm font-medium">{drawing.title}</p>
              <div className="flex gap-2 text-xs text-zinc-400">
                <span>v{drawing.version}</span>
                {drawing.project && <span>· {drawing.project.name}</span>}
                <span>· {drawing.status}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a href={drawing.fileUrl} target="_blank" className="rounded bg-zinc-100 px-3 py-1 text-xs text-zinc-600 hover:bg-zinc-200">{t.common.view}</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
