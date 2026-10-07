"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// ============================================================
// SAVE WATCH PROGRESS
// ============================================================

export async function saveWatchProgress(params: {
  contentId: string;
  episodeId?: string;
  position: number; // seconds
  duration: number; // seconds
}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in" };

  const { contentId, episodeId, position, duration } = params;

  if (duration <= 0) return { error: "Invalid duration" };

  const progress = Math.min(100, Math.max(0, (position / duration) * 100));
  const isCompleted = progress >= 90; // 90%+ = completed

  try {
    // Check if history exists
    const existing = await prisma.watchHistory.findFirst({
      where: {
        userId: user.id,
        contentId,
        episodeId: episodeId || null,
      },
    });

    if (existing) {
      await prisma.watchHistory.update({
        where: { id: existing.id },
        data: {
          position: Math.floor(position),
          duration: Math.floor(duration),
          progress,
          isCompleted,
          lastWatched: new Date(),
        },
      });
    } else {
      await prisma.watchHistory.create({
        data: {
          userId: user.id,
          contentId,
          episodeId: episodeId || null,
          position: Math.floor(position),
          duration: Math.floor(duration),
          progress,
          isCompleted,
        },
      });

      // Increment content total views only on first watch
      await prisma.content.update({
        where: { id: contentId },
        data: { totalViews: { increment: 1 } },
      });
    }

    revalidatePath("/history");
    revalidatePath("/");

    return { success: true, progress, isCompleted };
  } catch (error) {
    console.error("Save progress error:", error);
    return { error: "Failed to save progress" };
  }
}

// ============================================================
// GET PROGRESS FOR PLAYER (to resume)
// ============================================================

export async function getPlaybackProgress(
  contentId: string,
  episodeId?: string
) {
  const user = await getCurrentUser();
  if (!user) return null;

  const progress = await prisma.watchHistory.findFirst({
    where: {
      userId: user.id,
      contentId,
      episodeId: episodeId || null,
    },
  });

  return progress;
}

// ============================================================
// MARK AS COMPLETED
// ============================================================

export async function markAsCompletedAction(
  contentId: string,
  episodeId?: string
) {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in" };

  try {
    const existing = await prisma.watchHistory.findFirst({
      where: {
        userId: user.id,
        contentId,
        episodeId: episodeId || null,
      },
    });

    if (existing) {
      await prisma.watchHistory.update({
        where: { id: existing.id },
        data: {
          isCompleted: true,
          progress: 100,
          lastWatched: new Date(),
        },
      });
    }

    revalidatePath("/history");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Mark completed error:", error);
    return { error: "Failed to mark as completed" };
  }
}

// ============================================================
// REMOVE FROM CONTINUE WATCHING
// ============================================================

export async function removeFromContinueWatchingAction(historyId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in" };

  try {
    await prisma.watchHistory.update({
      where: { id: historyId, userId: user.id },
      data: {
        isCompleted: true,
        progress: 100,
      },
    });

    revalidatePath("/history");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Remove from continue error:", error);
    return { error: "Failed to remove" };
  }
}