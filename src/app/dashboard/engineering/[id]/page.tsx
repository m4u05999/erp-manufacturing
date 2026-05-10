import { getSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getT } from "@/core/i18n/server";

export const dynamic = "force-dynamic";

export default async function DrawingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const t = await getT();

  const { id } = await params;
  const drawing = await prisma.drawing.findUnique({
    where: { id },
    include: { project: { select: { id: true, name: true } } },
  });
  if (!drawing) notFound();

  return (
    <div className="p-6 max-w-2xl">
      <Link href="/dashboard/engineering" className="text-sm text-zinc-500 hover:text-zinc-900">&larr; {t.nav.engineering}</Link>
      <h1 className="mt-4 text-2xl font-semibold">{drawing.title}</h1>

      <div className="mt-6 space-y-3">
        <div className="flex justify-between rounded-lg border border-zinc-200 p-3">
          <span className="text-sm text-zinc-500">{t.projects.label}</span>
          <Link href={`/dashboard/projects/${drawing.project.id}`} className="text-sm text-blue-600 hover:underline">{drawing.project.name}</Link>
        </div>
        <div className="flex justify-between rounded-lg border border-zinc-200 p-3">
          <span className="text-sm text-zinc-500">{t.engineering.version}</span>
          <span className="text-sm font-medium">v{drawing.version}</span>
        </div>
        <div className="flex justify-between rounded-lg border border-zinc-200 p-3">
          <span className="text-sm text-zinc-500">{t.common.status}</span>
          <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">{drawing.status}</span>
        </div>
        {drawing.notes && (
          <div className="rounded-lg border border-zinc-200 p-3">
            <span className="text-sm text-zinc-500 block mb-1">{t.common.notes}</span>
            <span className="text-sm text-zinc-600">{drawing.notes}</span>
          </div>
        )}
        <a href={drawing.fileUrl} target="_blank" className="block rounded-lg bg-zinc-900 px-4 py-2 text-center text-sm text-white hover:bg-zinc-800">
          {t.engineering.openDrawing}
        </a>
      </div>
    </div>
  );
}
