"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export interface WatchContent {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: string;
  releaseYear: number | null;
  duration: number | null;
  backdropUrl: string | null;
  posterUrl: string | null;
  avgRating: number | null;
  videoUrl: string | null;
  genres: { id: string; name: string; slug: string }[];
  seasonNumber?: number;
  episodeNumber?: number;
  episodeTitle?: string;
  episodeId?: string;
  episodeDescription?: string | null;
  nextEpisodeId?: string | null;
  prevEpisodeId?: string | null;
  initialProgress?: {
    position: number;
    duration: number;
    percentage: number;
  } | null;
}

export async function getWatchContent(
  slug: string,
  episodeId?: string
): Promise<WatchContent | null> {
  const content = await prisma.content.findUnique({
    where: { slug },
    include: {
      genres: { select: { id: true, name: true, slug: true } },
      series: {
        include: {
          seasons: {
            orderBy: { seasonNumber: "asc" },
            include: {
              episodes: { orderBy: { episodeNum: "asc" } },
            },
          },
        },
      },
      videoSources: {
        where: { isDefault: true },
        take: 1,
      },
    },
  });

  if (!content || content.status !== "PUBLISHED") return null;

  const user = await getCurrentUser();

  // ============ SERIES ============
  if (content.type === "SERIES" && content.series) {
    // Find episode (either given or first)
    let foundEpisode: any = null;
    let foundSeason: any = null;
    const allEpisodes: any[] = [];

    for (const season of content.series.seasons) {
      for (const ep of season.episodes) {
        allEpisodes.push({ ...ep, seasonNumber: season.seasonNumber });
        if (episodeId && ep.id === episodeId) {
          foundEpisode = ep;
          foundSeason = season;
        }
      }
    }

    // If no episodeId given, use first episode
    if (!foundEpisode && allEpisodes.length > 0) {
      const firstEpId = allEpisodes[0].id;
      // Recursive call with first episode id
      return getWatchContent(slug, firstEpId);
    }

    if (!foundEpisode) return null;

    const currentIndex = allEpisodes.findIndex((e) => e.id === foundEpisode.id);
    const nextEpisodeId = allEpisodes[currentIndex + 1]?.id || null;
    const prevEpisodeId = allEpisodes[currentIndex - 1]?.id || null;

    let initialProgress = null;
    if (user) {
      const history = await prisma.watchHistory.findFirst({
        where: {
          userId: user.id,
          contentId: content.id,
          episodeId: foundEpisode.id,
        },
      });
      if (history) {
        initialProgress = {
          position: history.position,
          duration: history.duration,
          percentage: history.progress,
        };
      }
    }

    return {
      id: content.id,
      title: content.title,
      slug: content.slug,
      description: content.description,
      type: content.type,
      releaseYear: content.releaseYear,
      duration: foundEpisode.duration,
      backdropUrl: content.backdropUrl,
      posterUrl: content.posterUrl,
      avgRating: content.avgRating,
      videoUrl: foundEpisode.videoUrl,
      genres: content.genres,
      seasonNumber: foundSeason.seasonNumber,
      episodeNumber: foundEpisode.episodeNum,
      episodeTitle: foundEpisode.title,
      episodeId: foundEpisode.id,
      episodeDescription: foundEpisode.description,
      nextEpisodeId,
      prevEpisodeId,
      initialProgress,
    };
  }

  // ============ MOVIE / DRAMA ============
  const videoUrl = content.videoSources[0]?.url || null;

  let initialProgress = null;
  if (user) {
    const history = await prisma.watchHistory.findFirst({
      where: {
        userId: user.id,
        contentId: content.id,
        episodeId: null,
      },
    });
    if (history) {
      initialProgress = {
        position: history.position,
        duration: history.duration,
        percentage: history.progress,
      };
    }
  }

  return {
    id: content.id,
    title: content.title,
    slug: content.slug,
    description: content.description,
    type: content.type,
    releaseYear: content.releaseYear,
    duration: content.duration,
    backdropUrl: content.backdropUrl,
    posterUrl: content.posterUrl,
    avgRating: content.avgRating,
    videoUrl,
    genres: content.genres,
    initialProgress,
  };
}

export async function saveWatchProgress(
  contentId: string,
  episodeId: string | null,
  position: number,
  duration: number
) {
  const user = await getCurrentUser();
  if (!user) return { success: false };

  const percentage = duration > 0 ? (position / duration) * 100 : 0;
  const isCompleted = percentage >= 90;

  try {
    const existing = await prisma.watchHistory.findFirst({
      where: {
        userId: user.id,
        contentId,
        episodeId,
      },
    });

    if (existing) {
      await prisma.watchHistory.update({
        where: { id: existing.id },
        data: {
          position: Math.floor(position),
          duration: Math.floor(duration),
          progress: percentage,
          isCompleted,
          lastWatched: new Date(),
        },
      });
    } else {
      await prisma.watchHistory.create({
        data: {
          userId: user.id,
          contentId,
          episodeId,
          position: Math.floor(position),
          duration: Math.floor(duration),
          progress: percentage,
          isCompleted,
        },
      });

      // Increment views only on new watch
      await prisma.content.update({
        where: { id: contentId },
        data: { totalViews: { increment: 1 } },
      });
    }

    // Also update WatchProgress for Continue Watching
    const existingProgress = await prisma.watchProgress.findFirst({
      where: {
        userId: user.id,
        contentId,
        episodeId,
      },
    });

    if (existingProgress) {
      await prisma.watchProgress.update({
        where: { id: existingProgress.id },
        data: {
          position: Math.floor(position),
          duration: Math.floor(duration),
          percentage,
        },
      });
    } else {
      await prisma.watchProgress.create({
        data: {
          userId: user.id,
          contentId,
          episodeId,
          position: Math.floor(position),
          duration: Math.floor(duration),
          percentage,
        },
      });
    }

    return { success: true };
  } catch (err) {
    console.error("Save progress error:", err);
    return { success: false };
  }
}