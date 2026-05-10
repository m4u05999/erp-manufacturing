import { createInventoryItem } from "@/domains/procurement/actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getT } from "@/core/i18n/server";

export default async function NewInventoryPage() {
  const t = await getT();

  return (
    <div className="p-6 max-w-xl">
      <Link href="/dashboard/procurement" className="text-sm text-zinc-500 hover:text-zinc-900">&larr; {t.nav.procurement}</Link>
      <h1 className="mt-2 mb-6 text-2xl font-semibold">{t.inventory.newItem}</h1>

      <form
        action={async (formData: FormData) => {
          "use server";
          await createInventoryItem({
            sku: formData.get("sku") as string,
            name: formData.get("name") as string,
            category: formData.get("category") as string,
            unit: formData.get("unit") as string,
            minQuantity: formData.get("minQuantity") ? Number(formData.get("minQuantity")) : 0,
            unitCost: formData.get("unitCost") ? Number(formData.get("unitCost")) : undefined,
            location: formData.get("location") as string,
          });
          redirect("/dashboard/procurement");
        }}
        className="space-y-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm text-zinc-600">{`${t.inventory.sku} *`}</label>
            <input name="sku" required className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-zinc-600">{t.inventory.unit}</label>
            <select name="unit" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm">
              <option value="pcs">{t.inventory.pcs}</option>
              <option value="m">{t.inventory.m}</option>
              <option value="m2">{t.inventory.sqm}</option>
              <option value="kg">{t.inventory.kg}</option>
              <option value="roll">{t.inventory.roll}</option>
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-600">{`${t.inventory.itemName} *`}</label>
          <input name="name" required className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm text-zinc-600">{t.finance.category}</label>
            <select name="category" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm">
              <option value="">{t.common.select}</option>
              <option value="aluminum">{t.inventory.categoryAluminum}</option>
              <option value="glass">{t.inventory.categoryGlass}</option>
              <option value="upvc">{t.inventory.categoryUpvc}</option>
              <option value="hardware">{t.inventory.categoryHardware}</option>
              <option value="acp">{t.inventory.categoryAcp}</option>
              <option value="consumable">{t.inventory.categoryConsumable}</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-zinc-600">{t.projects.location}</label>
            <input name="location" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm text-zinc-600">{t.inventory.minQuantity}</label>
            <input name="minQuantity" type="number" defaultValue={0} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-zinc-600">{t.inventory.unitCost}</label>
            <input name="unitCost" type="number" step={0.01} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
          </div>
        </div>
        <button type="submit" className="rounded-lg bg-zinc-900 px-6 py-2 text-sm text-white hover:bg-zinc-800">
          {t.inventory.addItem}
        </button>
      </form>
    </div>
  );
}
