import { NextResponse } from "next/server";
import { getSession } from "@/lib/get-session";
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from "@/core/notifications/service";

export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [notifications, unread] = await Promise.all([
    getNotifications(session.user.id),
    getUnreadCount(session.user.id),
  ]);
  return NextResponse.json({ notifications, unread });
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  if (body.all) {
    await markAllAsRead(session.user.id);
  } else if (body.id) {
    await markAsRead(body.id);
  }
  return NextResponse.json({ ok: true });
}
