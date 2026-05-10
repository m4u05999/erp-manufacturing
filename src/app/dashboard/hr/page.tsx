import { getSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getT } from "@/core/i18n/server";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  PRESENT: "bg-green-100 text-green-700",
  ABSENT: "bg-red-100 text-red-700",
  LATE: "bg-yellow-100 text-yellow-700",
  LEAVE: "bg-blue-100 text-blue-700",
};

export default async function HRPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const t = await getT();

  const [records, users] = await Promise.all([
    prisma.attendance.findMany({
      orderBy: { date: "desc" },
      take: 50,
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.user.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  const today = new Date().toISOString().split("T")[0];
  const todayRecords = records.filter((r) => new Date(r.date).toISOString().split("T")[0] === today);
  const presentToday = todayRecords.filter((r) => r.status === "PRESENT").length;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t.hr.attendance}</h1>
        <Link href="/dashboard/hr/new" className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800">{t.hr.recordAttendance}</Link>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-xs text-zinc-500">{t.hr.totalEmployees}</p>
          <p className="mt-1 text-xl font-semibold">{users.length}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-xs text-zinc-500">{t.hr.presentToday}</p>
          <p className="mt-1 text-xl font-semibold text-green-600">{presentToday}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-xs text-zinc-500">{t.hr.totalRecords}</p>
          <p className="mt-1 text-xl font-semibold">{records.length}+</p>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-medium">{t.hr.recentAttendance}</h2>
        <div className="space-y-2">
          {records.length === 0 && <p className="text-sm text-zinc-400">{t.hr.noRecords}</p>}
          {records.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-lg border border-zinc-200 p-3">
              <div>
                <p className="text-sm font-medium">{r.user?.name || t.common.unknown}</p>
                <p className="text-xs text-zinc-400">{new Date(r.date).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded px-2 py-0.5 text-xs ${STATUS_COLORS[r.status] || "bg-zinc-100 text-zinc-600"}`}>{r.status}</span>
                {r.checkIn && <span className="text-xs text-zinc-400">{new Date(r.checkIn).toLocaleTimeString()}</span>}
                {r.checkOut && <span className="text-xs text-zinc-400">- {new Date(r.checkOut).toLocaleTimeString()}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
