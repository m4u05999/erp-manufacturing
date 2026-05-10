import { getSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { createTicket } from "@/domains/customer-service/actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getT } from "@/core/i18n/server";

export const dynamic = "force-dynamic";

export default async function NewTicketPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  const t = await getT();

  const projects = await prisma.project.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="p-6 max-w-xl">
      <Link href="/dashboard/customer-service" className="text-sm text-zinc-500 hover:text-zinc-900">&larr; {t.nav.customerService}</Link>
      <h1 className="mt-2 mb-6 text-2xl font-semibold">{t.customerService.newTicket}</h1>

      <form
        action={async (formData: FormData) => {
          "use server";
          await createTicket({
            customerName: formData.get("customerName") as string,
            customerPhone: formData.get("customerPhone") as string || undefined,
            subject: formData.get("subject") as string,
            description: formData.get("description") as string,
            category: formData.get("category") as string || undefined,
            priority: formData.get("priority") as "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined,
            projectId: formData.get("projectId") as string || undefined,
          });
          redirect("/dashboard/customer-service");
        }}
        className="space-y-4"
      >
<div className="grid grid-cols-2 gap-4">
           <div>
             <label className="mb-1 block text-sm text-zinc-600">{`${t.customerService.customerName} *`}</label>
             <input name="customerName" required className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
           </div>
           <div>
             <label className="mb-1 block text-sm text-zinc-600">{t.common.phone}</label>
             <input name="customerPhone" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
           </div>
         </div>
         <div>
           <label className="mb-1 block text-sm text-zinc-600">{`${t.customerService.subject} *`}</label>
           <input name="subject" required className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
         </div>
         <div>
           <label className="mb-1 block text-sm text-zinc-600">{`${t.common.description} *`}</label>
           <textarea name="description" required rows={3} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
         </div>
         <div className="grid grid-cols-2 gap-4">
           <div>
             <label className="mb-1 block text-sm text-zinc-600">{t.finance.category}</label>
             <select name="category" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm">
               <option value="">{t.common.select}</option>
               <option value="INSTALLATION">{t.customerService.categoryInstallation}</option>
               <option value="QUALITY">{t.customerService.categoryQuality}</option>
               <option value="MAINTENANCE">{t.customerService.categoryMaintenance}</option>
               <option value="BILLING">{t.customerService.categoryBilling}</option>
               <option value="OTHER">{t.customerService.categoryOther}</option>
             </select>
           </div>
           <div>
             <label className="mb-1 block text-sm text-zinc-600">{t.production.priority}</label>
             <select name="priority" defaultValue="MEDIUM" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm">
               <option value="LOW">{t.common.priority.low}</option>
               <option value="MEDIUM">{t.common.priority.medium}</option>
               <option value="HIGH">{t.common.priority.high}</option>
               <option value="URGENT">{t.common.priority.urgent}</option>
             </select>
           </div>
         </div>
         <div>
           <label className="mb-1 block text-sm text-zinc-600">{t.customerService.relatedProject}</label>
           <select name="projectId" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm">
             <option value="">{t.common.none}</option>
             {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
           </select>
         </div>
         <button type="submit" className="rounded-lg bg-zinc-900 px-6 py-2 text-sm text-white hover:bg-zinc-800">{t.customerService.createTicket}</button>
      </form>
    </div>
  );
}
