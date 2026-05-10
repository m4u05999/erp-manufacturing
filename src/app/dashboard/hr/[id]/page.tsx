import { getSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getT } from "@/core/i18n/server";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  PRESENT: "bg-green-100 text-green-700",
  ABSENT: "bg-red-100 text-red-700",
  LATE: "bg-yellow-100 text-yellow-700",
  LEAVE: "bg-blue-100 text-blue-700",
};

export default async function AttendanceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const t = await getT();

  const { id } = await params;
  const record = await prisma.attendance.findUnique({
    where: { id },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  if (!record) notFound();

  return (
    <div className="p-6 max-w-2xl">
      <Link href="/dashboard/hr" className="text-sm text-zinc-500 hover:text-zinc-900">&larr; {t.nav.hr}</Link>
      <h1 className="mt-4 text-2xl font-semibold">{t.hr.attendanceRecord}</h1>

      <div className="mt-6 space-y-3">
        <div className="flex justify-between rounded-lg border border-zinc-200 p-3">
          <span className="text-sm text-zinc-500">{t.hr.employee}</span>
          <span className="text-sm font-medium">{record.user?.name || t.common.unknown}</span>
        </div>
        <div className="flex justify-between rounded-lg border border-zinc-200 p-3">
          <span className="text-sm text-zinc-500">{t.hr.date}</span>
          <span className="text-sm text-zinc-600">{new Date(record.date).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between rounded-lg border border-zinc-200 p-3">
          <span className="text-sm text-zinc-500">{t.common.status}</span>
          <span className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[record.status] || "bg-zinc-100 text-zinc-600"}`}>{record.status}</span>
        </div>
        {record.checkIn && (
          <div className="flex justify-between rounded-lg border border-zinc-200 p-3">
            <span className="text-sm text-zinc-500">{t.hr.checkIn}</span>
            <span className="text-sm text-zinc-600">{new Date(record.checkIn).toLocaleTimeString()}</span>
          </div>
        )}
        {record.checkOut && (
          <div className="flex justify-between rounded-lg border border-zinc-200 p-3">
            <span className="text-sm text-zinc-500">{t.hr.checkOut}</span>
            <span className="text-sm text-zinc-600">{new Date(record.checkOut).toLocaleTimeString()}</span>
          </div>
        )}
        {record.location && (
          <div className="flex justify-between rounded-lg border border-zinc-200 p-3">
            <span className="text-sm text-zinc-500">{t.projects.location}</span>
            <span className="text-sm text-zinc-600">{record.location}</span>
          </div>
        )}
        {record.notes && (
          <div className="rounded-lg border border-zinc-200 p-3">
            <span className="text-sm text-zinc-500 block mb-1">{t.common.notes}</span>
            <span className="text-sm text-zinc-600">{record.notes}</span>
          </div>
        )}
      </div>
    </div>
  );
}
