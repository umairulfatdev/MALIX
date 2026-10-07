import { prisma } from "@/lib/prisma";

export interface DashboardStats {
  totalUsers: number;
  totalMovies: number;
  totalDramas: number;
  totalSeries: number;
  totalEpisodes: number;
  totalSeasons: number;
  totalGenres: number;
  totalDownloads: number;
  totalWatchSessions: number;
  totalReviews: number;
  totalWatchlistItems: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [
    totalUsers,
    totalMovies,
    totalDramas,
    totalSeries,
    totalEpisodes,
    totalSeasons,
    totalGenres,
    totalDownloads,
    totalWatchSessions,
    totalReviews,
    totalWatchlistItems,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.content.count({ where: { type: "MOVIE" } }),
    prisma.content.count({ where: { type: "DRAMA" } }),
    prisma.content.count({ where: { type: "SERIES" } }),
    prisma.episode.count(),
    prisma.season.count(),
    prisma.genre.count(),
    prisma.downloadHistory.count(),
    prisma.watchHistory.count(),
    prisma.review.count(),
    prisma.watchlist.count(),
  ]);

  return {
    totalUsers,
    totalMovies,
    totalDramas,
    totalSeries,
    totalEpisodes,
    totalSeasons,
    totalGenres,
    totalDownloads,
    totalWatchSessions,
    totalReviews,
    totalWatchlistItems,
  };
}

export async function getRecentUsers(limit = 5) {
  return await prisma.user.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      avatarUrl: true,
    },
  });
}

export async function getRecentContent(limit = 5) {
  return await prisma.content.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      type: true,
      status: true,
      releaseYear: true,
      avgRating: true,
      createdAt: true,
      posterUrl: true,
    },
  });
}

export async function getMostViewedContent(limit = 5) {
  return await prisma.content.findMany({
    take: limit,
    orderBy: { totalViews: "desc" },
    where: { totalViews: { gt: 0 } },
    select: {
      id: true,
      title: true,
      slug: true,
      type: true,
      totalViews: true,
      avgRating: true,
      posterUrl: true,
    },
  });
}

export async function getRecentReviews(limit = 5) {
  return await prisma.review.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true } },
      content: { select: { id: true, title: true, slug: true } },
    },
  });
}