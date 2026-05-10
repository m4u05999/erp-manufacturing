import { createTask } from "@/domains/projects/actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getT } from "@/core/i18n/server";

export default async function NewTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getT();

  return (
    <div className="p-6 max-w-xl">
      <Link href={`/dashboard/projects/${id}`} className="text-sm text-zinc-500 hover:text-zinc-900">&larr; {t.projects.label}</Link>
      <h1 className="mt-2 mb-6 text-2xl font-semibold">{t.projects.newTask}</h1>

      <form
        action={async (formData: FormData) => {
          "use server";
          await createTask({
            projectId: id,
            title: formData.get("title") as string,
            description: formData.get("description") as string,
            priority: (formData.get("priority") as string) || "MEDIUM",
            dueDate: formData.get("dueDate") as string || undefined,
          });
          redirect(`/dashboard/projects/${id}`);
        }}
        className="space-y-4"
      >
        <div>
          <label className="mb-1 block text-sm text-zinc-600">{t.engineering.title} *</label>
          <input name="title" required className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-600">{t.common.description}</label>
          <textarea name="description" rows={3} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm text-zinc-600">{t.production.priority}</label>
            <select name="priority" defaultValue="MEDIUM" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm">
              <option value="LOW">{t.common.priority.low}</option>
              <option value="MEDIUM">{t.common.priority.medium}</option>
              <option value="HIGH">{t.common.priority.high}</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-zinc-600">{t.projects.dueDate}</label>
            <input name="dueDate" type="date" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
          </div>
        </div>
        <button type="submit" className="rounded-lg bg-zinc-900 px-6 py-2 text-sm text-white hover:bg-zinc-800">
          {t.projects.createTask}
        </button>
      </form>
    </div>
  );
}
