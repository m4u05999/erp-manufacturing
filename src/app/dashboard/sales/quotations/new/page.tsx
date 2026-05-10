"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createQuotation } from "@/domains/sales/actions";
import { useI18n } from "@/core/i18n";

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

function QuotationForm() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const leadId = searchParams.get("leadId") ?? "";
  const [items, setItems] = useState<LineItem[]>([{ description: "", quantity: 1, unitPrice: 0 }]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInput, setAiInput] = useState({ projectType: "", dimensions: "", material: "", quantity: 1, notes: "" });

  async function generateWithAI() {
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/generate-quotation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: "",
          projectType: aiInput.projectType,
          dimensions: aiInput.dimensions,
          material: aiInput.material,
          quantity: aiInput.quantity,
          additionalNotes: aiInput.notes,
        }),
      });
      const data = await res.json();
      if (data.items) {
        setItems(data.items.map((i: any) => ({ description: i.description, quantity: i.quantity, unitPrice: i.unitPrice })));
      }
    } catch (e) {
      console.error("AI generation failed", e);
    }
    setAiLoading(false);
  }

  function updateItem(index: number, field: keyof LineItem, value: string | number) {
    setItems(items.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  }

  function addItem() {
    setItems([...items, { description: "", quantity: 1, unitPrice: 0 }]);
  }

  function removeItem(index: number) {
    if (items.length > 1) setItems(items.filter((_, i) => i !== index));
  }

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = {
      leadId: form.get("leadId") as string,
      items: items.filter((i) => i.description),
      discount: Number(form.get("discount")) || 0,
      taxRate: Number(form.get("taxRate")) || 0,
    };
    await createQuotation(data);
    router.push(`/dashboard/sales/leads/${data.leadId}`);
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold">{t.sales.newQuotation}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="hidden" name="leadId" value={leadId} />

        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
          <p className="text-sm font-medium text-blue-800 mb-2">{t.ai.generate}</p>
          <div className="grid grid-cols-2 gap-3">
            <input value={aiInput.projectType} onChange={(e) => setAiInput({ ...aiInput, projectType: e.target.value })} placeholder={t.sales.projectTypePlaceholder} className="rounded-lg border border-blue-200 px-3 py-2 text-sm" />
            <input value={aiInput.dimensions} onChange={(e) => setAiInput({ ...aiInput, dimensions: e.target.value })} placeholder={t.sales.dimensionsPlaceholder} className="rounded-lg border border-blue-200 px-3 py-2 text-sm" />
            <input value={aiInput.material} onChange={(e) => setAiInput({ ...aiInput, material: e.target.value })} placeholder={t.sales.materialPlaceholder} className="rounded-lg border border-blue-200 px-3 py-2 text-sm" />
            <input value={aiInput.quantity} onChange={(e) => setAiInput({ ...aiInput, quantity: Number(e.target.value) })} type="number" min={1} placeholder={t.production.quantity} className="rounded-lg border border-blue-200 px-3 py-2 text-sm" />
            <input value={aiInput.notes} onChange={(e) => setAiInput({ ...aiInput, notes: e.target.value })} placeholder={t.common.additionalNotes} className="col-span-2 rounded-lg border border-blue-200 px-3 py-2 text-sm" />
          </div>
          <button type="button" onClick={generateWithAI} disabled={aiLoading} className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50">
            {aiLoading ? t.sales.generating : t.sales.generateItems}
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="flex gap-3 items-start">
              <input
                placeholder={t.common.description}
                value={item.description}
                onChange={(e) => updateItem(i, "description", e.target.value)}
                className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                required
              />
              <input
                type="number"
                placeholder={t.production.quantity}
                value={item.quantity}
                onChange={(e) => updateItem(i, "quantity", Number(e.target.value))}
                className="w-20 rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                min={1}
              />
              <input
                type="number"
                placeholder={t.common.price}
                value={item.unitPrice}
                onChange={(e) => updateItem(i, "unitPrice", Number(e.target.value))}
                className="w-28 rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                min={0}
                step={0.01}
              />
              {items.length > 1 && (
                <button type="button" onClick={() => removeItem(i)} className="px-2 py-2 text-sm text-red-500">×</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addItem} className="text-sm text-zinc-600 hover:text-zinc-900">{t.common.addItem}</button>
        </div>
        <div className="border-t border-zinc-200 pt-4">
          <p className="text-sm text-zinc-600">{`${t.common.subtotal}: ${subtotal.toFixed(2)} SAR`}</p>
          <div className="mt-2 grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm text-zinc-600">{t.common.discount}</label>
              <input name="discount" type="number" defaultValue={0} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-zinc-600">{t.common.taxRate}</label>
              <input name="taxRate" type="number" defaultValue={0} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
            </div>
          </div>
        </div>
        <button type="submit" className="rounded-lg bg-zinc-900 px-6 py-2 text-sm text-white hover:bg-zinc-800">
          {t.sales.createQuotation}
        </button>
      </form>
    </div>
  );
}

export default function NewQuotationPage() {
  const { t } = useI18n();
  return (
    <Suspense fallback={<div className="p-6">{t.common.loading}</div>}>
      <QuotationForm />
    </Suspense>
  );
}
