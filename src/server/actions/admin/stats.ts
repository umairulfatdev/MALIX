"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

async function requireAdminAction() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") throw new Error("FORBIDDEN");
  return user;
}

// ============================================================
// OVERALL STATS
// ============================================================

export async function getStatsOverview() {
  try {
    await requireAdminAction();
  } catch {
    return null;
  }

  const [
    totalUsers,
    totalContent,
    totalMovies,
    totalDramas,
    totalSeries,
    totalAnime,
    totalEpisodes,
    totalViews,
    totalDownloads,
    totalRatings,
    totalReviews,
    totalWatchlist,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.content.count(),
    prisma.content.count({ where: { type: "MOVIE" } }),
    prisma.content.count({ where: { type: "DRAMA" } }),
    prisma.content.count({ where: { type: "SERIES" } }),
    prisma.content.count({ where: { type: "ANIME" } }),
    prisma.episode.count(),
    prisma.content.aggregate({ _sum: { totalViews: true } }),
    prisma.downloadHistory.count(),
    prisma.rating.count(),
    prisma.review.count(),
    prisma.watchlist.count(),
  ]);

  return {
    totalUsers,
    totalContent,
    totalMovies,
    totalDramas,
    totalSeries,
    totalAnime,
    totalEpisodes,
    totalViews: totalViews._sum.totalViews || 0,
    totalDownloads,
    totalRatings,
    totalReviews,
    totalWatchlist,
  };
}

// ============================================================
// CONTENT TYPE BREAKDOWN
// ============================================================

export async function getContentTypeBreakdown() {
  try {
    await requireAdminAction();
  } catch {
    return [];
  }

  const results = await prisma.content.groupBy({
    by: ["type"],
    _count: { type: true },
  });

  return results.map((r) => ({
    name: r.type,
    count: r._count.type,
  }));
}

// ============================================================
// USER GROWTH (Last 30 days)
// ============================================================

export async function getUserGrowth() {
  try {
    await requireAdminAction();
  } catch {
    return [];
  }

  const days = 30;
  const data: { date: string; count: number }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const start = new Date();
    start.setDate(start.getDate() - i);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const count = await prisma.user.count({
      where: {
        createdAt: {
          gte: start,
          lt: end,
        },
      },
    });

    // Only add to array every 3 days to keep chart clean
    if (i % 3 === 0 || i === 0) {
      data.push({
        date: start.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        count,
      });
    }
  }

  return data;
}

// ============================================================
// TOP RATED CONTENT
// ============================================================

export async function getTopRatedContent(limit = 10) {
  try {
    await requireAdminAction();
  } catch {
    return [];
  }

  return await prisma.content.findMany({
    where: { avgRating: { gt: 0 }, totalRatings: { gte: 3 } },
    orderBy: { avgRating: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      slug: true,
      posterUrl: true,
      type: true,
      avgRating: true,
      totalRatings: true,
    },
  });
}

// ============================================================
// MOST VIEWED CONTENT
// ============================================================

export async function getMostViewedContentStats(limit = 10) {
  try {
    await requireAdminAction();
  } catch {
    return [];
  }

  return await prisma.content.findMany({
    where: { totalViews: { gt: 0 } },
    orderBy: { totalViews: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      slug: true,
      posterUrl: true,
      type: true,
      totalViews: true,
      avgRating: true,
    },
  });
}

// ============================================================
// RECENT ACTIVITY
// ============================================================

export async function getRecentActivity(limit = 10) {
  try {
    await requireAdminAction();
  } catch {
    return [];
  }

  const [users, reviews, downloads] = await Promise.all([
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, createdAt: true, avatarUrl: true },
    }),
    prisma.review.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, avatarUrl: true } },
        content: { select: { title: true } },
      },
    }),
    prisma.downloadHistory.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, avatarUrl: true } },
        content: { select: { title: true } },
      },
    }),
  ]);

  // Merge and sort by date
  const activities = [
    ...users.map((u) => ({
      type: "USER" as const,
      user: u.name,
      avatarUrl: u.avatarUrl,
      detail: "joined MALIX",
      date: u.createdAt,
    })),
    ...reviews.map((r) => ({
      type: "REVIEW" as const,
      user: r.user.name,
      avatarUrl: r.user.avatarUrl,
      detail: `reviewed "${r.content.title}"`,
      date: r.createdAt,
    })),
    ...downloads.map((d) => ({
      type: "DOWNLOAD" as const,
      user: d.user.name,
      avatarUrl: d.user.avatarUrl,
      detail: `downloaded "${d.content.title}" (${d.quality})`,
      date: d.createdAt,
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, limit);

  return activities;
}