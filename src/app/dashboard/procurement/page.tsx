import { getSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getT } from "@/core/i18n/server";

export const dynamic = "force-dynamic";

export default async function ProcurementPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  const t = await getT();

  const [orders, suppliers, inventory] = await Promise.all([
    prisma.purchaseOrder.findMany({ orderBy: { createdAt: "desc" }, include: { supplier: { select: { name: true } } } }),
    prisma.supplier.findMany({ orderBy: { name: "asc" } }),
    prisma.inventoryItem.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-semibold">{t.nav.procurement}</h1>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-medium">{t.dashboard.pos}</h2>
          <Link href="/dashboard/procurement/purchase-orders/new" className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs text-white hover:bg-zinc-800">{t.procurement.newPO}</Link>
        </div>
        <div className="space-y-2">
          {orders.length === 0 && <p className="text-sm text-zinc-400">{t.procurement.noPOs}</p>}
          {orders.map((po) => (
            <div key={po.id} className="flex items-center justify-between rounded-lg border border-zinc-200 p-3">
              <div>
                <p className="text-sm font-medium">{po.poNumber}</p>
                <p className="text-xs text-zinc-500">{po.supplier.name}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{Number(po.totalAmount).toLocaleString()} SAR</span>
                <span className={`rounded px-2 py-0.5 text-xs ${
                  po.status === "RECEIVED" ? "bg-green-100 text-green-700" :
                  po.status === "CONFIRMED" ? "bg-blue-100 text-blue-700" :
                  "bg-zinc-100 text-zinc-600"
                }`}>{po.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-medium">{t.procurement.suppliers}</h2>
          <Link href="/dashboard/procurement/suppliers/new" className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs text-white hover:bg-zinc-800">{t.procurement.addSupplier}</Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {suppliers.length === 0 && <p className="text-sm text-zinc-400">{t.procurement.noSuppliers}</p>}
          {suppliers.map((s) => (
            <div key={s.id} className="rounded-lg border border-zinc-200 bg-white p-4">
              <p className="font-medium text-sm">{s.name}</p>
              <p className="text-xs text-zinc-500">{s.contactName} · {s.contactPhone}</p>
              {s.category && <span className="mt-1 inline-block rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">{s.category}</span>}
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-medium">{t.dashboard.inventory}</h2>
          <Link href="/dashboard/procurement/inventory/new" className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs text-white hover:bg-zinc-800">{t.inventory.addItem}</Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {inventory.length === 0 && <p className="text-sm text-zinc-400">{t.inventory.noItems}</p>}
          {inventory.map((item) => (
            <div key={item.id} className="rounded-lg border border-zinc-200 bg-white p-4">
              <div className="flex items-start justify-between">
                <p className="font-medium text-sm">{item.name}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  Number(item.quantity) <= Number(item.minQuantity) ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                }`}>
                  {Number(item.quantity).toFixed(0)} {item.unit}
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-400">{item.sku}</p>
              {item.unitCost && <p className="mt-1 text-xs text-zinc-500">{Number(item.unitCost).toFixed(2)} SAR/unit</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
