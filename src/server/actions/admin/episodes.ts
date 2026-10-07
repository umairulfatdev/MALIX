"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

async function requireAdminAction() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") throw new Error("FORBIDDEN");
  return user;
}

// ============================================================
// GET ALL EPISODES (with filters)
// ============================================================

export async function getAdminEpisodes(params: {
  search?: string;
  seriesId?: string;
  status?: string;
  page?: number;
  perPage?: number;
}) {
  try {
    await requireAdminAction();
  } catch {
    return { episodes: [], total: 0, page: 1, totalPages: 0 };
  }

  const { search, seriesId, status, page = 1, perPage = 30 } = params;

  const where: any = {
    seasonId: { not: null }, // only series episodes
  };

  if (search && search.trim()) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  if (seriesId && seriesId !== "ALL") {
    where.season = { seriesId };
  }

  if (status && status !== "ALL") {
    where.status = status;
  }

  const [episodes, total] = await Promise.all([
    prisma.episode.findMany({
      where,
      orderBy: [
        { season: { series: { content: { title: "asc" } } } },
        { season: { seasonNumber: "asc" } },
        { episodeNum: "asc" },
      ],
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        season: {
          include: {
            series: {
              include: {
                content: {
                  select: {
                    id: true,
                    title: true,
                    slug: true,
                    posterUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
    prisma.episode.count({ where }),
  ]);

  return {
    episodes,
    total,
    page,
    totalPages: Math.ceil(total / perPage),
  };
}

// ============================================================
// GET ALL SERIES FOR FILTER DROPDOWN
// ============================================================

export async function getAllSeriesForEpisodeFilter() {
  try {
    await requireAdminAction();
  } catch {
    return [];
  }

  const seriesList = await prisma.content.findMany({
    where: { type: "SERIES" },
    orderBy: { title: "asc" },
    select: { id: true, title: true },
  });

  return seriesList;
}

// ============================================================
// EPISODE STATS
// ============================================================

export async function getEpisodeStats() {
  try {
    await requireAdminAction();
  } catch {
    return null;
  }

  const [total, published, draft] = await Promise.all([
    prisma.episode.count({ where: { seasonId: { not: null } } }),
    prisma.episode.count({
      where: { seasonId: { not: null }, status: "PUBLISHED" },
    }),
    prisma.episode.count({
      where: { seasonId: { not: null }, status: "DRAFT" },
    }),
  ]);

  return { total, published, draft };
}

// ============================================================
// UPDATE EPISODE (inline edit)
// ============================================================

export async function updateEpisodeAction(
  episodeId: string,
  formData: FormData
) {
  try {
    await requireAdminAction();
  } catch {
    return { error: "Unauthorized" };
  }

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const episodeNumRaw = formData.get("episodeNum") as string;
  const durationRaw = formData.get("duration") as string;
  const videoUrl = (formData.get("videoUrl") as string)?.trim() || null;
  const thumbnailUrl =
    (formData.get("thumbnailUrl") as string)?.trim() || null;
  const status = (formData.get("status") as string) || "DRAFT";

  if (!title || title.length < 1) {
    return { error: "Title required" };
  }

  const episodeNum = episodeNumRaw ? parseInt(episodeNumRaw) : 1;
  const duration = durationRaw ? parseInt(durationRaw) : null;

  try {
    const updated = await prisma.episode.update({
      where: { id: episodeId },
      data: {
        title,
        description,
        episodeNum,
        duration,
        videoUrl,
        thumbnailUrl,
        status: status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
      },
      include: {
        season: {
          include: {
            series: { include: { content: true } },
          },
        },
      },
    });

    revalidatePath("/admin/episodes");
    if (updated.season) {
      revalidatePath(`/admin/series/${updated.season.series.content.id}/edit`);
      revalidatePath(`/content/${updated.season.series.content.slug}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Update episode error:", error);
    return { error: "Failed to update episode" };
  }
}

// ============================================================
// DELETE EPISODE
// ============================================================

export async function deleteEpisodeAdminAction(episodeId: string) {
  try {
    await requireAdminAction();
  } catch {
    return { error: "Unauthorized" };
  }

  try {
    const episode = await prisma.episode.findUnique({
      where: { id: episodeId },
      include: {
        season: { include: { series: { include: { content: true } } } },
      },
    });

    await prisma.episode.delete({ where: { id: episodeId } });

    revalidatePath("/admin/episodes");
    if (episode?.season) {
      revalidatePath(`/admin/series/${episode.season.series.content.id}/edit`);
    }

    return { success: true };
  } catch (error) {
    console.error("Delete episode error:", error);
    return { error: "Failed to delete episode" };
  }
}

// ============================================================
// TOGGLE EPISODE PUBLISH
// ============================================================

export async function toggleEpisodePublishAction(episodeId: string) {
  try {
    await requireAdminAction();
  } catch {
    return { error: "Unauthorized" };
  }

  try {
    const episode = await prisma.episode.findUnique({
      where: { id: episodeId },
    });

    if (!episode) return { error: "Not found" };

    const newStatus = episode.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";

    await prisma.episode.update({
      where: { id: episodeId },
      data: { status: newStatus },
    });

    revalidatePath("/admin/episodes");

    return { success: true, status: newStatus };
  } catch (error) {
    console.error("Toggle episode error:", error);
    return { error: "Failed to toggle status" };
  }
}