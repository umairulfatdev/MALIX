"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

async function requireAdminAction() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") throw new Error("FORBIDDEN");
  return user;
}

// ============================================================
// GET DOWNLOAD STATS
// ============================================================

export async function getDownloadStats() {
  try {
    await requireAdminAction();
  } catch {
    return null;
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [total, todayCount, weekCount, monthCount] = await Promise.all([
    prisma.downloadHistory.count(),
    prisma.downloadHistory.count({
      where: { createdAt: { gte: today } },
    }),
    prisma.downloadHistory.count({
      where: { createdAt: { gte: weekAgo } },
    }),
    prisma.downloadHistory.count({
      where: { createdAt: { gte: monthAgo } },
    }),
  ]);

  return { total, today: todayCount, week: weekCount, month: monthCount };
}

// ============================================================
// GET ALL DOWNLOADS (with filters)
// ============================================================

export async function getAdminDownloads(params: {
  search?: string;
  quality?: string;
  page?: number;
  perPage?: number;
}) {
  try {
    await requireAdminAction();
  } catch {
    return { downloads: [], total: 0, page: 1, totalPages: 0 };
  }

  const { search, quality, page = 1, perPage = 20 } = params;

  const where: any = {};

  if (search && search.trim()) {
    where.OR = [
      { user: { name: { contains: search, mode: "insensitive" } } },
      { user: { email: { contains: search, mode: "insensitive" } } },
      { content: { title: { contains: search, mode: "insensitive" } } },
    ];
  }

  if (quality && quality !== "ALL") {
    where.quality = quality;
  }

  const [downloads, total] = await Promise.all([
    prisma.downloadHistory.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        content: {
          select: { id: true, title: true, slug: true, posterUrl: true, type: true },
        },
      },
    }),
    prisma.downloadHistory.count({ where }),
  ]);

  return {
    downloads,
    total,
    page,
    totalPages: Math.ceil(total / perPage),
  };
}

// ============================================================
// MOST DOWNLOADED CONTENT
// ============================================================

export async function getMostDownloadedContent(limit = 10) {
  try {
    await requireAdminAction();
  } catch {
    return [];
  }

  const results = await prisma.downloadHistory.groupBy({
    by: ["contentId"],
    _count: { contentId: true },
    orderBy: { _count: { contentId: "desc" } },
    take: limit,
  });

  const contentIds = results.map((r) => r.contentId);

  const contents = await prisma.content.findMany({
    where: { id: { in: contentIds } },
    select: {
      id: true,
      title: true,
      slug: true,
      posterUrl: true,
      type: true,
      avgRating: true,
    },
  });

  const contentMap = new Map(contents.map((c) => [c.id, c]));

  return results.map((r) => ({
    content: contentMap.get(r.contentId),
    downloadCount: r._count.contentId,
  })).filter((item) => item.content);
}

// ============================================================
// DOWNLOADS BY QUALITY
// ============================================================

export async function getDownloadsByQuality() {
  try {
    await requireAdminAction();
  } catch {
    return [];
  }

  const results = await prisma.downloadHistory.groupBy({
    by: ["quality"],
    _count: { quality: true },
  });

  return results.map((r) => ({
    quality: r.quality,
    count: r._count.quality,
  }));
}

// ============================================================
// DOWNLOADS TIMELINE (Last 7 days)
// ============================================================

export async function getDownloadsTimeline() {
  try {
    await requireAdminAction();
  } catch {
    return [];
  }

  const days = 7;
  const data: { date: string; count: number }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const start = new Date();
    start.setDate(start.getDate() - i);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const count = await prisma.downloadHistory.count({
      where: {
        createdAt: {
          gte: start,
          lt: end,
        },
      },
    });

    data.push({
      date: start.toLocaleDateString("en-US", { weekday: "short" }),
      count,
    });
  }

  return data;
}