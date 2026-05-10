import { getSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { createPurchaseOrder } from "@/domains/procurement/actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getT } from "@/core/i18n/server";

export const dynamic = "force-dynamic";

export default async function NewPOPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  const t = await getT();

  const [suppliers, projects] = await Promise.all([
    prisma.supplier.findMany({ orderBy: { name: "asc" } }),
    prisma.project.findMany({ where: { status: { notIn: ["COMPLETED", "CANCELLED"] } }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="p-6 max-w-xl">
      <Link href="/dashboard/procurement" className="text-sm text-zinc-500 hover:text-zinc-900">&larr; {t.nav.procurement}</Link>
      <h1 className="mt-2 mb-6 text-2xl font-semibold">{t.procurement.newPO}</h1>

      <form
        action={async (formData: FormData) => {
          "use server";
          const items = JSON.parse(formData.get("items") as string);
          await createPurchaseOrder({
            supplierId: formData.get("supplierId") as string,
            projectId: formData.get("projectId") as string || undefined,
            items,
            expectedDate: formData.get("expectedDate") as string || undefined,
            notes: formData.get("notes") as string,
          });
          redirect("/dashboard/procurement");
        }}
        className="space-y-4"
      >
        <div>
          <label className="mb-1 block text-sm text-zinc-600">{`${t.procurement.supplier} *`}</label>
          <select name="supplierId" required className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm">
            <option value="">{t.common.select}</option>
            {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-600">{t.procurement.projectOptional}</label>
          <select name="projectId" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm">
            <option value="">{t.common.none}</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-600">{t.procurement.itemsJSON}</label>
          <textarea
            name="items"
            rows={4}
            defaultValue={JSON.stringify([{ description: "", quantity: 1, unitPrice: 0 }], null, 2)}
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm font-mono"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-600">{t.procurement.expectedDelivery}</label>
          <input name="expectedDate" type="date" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-600">{t.common.notes}</label>
          <textarea name="notes" rows={2} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
        </div>
        <button type="submit" className="rounded-lg bg-zinc-900 px-6 py-2 text-sm text-white hover:bg-zinc-800">
          {t.procurement.createPO}
        </button>
      </form>
    </div>
  );
}
