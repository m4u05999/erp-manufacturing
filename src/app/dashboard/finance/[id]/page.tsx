import { getSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { getT } from "@/core/i18n/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ExpenseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const t = await getT();
  const expense = await prisma.expense.findUnique({
    where: { id },
    include: { project: { select: { id: true, name: true } } },
  });
  if (!expense) notFound();

  return (
    <div className="p-6 max-w-2xl">
      <Link href="/dashboard/finance" className="text-sm text-zinc-500 hover:text-zinc-900">&larr; {t.nav.finance}</Link>
      <h1 className="mt-4 text-2xl font-semibold">{expense.description}</h1>

      <div className="mt-6 space-y-3">
        <div className="flex justify-between rounded-lg border border-zinc-200 p-3">
          <span className="text-sm text-zinc-500">{t.finance.category}</span>
          <span className="text-sm font-medium">{expense.category}</span>
        </div>
        <div className="flex justify-between rounded-lg border border-zinc-200 p-3">
          <span className="text-sm text-zinc-500">{t.finance.amount}</span>
          <span className="text-sm font-medium">{Number(expense.amount).toLocaleString()} SAR</span>
        </div>
        {expense.project && (
          <div className="flex justify-between rounded-lg border border-zinc-200 p-3">
            <span className="text-sm text-zinc-500">{t.projects.label}</span>
            <Link href={`/dashboard/projects/${expense.project.id}`} className="text-sm text-blue-600 hover:underline">{expense.project.name}</Link>
          </div>
        )}
        {expense.receiptUrl && (
          <div className="flex justify-between rounded-lg border border-zinc-200 p-3">
            <span className="text-sm text-zinc-500">{t.finance.receipt}</span>
            <a href={expense.receiptUrl} target="_blank" className="text-sm text-blue-600 hover:underline">{t.common.view}</a>
          </div>
        )}
        <div className="flex justify-between rounded-lg border border-zinc-200 p-3">
          <span className="text-sm text-zinc-500">{t.hr.date}</span>
          <span className="text-sm text-zinc-600">{new Date(expense.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}
