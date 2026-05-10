import { createDailyReport } from "@/domains/projects/actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getT } from "@/core/i18n/server";

export default async function NewReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getT();

  return (
    <div className="p-6 max-w-xl">
      <Link href={`/dashboard/projects/${id}`} className="text-sm text-zinc-500 hover:text-zinc-900">&larr; {t.projects.label}</Link>
      <h1 className="mt-2 mb-6 text-2xl font-semibold">{t.projects.dailyReport}</h1>

      <form
        action={async (formData: FormData) => {
          "use server";
          await createDailyReport({
            projectId: id,
            summary: formData.get("summary") as string,
            weather: formData.get("weather") as string,
            delays: formData.get("delays") as string,
            notes: formData.get("notes") as string,
          });
          redirect(`/dashboard/projects/${id}`);
        }}
        className="space-y-4"
      >
        <div>
          <label className="mb-1 block text-sm text-zinc-600">{t.projects.summary} *</label>
          <textarea name="summary" required rows={4} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm text-zinc-600">{t.projects.weather}</label>
            <input name="weather" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" placeholder={t.projects.weatherPlaceholder} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-zinc-600">{t.projects.delays}</label>
            <input name="delays" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" placeholder={t.projects.delaysPlaceholder} />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-600">{t.common.notes}</label>
          <textarea name="notes" rows={3} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
        </div>
        <button type="submit" className="rounded-lg bg-zinc-900 px-6 py-2 text-sm text-white hover:bg-zinc-800">
          {t.projects.submitReport}
        </button>
      </form>
    </div>
  );
}
