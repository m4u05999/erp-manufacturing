import { createProject } from "@/domains/projects/actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getT } from "@/core/i18n/server";

export default async function NewProjectPage() {
  const t = await getT();

  return (
    <div className="p-6 max-w-xl">
      <Link href="/dashboard/projects" className="text-sm text-zinc-500 hover:text-zinc-900">&larr; {t.dashboard.projects}</Link>
      <h1 className="mt-2 mb-6 text-2xl font-semibold">{t.projects.newProject}</h1>

      <form
        action={async (formData: FormData) => {
          "use server";
          const data = {
            name: formData.get("name") as string,
            description: formData.get("description") as string,
            location: formData.get("location") as string,
            clientName: formData.get("clientName") as string,
            clientPhone: formData.get("clientPhone") as string,
            startDate: formData.get("startDate") as string || undefined,
            endDate: formData.get("endDate") as string || undefined,
            budget: formData.get("budget") ? Number(formData.get("budget")) : undefined,
          };
          const project = await createProject(data);
          redirect(`/dashboard/projects/${project.id}`);
        }}
        className="space-y-4"
      >
        <div>
          <label className="mb-1 block text-sm text-zinc-600">{t.projects.projectName} *</label>
          <input name="name" required className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-600">{t.common.description}</label>
          <textarea name="description" rows={3} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm text-zinc-600">{t.projects.clientName}</label>
            <input name="clientName" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-zinc-600">{t.projects.clientPhone}</label>
            <input name="clientPhone" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-600">{t.projects.location}</label>
          <input name="location" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm text-zinc-600">{t.projects.startDate}</label>
            <input name="startDate" type="date" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-zinc-600">{t.projects.endDate}</label>
            <input name="endDate" type="date" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-600">{t.projects.budget} (SAR)</label>
          <input name="budget" type="number" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
        </div>
        <button type="submit" className="rounded-lg bg-zinc-900 px-6 py-2 text-sm text-white hover:bg-zinc-800">
          {t.projects.create}
        </button>
      </form>
    </div>
  );
}
