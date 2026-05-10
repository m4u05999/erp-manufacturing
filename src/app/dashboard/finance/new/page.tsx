import { getSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { getT } from "@/core/i18n/server";
import { createExpense } from "@/domains/finance/actions";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function NewExpensePage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  const t = await getT();

  const projects = await prisma.project.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="p-6 max-w-xl">
      <Link href="/dashboard/finance" className="text-sm text-zinc-500 hover:text-zinc-900">&larr; {t.nav.finance}</Link>
      <h1 className="mt-2 mb-6 text-2xl font-semibold">{t.finance.newExpense}</h1>

      <form
        action={async (formData: FormData) => {
          "use server";
          await createExpense({
            projectId: formData.get("projectId") as string || undefined,
            category: formData.get("category") as string,
            description: formData.get("description") as string,
            amount: Number(formData.get("amount")),
            receiptUrl: formData.get("receiptUrl") as string || undefined,
          });
          redirect("/dashboard/finance");
        }}
        className="space-y-4"
      >
        <div>
          <label className="mb-1 block text-sm text-zinc-600">{`${t.finance.category} *`}</label>
          <input name="category" required className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" placeholder={t.finance.categoryPlaceholder} />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-600">{`${t.finance.description} *`}</label>
          <textarea name="description" required rows={2} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-600">{`${t.finance.amount} (SAR) *`}</label>
          <input name="amount" type="number" min="0" step="0.01" required className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-600">{t.finance.projectOptional}</label>
          <select name="projectId" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm">
            <option value="">{t.common.none}</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-600">{t.finance.receiptUrl}</label>
          <input name="receiptUrl" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
        </div>
        <button type="submit" className="rounded-lg bg-zinc-900 px-6 py-2 text-sm text-white hover:bg-zinc-800">{t.finance.addExpense}</button>
      </form>
    </div>
  );
}
