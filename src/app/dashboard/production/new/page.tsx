import { getSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { createProductionOrder } from "@/domains/production/actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getT } from "@/core/i18n/server";

export const dynamic = "force-dynamic";

export default async function NewProductionOrderPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const t = await getT();

  const projects = await prisma.project.findMany({
    where: { status: { notIn: ["CANCELLED"] } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-6 max-w-xl">
      <Link href="/dashboard/production" className="text-sm text-zinc-500 hover:text-zinc-900">&larr; {t.nav.production}</Link>
      <h1 className="mt-2 mb-6 text-2xl font-semibold">{t.production.newOrder}</h1>

      <form
        action={async (formData: FormData) => {
          "use server";
          await createProductionOrder({
            projectId: formData.get("projectId") as string || undefined,
            productName: formData.get("productName") as string,
            quantity: Number(formData.get("quantity")),
            priority: formData.get("priority") as "LOW" | "MEDIUM" | "HIGH" || undefined,
            scheduledDate: formData.get("scheduledDate") as string || undefined,
            notes: formData.get("notes") as string || undefined,
            assignedTo: formData.get("assignedTo") as string || undefined,
          });
          redirect("/dashboard/production");
        }}
        className="space-y-4"
      >
        <div>
          <label className="mb-1 block text-sm text-zinc-600">{`${t.production.productName} *`}</label>
          <input
            name="productName"
            required
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-600">{`${t.production.quantity} *`}</label>
          <input
            name="quantity"
            type="number"
            min="1"
            required
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-600">{t.production.priority}</label>
          <select name="priority" defaultValue="MEDIUM" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm">
            <option value="LOW">{t.common.priority.low}</option>
            <option value="MEDIUM">{t.common.priority.medium}</option>
            <option value="HIGH">{t.common.priority.high}</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-600">{t.production.projectOptional}</label>
          <select name="projectId" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm">
            <option value="">{t.common.none}</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-600">{t.production.scheduledDate}</label>
          <input name="scheduledDate" type="date" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-600">{t.common.assignedTo}</label>
          <input name="assignedTo" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-600">{t.common.notes}</label>
          <textarea name="notes" rows={3} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
        </div>
        <button type="submit" className="rounded-lg bg-zinc-900 px-6 py-2 text-sm text-white hover:bg-zinc-800">
          {t.production.createOrder}
        </button>
      </form>
    </div>
  );
}
