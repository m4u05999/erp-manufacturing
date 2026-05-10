"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Notification = {
  id: string;
  title: string;
  message: string | null;
  type: string;
  isRead: boolean;
  link: string | null;
  createdAt: string;
};

export default function NotificationBell({ initialCount = 0 }: { initialCount?: number }) {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(initialCount);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setNotifications(data.notifications ?? []);
      setUnread(data.unread ?? 0);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  const handleToggle = useCallback(async () => {
    if (!open) await fetchNotifications();
    setOpen((v) => !v);
  }, [open, fetchNotifications]);

  const handleMarkRead = useCallback(async (id: string) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    setUnread((v) => Math.max(0, v - 1));
  }, []);

  const handleMarkAllRead = useCallback(async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnread(0);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button onClick={handleToggle} className="relative rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700">
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{unread}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-zinc-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
            <p className="text-sm font-medium text-zinc-900">Notifications</p>
            {unread > 0 && <button onClick={handleMarkAllRead} className="text-xs text-zinc-500 hover:text-zinc-700">Mark all read</button>}
          </div>
          <div className="max-h-72 overflow-y-auto">
            {loading ? (
              <p className="p-4 text-center text-sm text-zinc-400">Loading...</p>
            ) : notifications.length === 0 ? (
              <p className="p-4 text-center text-sm text-zinc-400">No notifications</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    if (!n.isRead) handleMarkRead(n.id);
                    if (n.link) router.push(n.link);
                    setOpen(false);
                  }}
                  className={`w-full border-b border-zinc-50 px-4 py-3 text-left transition hover:bg-zinc-50 ${n.isRead ? "" : "bg-blue-50"}`}
                >
                  <p className={`text-sm ${n.isRead ? "text-zinc-700" : "font-medium text-zinc-900"}`}>{n.title}</p>
                  {n.message && <p className="mt-0.5 text-xs text-zinc-500">{n.message}</p>}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
