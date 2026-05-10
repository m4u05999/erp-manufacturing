import { createLead } from "@/domains/sales/actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getT } from "@/core/i18n/server";

export default async function NewLeadPage() {
  const t = await getT();

  return (
    <div className="p-6 max-w-xl">
      <div className="mb-6">
        <Link href="/dashboard/sales" className="text-sm text-zinc-500 hover:text-zinc-900">&larr; {t.sales.pipeline}</Link>
        <h1 className="mt-2 text-2xl font-semibold">{t.sales.newLead}</h1>
      </div>

      <form
        action={async (formData: FormData) => {
          "use server";
          const data = {
            companyName: formData.get("companyName") as string,
            contactName: formData.get("contactName") as string,
            contactEmail: formData.get("contactEmail") as string,
            contactPhone: formData.get("contactPhone") as string,
            source: formData.get("source") as string,
            notes: formData.get("notes") as string,
          };
          await createLead(data);
          redirect("/dashboard/sales");
        }}
        className="space-y-4"
      >
        <div>
          <label className="mb-1 block text-sm text-zinc-600">{`${t.sales.companyName} *`}</label>
          <input name="companyName" required className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-600">{`${t.sales.contactName} *`}</label>
          <input name="contactName" required className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm text-zinc-600">{t.common.email}</label>
            <input name="contactEmail" type="email" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-zinc-600">{t.common.phone}</label>
            <input name="contactPhone" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-600">{t.sales.source}</label>
          <select name="source" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm">
            <option value="">{t.common.select}</option>
            <option value="website">{t.sales.sourceWebsite}</option>
            <option value="referral">{t.sales.sourceReferral}</option>
            <option value="call">{t.sales.sourceCall}</option>
            <option value="walkin">{t.sales.sourceWalkin}</option>
            <option value="exhibition">{t.sales.sourceExhibition}</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-600">{t.common.notes}</label>
          <textarea name="notes" rows={4} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
        </div>
        <button type="submit" className="rounded-lg bg-zinc-900 px-6 py-2 text-sm text-white hover:bg-zinc-800">
          {t.sales.createLead}
        </button>
      </form>
    </div>
  );
}
