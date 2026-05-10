import { getSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { getT } from "@/core/i18n/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function FinancePage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  const t = await getT();

  const [expenses, categories] = await Promise.all([
    prisma.expense.findMany({
      orderBy: { createdAt: "desc" },
      include: { project: { select: { id: true, name: true } } },
    }),
    prisma.expense.groupBy({
      by: ["category"],
      _sum: { amount: true },
      orderBy: { category: "asc" },
    }),
  ]);

  const totalAmount = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t.nav.finance}</h1>
        <Link href="/dashboard/finance/new" className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800">{t.finance.newExpense}</Link>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-xs text-zinc-500">{t.finance.totalExpenses}</p>
          <p className="mt-1 text-xl font-semibold">{Number(totalAmount).toLocaleString()} SAR</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-xs text-zinc-500">{t.finance.categories}</p>
          <p className="mt-1 text-xl font-semibold">{categories.length}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-xs text-zinc-500">{t.finance.transactions}</p>
          <p className="mt-1 text-xl font-semibold">{expenses.length}</p>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="mb-3 text-lg font-medium">{t.finance.byCategory}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <div key={cat.category} className="rounded-lg border border-zinc-200 bg-white p-3">
              <p className="font-medium text-sm">{cat.category}</p>
              <p className="mt-1 text-sm text-zinc-600">{Number(cat._sum.amount ?? 0).toLocaleString()} SAR</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-medium">{t.finance.allExpenses}</h2>
        <div className="space-y-2">
          {expenses.length === 0 && <p className="text-sm text-zinc-400">{t.finance.noExpenses}</p>}
          {expenses.map((expense) => (
            <div key={expense.id} className="flex items-center justify-between rounded-lg border border-zinc-200 p-3">
              <div>
                <p className="text-sm font-medium">{expense.description}</p>
                <div className="flex gap-2 text-xs text-zinc-400">
                  <span>{expense.category}</span>
                  {expense.project && <span>· {expense.project.name}</span>}
                  <span>· {new Date(expense.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <span className="text-sm font-medium">{Number(expense.amount).toLocaleString()} SAR</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
