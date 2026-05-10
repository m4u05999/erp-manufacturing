import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/core/email/service";

type NotificationType = "lead_stage" | "po_received" | "ticket_resolved" | "info";

export async function createNotification(params: {
  userId: string;
  title: string;
  message?: string;
  type?: NotificationType;
  link?: string;
}) {
  const notification = await prisma.notification.create({
    data: {
      userId: params.userId,
      title: params.title,
      message: params.message,
      type: params.type ?? "info",
      link: params.link,
    },
  });

  const user = await prisma.user.findUnique({ where: { id: params.userId } });
  if (user?.email) {
    await sendEmail(
      user.email,
      params.title,
      `<p>${params.message ?? params.title}</p>${params.link ? `<p><a href="${process.env.NEXTAUTH_URL}${params.link}">View details</a></p>` : ""}`,
    );
  }

  return notification;
}

export async function createNotificationForUsers(params: {
  userIds: string[];
  title: string;
  message?: string;
  type?: NotificationType;
  link?: string;
}) {
  return Promise.all(
    params.userIds.map((userId) =>
      createNotification({ ...params, userId }),
    ),
  );
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({ where: { userId, isRead: false } });
}

export async function getNotifications(userId: string, limit = 20) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function markAsRead(id: string) {
  await prisma.notification.update({ where: { id }, data: { isRead: true } });
}

export async function markAllAsRead(userId: string) {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}
