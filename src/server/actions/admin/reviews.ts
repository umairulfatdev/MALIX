"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

async function requireAdminAction() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }
  return user;
}

export async function getAdminReviews(params: {
  search?: string;
  status?: string;
  page?: number;
  perPage?: number;
}) {
  try {
    await requireAdminAction();
  } catch {
    return { reviews: [], total: 0, page: 1, totalPages: 0 };
  }

  const { search, status, page = 1, perPage = 20 } = params;

  const where: any = {};

  if (search && search.trim()) {
    where.OR = [
      { body: { contains: search, mode: "insensitive" } },
      { title: { contains: search, mode: "insensitive" } },
      { user: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  if (status === "VISIBLE") where.isHidden = false;
  if (status === "HIDDEN") where.isHidden = true;
  if (status === "REPORTED") where.isReported = true;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
        content: { select: { id: true, title: true, slug: true, posterUrl: true } },
      },
    }),
    prisma.review.count({ where }),
  ]);

  return {
    reviews,
    total,
    page,
    totalPages: Math.ceil(total / perPage),
  };
}

// ============================================================
// TOGGLE REVIEW VISIBILITY
// ============================================================

export async function toggleReviewVisibilityAction(reviewId: string) {
  try {
    await requireAdminAction();
  } catch {
    return { error: "Unauthorized" };
  }

  try {
    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) return { error: "Review not found" };

    await prisma.review.update({
      where: { id: reviewId },
      data: { isHidden: !review.isHidden },
    });

    revalidatePath("/admin/reviews");

    return { success: true, isHidden: !review.isHidden };
  } catch (error) {
    console.error("Toggle review error:", error);
    return { error: "Failed to update review" };
  }
}

// ============================================================
// DELETE REVIEW
// ============================================================

export async function deleteReviewAction(reviewId: string) {
  try {
    await requireAdminAction();
  } catch {
    return { error: "Unauthorized" };
  }

  try {
    await prisma.review.delete({ where: { id: reviewId } });
    revalidatePath("/admin/reviews");

    return { success: true };
  } catch (error) {
    console.error("Delete review error:", error);
    return { error: "Failed to delete review" };
  }
}

// ============================================================
// REVIEW STATS
// ============================================================

export async function getReviewStats() {
  try {
    await requireAdminAction();
  } catch {
    return null;
  }

  const [total, visible, hidden, reported] = await Promise.all([
    prisma.review.count(),
    prisma.review.count({ where: { isHidden: false } }),
    prisma.review.count({ where: { isHidden: true } }),
    prisma.review.count({ where: { isReported: true } }),
  ]);

  return { total, visible, hidden, reported };
}