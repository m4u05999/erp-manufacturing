"use client";

import Link from "next/link";
import { useI18n } from "@/core/i18n";

const navKeys = [
  { key: "dashboard", href: "/dashboard" },
  { key: "sales", href: "/dashboard/sales" },
  { key: "projects", href: "/dashboard/projects" },
  { key: "procurement", href: "/dashboard/procurement" },
  { key: "production", href: "/dashboard/production" },
  { key: "finance", href: "/dashboard/finance" },
  { key: "hr", href: "/dashboard/hr" },
  { key: "engineering", href: "/dashboard/engineering" },
  { key: "customerService", href: "/dashboard/customer-service" },
  { key: "aiChat", href: "/dashboard/ai-chat" },
];

export default function SidebarNav() {
  const { t } = useI18n();

  return (
    <nav className="flex flex-1 flex-col gap-1">
      {navKeys.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="rounded-lg px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
        >
          {(t.nav as Record<string, string>)[item.key]}
        </Link>
      ))}
    </nav>
  );
}
