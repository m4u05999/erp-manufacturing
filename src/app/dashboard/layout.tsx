import Link from "next/link";
import SidebarNav from "@/components/sidebar-nav";
import LocaleSwitcher from "@/components/locale-switcher";
import NotificationBell from "@/components/notification-bell";
import { getT } from "@/core/i18n/server";
import { getSession } from "@/lib/get-session";
import { getUnreadCount } from "@/core/notifications/service";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const t = await getT();
  const session = await getSession();
  const unreadCount = session?.user?.id ? await getUnreadCount(session.user.id) : 0;
  return (
    <div className="flex min-h-screen">
      <aside className="w-56 border-e border-zinc-200 bg-white p-4 flex flex-col">
        <Link href="/dashboard" className="mb-6 block text-lg font-semibold text-zinc-900">
          {t.common.appName}
        </Link>
        <SidebarNav />
        <div className="mt-auto">
          <LocaleSwitcher />
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <header className="flex items-center justify-end gap-3 border-b border-zinc-200 bg-white px-6 py-3">
          <NotificationBell initialCount={unreadCount} />
        </header>
        {children}
      </main>
    </div>
  );
}
