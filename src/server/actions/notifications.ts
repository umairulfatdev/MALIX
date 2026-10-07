"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// ============================================================
// GET USER NOTIFICATIONS
// ============================================================

export async function getUserNotifications(limit = 20) {
  const user = await getCurrentUser();
  if (!user) return [];

  return await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

// ============================================================
// GET UNREAD COUNT
// ============================================================

export async function getUnreadCount() {
  const user = await getCurrentUser();
  if (!user) return 0;

  return await prisma.notification.count({
    where: { userId: user.id, isRead: false },
  });
}

// ============================================================
// MARK AS READ
// ============================================================

export async function markNotificationReadAction(notificationId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in" };

  try {
    await prisma.notification.update({
      where: { id: notificationId, userId: user.id },
      data: { isRead: true, readAt: new Date() },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Mark read error:", error);
    return { error: "Failed to mark as read" };
  }
}

// ============================================================
// MARK ALL AS READ
// ============================================================

export async function markAllReadAction() {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in" };

  try {
    await prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Mark all read error:", error);
    return { error: "Failed to mark all as read" };
  }
}

// ============================================================
// DELETE NOTIFICATION
// ============================================================

export async function deleteNotificationAction(notificationId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in" };

  try {
    await prisma.notification.delete({
      where: { id: notificationId, userId: user.id },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Delete notification error:", error);
    return { error: "Failed to delete notification" };
  }
}

// ============================================================
// HELPER: CREATE NOTIFICATION (used internally)
// ============================================================

export async function createNotification(params: {
  userId: string;
  type: "NEW_CONTENT" | "NEW_EPISODE" | "ANNOUNCEMENT" | "ACCOUNT" | "SYSTEM";
  title: string;
  message: string;
  linkUrl?: string;
  imageUrl?: string;
}) {
  try {
    await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        linkUrl: params.linkUrl,
        imageUrl: params.imageUrl,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Create notification error:", error);
    return { error: "Failed to create notification" };
  }
}

// ============================================================
// BROADCAST TO ALL USERS (admin only)
// ============================================================

export async function broadcastNotificationAction(params: {
  title: string;
  message: string;
  type: "NEW_CONTENT" | "NEW_EPISODE" | "ANNOUNCEMENT" | "ACCOUNT" | "SYSTEM";
  linkUrl?: string;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return { error: "Unauthorized" };

  try {
    const allUsers = await prisma.user.findMany({
      where: { isActive: true },
      select: { id: true },
    });

    await prisma.notification.createMany({
      data: allUsers.map((u) => ({
        userId: u.id,
        type: params.type,
        title: params.title,
        message: params.message,
        linkUrl: params.linkUrl,
      })),
    });

    revalidatePath("/");
    return { success: true, count: allUsers.length };
  } catch (error) {
    console.error("Broadcast error:", error);
    return { error: "Failed to broadcast" };
  }
}