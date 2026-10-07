"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// ============================================================
// SUBMIT REVIEW (create or update — one per user per content)
// ============================================================

export interface ReviewFormState {
  error?: string;
  success?: boolean;
}

export async function submitReviewAction(
  _prev: ReviewFormState,
  formData: FormData
): Promise<ReviewFormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in to write a review" };

  const contentId = (formData.get("contentId") as string)?.trim();
  const title = (formData.get("title") as string)?.trim() || null;
  const body = (formData.get("body") as string)?.trim();

  if (!contentId) return { error: "Content ID required" };
  if (!body || body.length < 10) {
    return { error: "Review must be at least 10 characters" };
  }
  if (body.length > 5000) {
    return { error: "Review is too long (max 5000 chars)" };
  }

  try {
    // ✅ Upsert with unique constraint
    await prisma.review.upsert({
      where: {
        userId_contentId: {
          userId: user.id,
          contentId,
        },
      },
      update: { title, body },
      create: {
        userId: user.id,
        contentId,
        title,
        body,
      },
    });

    revalidatePath(`/content/${contentId}`);

    return { success: true };
  } catch (error) {
    console.error("Submit review error:", error);
    return { error: "Failed to submit review. Please try again." };
  }
}

// ============================================================
// DELETE OWN REVIEW
// ============================================================

export async function deleteOwnReviewAction(reviewId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in" };

  try {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review || review.userId !== user.id) {
      return { error: "You can only delete your own reviews" };
    }

    await prisma.review.delete({ where: { id: reviewId } });

    revalidatePath(`/content`);

    return { success: true };
  } catch (error) {
    console.error("Delete review error:", error);
    return { error: "Failed to delete review" };
  }
}

// ============================================================
// REPORT REVIEW
// ============================================================

export async function reportReviewAction(reviewId: string, reason?: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in" };

  try {
    await prisma.review.update({
      where: { id: reviewId },
      data: {
        isReported: true,
        reportReason: reason || "Inappropriate content",
      },
    });

    revalidatePath(`/content`);

    return { success: true };
  } catch (error) {
    console.error("Report review error:", error);
    return { error: "Failed to report review" };
  }
}

// ============================================================
// GET REVIEWS FOR CONTENT
// ============================================================

export async function getContentReviews(contentId: string) {
  return await prisma.review.findMany({
    where: {
      contentId,
      isHidden: false,
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });
}

// ============================================================
// GET USER'S OWN REVIEW
// ============================================================

export async function getUserReview(contentId: string) {
  const user = await getCurrentUser();
  if (!user) return null;

  return await prisma.review.findUnique({
    where: {
      userId_contentId: {
        userId: user.id,
        contentId,
      },
    },
  });
}

// ============================================================
// REVIEW STATS
// ============================================================

export async function getContentReviewStats(contentId: string) {
  const total = await prisma.review.count({
    where: { contentId, isHidden: false },
  });

  return { total };
}