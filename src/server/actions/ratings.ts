"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// ============================================================
// SUBMIT OR UPDATE RATING
// ============================================================

export async function submitRatingAction(contentId: string, score: number) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Please sign in to rate" };
  }

  if (score < 1 || score > 5) {
    return { error: "Rating must be between 1 and 5" };
  }

  try {
    // Upsert: create or update
    await prisma.rating.upsert({
      where: {
        userId_contentId: {
          userId: user.id,
          contentId,
        },
      },
      update: { score },
      create: {
        userId: user.id,
        contentId,
        score,
      },
    });

    // Recalculate average for content
    await recalculateContentRating(contentId);

    revalidatePath(`/content/${contentId}`);
    revalidatePath("/movies");
    revalidatePath("/");

    return { success: true, score };
  } catch (error) {
    console.error("Submit rating error:", error);
    return { error: "Failed to submit rating" };
  }
}

// ============================================================
// REMOVE RATING
// ============================================================

export async function removeRatingAction(contentId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in" };

  try {
    await prisma.rating.deleteMany({
      where: {
        userId: user.id,
        contentId,
      },
    });

    await recalculateContentRating(contentId);

    revalidatePath(`/content/${contentId}`);
    revalidatePath("/movies");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Remove rating error:", error);
    return { error: "Failed to remove rating" };
  }
}

// ============================================================
// GET USER RATING
// ============================================================

export async function getUserRating(contentId: string) {
  const user = await getCurrentUser();
  if (!user) return null;

  const rating = await prisma.rating.findUnique({
    where: {
      userId_contentId: {
        userId: user.id,
        contentId,
      },
    },
  });

  return rating;
}

// ============================================================
// GET CONTENT RATING STATS
// ============================================================

export async function getContentRatingStats(contentId: string) {
  const ratings = await prisma.rating.findMany({
    where: { contentId },
    select: { score: true },
  });

  const total = ratings.length;
  const average =
    total > 0
      ? ratings.reduce((sum, r) => sum + r.score, 0) / total
      : 0;

  // Distribution (1-5)
  const distribution = [1, 2, 3, 4, 5].map((score) => ({
    score,
    count: ratings.filter((r) => r.score === score).length,
    percentage:
      total > 0
        ? (ratings.filter((r) => r.score === score).length / total) * 100
        : 0,
  }));

  return {
    average,
    total,
    distribution: distribution.reverse(), // 5 first
  };
}

// ============================================================
// HELPER: RECALCULATE CONTENT AVERAGE
// ============================================================

async function recalculateContentRating(contentId: string) {
  const ratings = await prisma.rating.findMany({
    where: { contentId },
    select: { score: true },
  });

  const total = ratings.length;
  const average =
    total > 0
      ? ratings.reduce((sum, r) => sum + r.score, 0) / total
      : 0;

  await prisma.content.update({
    where: { id: contentId },
    data: {
      avgRating: Math.round(average * 10) / 10,
      totalRatings: total,
    },
  });
}