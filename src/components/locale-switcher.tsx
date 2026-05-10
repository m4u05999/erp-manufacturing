"use client";

import { useI18n } from "@/core/i18n";

export default function LocaleSwitcher() {
  const { t, locale, setLocale } = useI18n();

  return (
    <button
      onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
      className="rounded-lg px-3 py-2 text-xs text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
    >
      {locale === "ar" ? t.common.english : t.common.arabic}
    </button>
  );
}
