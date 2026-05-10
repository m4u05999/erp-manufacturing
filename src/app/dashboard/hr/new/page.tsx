import { getSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { createAttendance } from "@/domains/hr/actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getT } from "@/core/i18n/server";

export const dynamic = "force-dynamic";

export default async function NewAttendancePage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const t = await getT();

  const users = await prisma.user.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="p-6 max-w-xl">
      <Link href="/dashboard/hr" className="text-sm text-zinc-500 hover:text-zinc-900">&larr; {t.nav.hr}</Link>
      <h1 className="mt-2 mb-6 text-2xl font-semibold">{t.hr.recordAttendance}</h1>

      <form
        action={async (formData: FormData) => {
          "use server";
          await createAttendance({
            userId: formData.get("userId") as string,
            date: formData.get("date") as string,
            checkIn: formData.get("checkIn") as string || undefined,
            checkOut: formData.get("checkOut") as string || undefined,
            location: formData.get("location") as string || undefined,
            status: formData.get("status") as string || undefined,
            notes: formData.get("notes") as string || undefined,
          });
          redirect("/dashboard/hr");
        }}
        className="space-y-4"
      >
        <div>
          <label className="mb-1 block text-sm text-zinc-600">{`${t.hr.employee} *`}</label>
          <select name="userId" required className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm">
            <option value="">{t.common.select}</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-600">{`${t.hr.date} *`}</label>
          <input name="date" type="date" defaultValue={today} required className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm text-zinc-600">{t.hr.checkIn}</label>
            <input name="checkIn" type="time" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-zinc-600">{t.hr.checkOut}</label>
            <input name="checkOut" type="time" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-600">{t.common.status}</label>
          <select name="status" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm">
            <option value="PRESENT">{t.hr.present}</option>
            <option value="ABSENT">{t.hr.absent}</option>
            <option value="LATE">{t.hr.late}</option>
            <option value="LEAVE">{t.hr.leave}</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-600">{t.projects.location}</label>
          <input name="location" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-600">{t.common.notes}</label>
          <textarea name="notes" rows={2} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
        </div>
        <button type="submit" className="rounded-lg bg-zinc-900 px-6 py-2 text-sm text-white hover:bg-zinc-800">{t.hr.saveAttendance}</button>
      </form>
    </div>
  );
}
