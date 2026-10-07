"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/**
 * Watchlist me add karein
 */
export async function addToWatchlist(contentId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Please sign in to add to watchlist" };
  }

  try {
    await prisma.watchlist.upsert({
      where: {
        userId_contentId: {
          userId: user.id,
          contentId,
        },
      },
      update: {},
      create: {
        userId: user.id,
        contentId,
      },
    });

    revalidatePath("/watchlist");
    revalidatePath("/content", "layout");
    return { success: true };
  } catch (error) {
    console.error("Add to watchlist error:", error);
    return { error: "Failed to add to watchlist" };
  }
}

/**
 * Watchlist se remove karein
 */
export async function removeFromWatchlist(contentId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Please sign in" };
  }

  try {
    await prisma.watchlist.deleteMany({
      where: {
        userId: user.id,
        contentId,
      },
    });

    revalidatePath("/watchlist");
    revalidatePath("/content", "layout");
    return { success: true };
  } catch (error) {
    console.error("Remove from watchlist error:", error);
    return { error: "Failed to remove from watchlist" };
  }
}

/**
 * Check karein ke content watchlist me hai ya nahi
 */
export async function isInWatchlist(contentId: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const item = await prisma.watchlist.findUnique({
    where: {
      userId_contentId: {
        userId: user.id,
        contentId,
      },
    },
  });

  return !!item;
}

/**
 * User ki poori watchlist fetch karein
 */
export async function getUserWatchlist() {
  const user = await getCurrentUser();
  if (!user) return [];

  const items = await prisma.watchlist.findMany({
    where: { userId: user.id },
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
    orderBy: { createdAt: "desc" },
  });

  return items;
}

/**
 * User ke watchlist items ki count
 */
export async function getWatchlistCount(): Promise<number> {
  const user = await getCurrentUser();
  if (!user) return 0;

  return await prisma.watchlist.count({
    where: { userId: user.id },
  });
}