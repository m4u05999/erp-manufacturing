import { createSupplier } from "@/domains/procurement/actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getT } from "@/core/i18n/server";

export default async function NewSupplierPage() {
  const t = await getT();

  return (
    <div className="p-6 max-w-xl">
      <Link href="/dashboard/procurement" className="text-sm text-zinc-500 hover:text-zinc-900">&larr; {t.nav.procurement}</Link>
      <h1 className="mt-2 mb-6 text-2xl font-semibold">{t.procurement.newSupplier}</h1>

      <form
        action={async (formData: FormData) => {
          "use server";
          await createSupplier({
            name: formData.get("name") as string,
            contactName: formData.get("contactName") as string,
            contactEmail: formData.get("contactEmail") as string,
            contactPhone: formData.get("contactPhone") as string,
            address: formData.get("address") as string,
            category: formData.get("category") as string,
          });
          redirect("/dashboard/procurement");
        }}
        className="space-y-4"
      >
        <div>
          <label className="mb-1 block text-sm text-zinc-600">{`${t.sales.companyName} *`}</label>
          <input name="name" required className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm text-zinc-600">{t.sales.contactName}</label>
            <input name="contactName" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-zinc-600">{t.common.phone}</label>
            <input name="contactPhone" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-600">{t.common.email}</label>
          <input name="contactEmail" type="email" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-600">{t.finance.category}</label>
          <select name="category" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm">
            <option value="">{t.common.select}</option>
            <option value="aluminum">{t.inventory.categoryAluminum}</option>
            <option value="glass">{t.inventory.categoryGlass}</option>
            <option value="upvc">{t.inventory.categoryUpvc}</option>
            <option value="hardware">{t.inventory.categoryHardware}</option>
            <option value="acp">{t.inventory.categoryAcp}</option>
            <option value="other">{t.customerService.categoryOther}</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-600">{t.common.address}</label>
          <textarea name="address" rows={2} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
        </div>
        <button type="submit" className="rounded-lg bg-zinc-900 px-6 py-2 text-sm text-white hover:bg-zinc-800">
          {t.procurement.addSupplier}
        </button>
      </form>
    </div>
  );
}
