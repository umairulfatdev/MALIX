
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// ============================================================
// GET WATCH HISTORY
// ============================================================

export async function getWatchHistory() {
  const user = await getCurrentUser();
  if (!user) return [];

  const history = await prisma.watchHistory.findMany({
    where: { userId: user.id },
    orderBy: { lastWatched: "desc" },
    include: {
      content: {
        select: {
          id: true,
          title: true,
          slug: true,
          posterUrl: true,
          backdropUrl: true,
          releaseYear: true,
          avgRating: true,
          duration: true,
          type: true,
          description: true,
          genres: {
            select: { id: true, name: true, slug: true },
          },
        },
      },
    },
  });

  return history;
}

// ============================================================
// GET CONTINUE WATCHING (incomplete items only)
// ============================================================

export async function getContinueWatching(limit = 10) {
  const user = await getCurrentUser();
  if (!user) return [];

  const items = await prisma.watchHistory.findMany({
    where: {
      userId: user.id,
      isCompleted: false,
      progress: { gt: 0, lt: 95 }, // 0 < progress < 95
    },
    orderBy: { lastWatched: "desc" },
    take: limit,
    include: {
      content: {
        select: {
          id: true,
          title: true,
          slug: true,
          posterUrl: true,
          backdropUrl: true,
          releaseYear: true,
          avgRating: true,
          duration: true,
          type: true,
        },
      },
    },
  });

  return items;
}

// ============================================================
// GET SINGLE CONTENT PROGRESS
// ============================================================

export async function getContentProgress(contentId: string) {
  const user = await getCurrentUser();
  if (!user) return null;

  const progress = await prisma.watchHistory.findFirst({
    where: {
      userId: user.id,
      contentId,
    },
    orderBy: { lastWatched: "desc" },
  });

  return progress;
}

// ============================================================
// DELETE SINGLE HISTORY ITEM
// ============================================================

export async function deleteHistoryItemAction(historyId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in" };

  try {
    await prisma.watchHistory.delete({
      where: {
        id: historyId,
        userId: user.id, // Security: only own history
      },
    });

    revalidatePath("/history");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Delete history error:", error);
    return { error: "Failed to delete history item" };
  }
}

// ============================================================
// CLEAR ALL HISTORY
// ============================================================

export async function clearAllHistoryAction() {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in" };

  try {
    await prisma.watchHistory.deleteMany({
      where: { userId: user.id },
    });

    revalidatePath("/history");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Clear history error:", error);
    return { error: "Failed to clear history" };
  }
}

// ============================================================
// GET HISTORY STATS
// ============================================================

export async function getHistoryStats() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [total, completed, inProgress] = await Promise.all([
    prisma.watchHistory.count({ where: { userId: user.id } }),
    prisma.watchHistory.count({
      where: { userId: user.id, isCompleted: true },
    }),
    prisma.watchHistory.count({
      where: {
        userId: user.id,
        isCompleted: false,
        progress: { gt: 0 },
      },
    }),
  ]);

  return { total, completed, inProgress };
}