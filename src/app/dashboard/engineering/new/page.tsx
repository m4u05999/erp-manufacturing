import { getSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { createDrawing } from "@/domains/engineering/actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getT } from "@/core/i18n/server";

export const dynamic = "force-dynamic";

export default async function NewDrawingPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const t = await getT();

  const projects = await prisma.project.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="p-6 max-w-xl">
      <Link href="/dashboard/engineering" className="text-sm text-zinc-500 hover:text-zinc-900">&larr; {t.nav.engineering}</Link>
      <h1 className="mt-2 mb-6 text-2xl font-semibold">{t.engineering.uploadDrawing}</h1>

      <form
        action={async (formData: FormData) => {
          "use server";
          await createDrawing({
            projectId: formData.get("projectId") as string,
            title: formData.get("title") as string,
            fileUrl: formData.get("fileUrl") as string,
            notes: formData.get("notes") as string || undefined,
          });
          redirect("/dashboard/engineering");
        }}
        className="space-y-4"
      >
        <div>
          <label className="mb-1 block text-sm text-zinc-600">{`${t.projects.label} *`}</label>
          <select name="projectId" required className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm">
            <option value="">{t.common.select}</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-600">{`${t.engineering.title} *`}</label>
          <input name="title" required className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" placeholder={t.engineering.titlePlaceholder} />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-600">{`${t.engineering.fileUrl} *`}</label>
          <input name="fileUrl" required className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" placeholder={t.engineering.urlPlaceholder} />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-600">{t.common.notes}</label>
          <textarea name="notes" rows={3} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
        </div>
        <button type="submit" className="rounded-lg bg-zinc-900 px-6 py-2 text-sm text-white hover:bg-zinc-800">{t.engineering.uploadDrawing}</button>
      </form>
    </div>
  );
}
