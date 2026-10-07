"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { slugify } from "@/lib/utils";

async function requireAdminAction() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") throw new Error("FORBIDDEN");
  return user;
}

export interface SeriesFormState {
  error?: string;
  success?: boolean;
}

// ============================================================
// GET SERIES FOR ADMIN
// ============================================================

export async function getAdminSeries(params: {
  search?: string;
  status?: string;
  page?: number;
  perPage?: number;
}) {
  try {
    await requireAdminAction();
  } catch {
    return { series: [], total: 0, page: 1, totalPages: 0 };
  }

  const { search, status, page = 1, perPage = 20 } = params;
  const where: any = { type: "SERIES" };

  if (search && search.trim()) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }
  if (status && status !== "ALL") where.status = status;

  const [series, total] = await Promise.all([
    prisma.content.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        genres: { select: { id: true, name: true, slug: true } },
        series: {
          include: {
            _count: { select: { seasons: true } },
          },
        },
      },
    }),
    prisma.content.count({ where }),
  ]);

  return { series, total, page, totalPages: Math.ceil(total / perPage) };
}

// ============================================================
// GET SERIES FOR EDIT (with seasons + episodes)
// ============================================================

export async function getSeriesForEdit(seriesId: string) {
  try {
    await requireAdminAction();
  } catch {
    return null;
  }

  return await prisma.content.findUnique({
    where: { id: seriesId, type: "SERIES" },
    include: {
      genres: { select: { id: true, name: true } },
      series: {
        include: {
          seasons: {
            orderBy: { seasonNumber: "asc" },
            include: {
              episodes: {
                orderBy: { episodeNum: "asc" },
              },
            },
          },
        },
      },
    },
  });
}

// ============================================================
// CREATE SERIES
// ============================================================

export async function createSeriesAction(
  _prev: SeriesFormState,
  formData: FormData
): Promise<SeriesFormState> {
  try {
    await requireAdminAction();
  } catch {
    return { error: "Unauthorized" };
  }

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const shortDesc = (formData.get("shortDesc") as string)?.trim() || null;
  const releaseYearRaw = formData.get("releaseYear") as string;
  const language = (formData.get("language") as string)?.trim() || null;
  const country = (formData.get("country") as string)?.trim() || null;
  const posterUrl = (formData.get("posterUrl") as string)?.trim() || null;
  const backdropUrl = (formData.get("backdropUrl") as string)?.trim() || null;
  const trailerUrl = (formData.get("trailerUrl") as string)?.trim() || null;
  const status = (formData.get("status") as string) || "DRAFT";
  const isFeatured = formData.get("isFeatured") === "on";
  const genreIds = formData.getAll("genres") as string[];

  if (!title || title.length < 2) {
    return { error: "Title is required (min 2 characters)" };
  }
  if (!description || description.length < 10) {
    return { error: "Description is required (min 10 characters)" };
  }

  const releaseYear = releaseYearRaw ? parseInt(releaseYearRaw) : null;

  let slug = slugify(title);
  const existing = await prisma.content.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now()}`;

  try {
    await prisma.content.create({
      data: {
        title,
        slug,
        description,
        shortDesc,
        type: "SERIES",
        releaseYear,
        language,
        country,
        posterUrl,
        backdropUrl,
        trailerUrl,
        status: status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
        isFeatured,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
        genres: genreIds.length
          ? { connect: genreIds.map((id) => ({ id })) }
          : undefined,
        series: {
          create: { totalSeasons: 0 },
        },
      },
    });

    revalidatePath("/admin/series");
    revalidatePath("/series");
    revalidatePath("/");
    redirect("/admin/series");
  } catch (error) {
    console.error("Create series error:", error);
    return { error: "Failed to create series" };
  }
}

// ============================================================
// UPDATE SERIES
// ============================================================

export async function updateSeriesAction(
  seriesId: string,
  _prev: SeriesFormState,
  formData: FormData
): Promise<SeriesFormState> {
  try {
    await requireAdminAction();
  } catch {
    return { error: "Unauthorized" };
  }

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const shortDesc = (formData.get("shortDesc") as string)?.trim() || null;
  const releaseYearRaw = formData.get("releaseYear") as string;
  const language = (formData.get("language") as string)?.trim() || null;
  const country = (formData.get("country") as string)?.trim() || null;
  const posterUrl = (formData.get("posterUrl") as string)?.trim() || null;
  const backdropUrl = (formData.get("backdropUrl") as string)?.trim() || null;
  const trailerUrl = (formData.get("trailerUrl") as string)?.trim() || null;
  const status = (formData.get("status") as string) || "DRAFT";
  const isFeatured = formData.get("isFeatured") === "on";
  const genreIds = formData.getAll("genres") as string[];

  if (!title || title.length < 2) return { error: "Title required" };
  if (!description || description.length < 10)
    return { error: "Description required" };

  const releaseYear = releaseYearRaw ? parseInt(releaseYearRaw) : null;

  try {
    const existing = await prisma.content.findUnique({
      where: { id: seriesId },
      include: { series: true },
    });

    if (!existing) return { error: "Series not found" };

    await prisma.content.update({
      where: { id: seriesId },
      data: {
        title,
        description,
        shortDesc,
        releaseYear,
        language,
        country,
        posterUrl,
        backdropUrl,
        trailerUrl,
        status: status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
        isFeatured,
        publishedAt:
          status === "PUBLISHED" && !existing.publishedAt
            ? new Date()
            : existing.publishedAt,
        genres: {
          set: [],
          connect: genreIds.map((id) => ({ id })),
        },
        series: existing.series
          ? { update: {} }
          : { create: { totalSeasons: 0 } },
      },
    });

    revalidatePath("/admin/series");
    revalidatePath(`/admin/series/${seriesId}/edit`);
    revalidatePath("/series");
    revalidatePath("/");
    redirect("/admin/series");
  } catch (error) {
    console.error("Update series error:", error);
    return { error: "Failed to update series" };
  }
}

// ============================================================
// DELETE SERIES
// ============================================================

export async function deleteSeriesAction(seriesId: string) {
  try {
    await requireAdminAction();
  } catch {
    return { error: "Unauthorized" };
  }

  try {
    await prisma.content.delete({ where: { id: seriesId } });
    revalidatePath("/admin/series");
    revalidatePath("/series");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Delete series error:", error);
    return { error: "Failed to delete series" };
  }
}

// ============================================================
// TOGGLE PUBLISH
// ============================================================

export async function toggleSeriesPublishAction(seriesId: string) {
  try {
    await requireAdminAction();
  } catch {
    return { error: "Unauthorized" };
  }

  try {
    const content = await prisma.content.findUnique({ where: { id: seriesId } });
    if (!content) return { error: "Not found" };

    const newStatus = content.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";

    await prisma.content.update({
      where: { id: seriesId },
      data: {
        status: newStatus,
        publishedAt:
          newStatus === "PUBLISHED" ? new Date() : content.publishedAt,
      },
    });

    revalidatePath("/admin/series");
    revalidatePath("/series");
    revalidatePath("/");
    return { success: true, status: newStatus };
  } catch (error) {
    console.error("Toggle series publish error:", error);
    return { error: "Failed to toggle status" };
  }
}

// ============================================================
// SEASONS
// ============================================================

export interface SeasonFormState {
  error?: string;
  success?: boolean;
}

export async function createSeasonAction(
  seriesId: string,
  _prev: SeasonFormState,
  formData: FormData
): Promise<SeasonFormState> {
  try {
    await requireAdminAction();
  } catch {
    return { error: "Unauthorized" };
  }

  const seasonNumberRaw = formData.get("seasonNumber") as string;
  const title = (formData.get("title") as string)?.trim() || null;
  const description = (formData.get("description") as string)?.trim() || null;
  const posterUrl = (formData.get("posterUrl") as string)?.trim() || null;
  const releaseYearRaw = formData.get("releaseYear") as string;

  const seasonNumber = seasonNumberRaw ? parseInt(seasonNumberRaw) : 1;
  const releaseYear = releaseYearRaw ? parseInt(releaseYearRaw) : null;

  if (seasonNumber < 1) {
    return { error: "Season number must be at least 1" };
  }

  try {
    // Get series internal ID
    const seriesContent = await prisma.content.findUnique({
      where: { id: seriesId },
      include: { series: true },
    });

    if (!seriesContent || !seriesContent.series) {
      return { error: "Series not found" };
    }

    // Check unique season number
    const existing = await prisma.season.findFirst({
      where: {
        seriesId: seriesContent.series.id,
        seasonNumber,
      },
    });

    if (existing) {
      return { error: `Season ${seasonNumber} already exists` };
    }

    await prisma.season.create({
      data: {
        seriesId: seriesContent.series.id,
        seasonNumber,
        title,
        description,
        posterUrl,
        releaseYear,
        status: "PUBLISHED",
      },
    });

    // Update series totalSeasons
    const count = await prisma.season.count({
      where: { seriesId: seriesContent.series.id },
    });
    await prisma.series.update({
      where: { id: seriesContent.series.id },
      data: { totalSeasons: count },
    });

    revalidatePath(`/admin/series/${seriesId}/edit`);
    revalidatePath(`/series`);
    revalidatePath(`/content/${seriesContent.slug}`);

    return { success: true };
  } catch (error) {
    console.error("Create season error:", error);
    return { error: "Failed to create season" };
  }
}

export async function deleteSeasonAction(seasonId: string) {
  try {
    await requireAdminAction();
  } catch {
    return { error: "Unauthorized" };
  }

  try {
    const season = await prisma.season.findUnique({
      where: { id: seasonId },
      include: { series: { include: { content: true } } },
    });

    if (!season) return { error: "Season not found" };

    const seriesId = season.seriesId;

    await prisma.season.delete({ where: { id: seasonId } });

    // Update series totalSeasons
    const count = await prisma.season.count({ where: { seriesId } });
    await prisma.series.update({
      where: { id: seriesId },
      data: { totalSeasons: count },
    });

    revalidatePath(`/admin/series/${season.series.content.id}/edit`);
    revalidatePath(`/series`);

    return { success: true };
  } catch (error) {
    console.error("Delete season error:", error);
    return { error: "Failed to delete season" };
  }
}

// ============================================================
// EPISODES
// ============================================================

export async function createEpisodeAction(
  seasonId: string,
  formData: FormData
) {
  try {
    await requireAdminAction();
  } catch {
    return { error: "Unauthorized" };
  }

  const episodeNumRaw = formData.get("episodeNum") as string;
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const thumbnailUrl =
    (formData.get("thumbnailUrl") as string)?.trim() || null;
  const durationRaw = formData.get("duration") as string;
  const videoUrl = (formData.get("videoUrl") as string)?.trim() || null;
  const status = (formData.get("status") as string) || "DRAFT";

  const episodeNum = episodeNumRaw ? parseInt(episodeNumRaw) : 1;
  const duration = durationRaw ? parseInt(durationRaw) : null;

  if (!title || title.length < 1) {
    return { error: "Episode title required" };
  }

  try {
    await prisma.episode.create({
      data: {
        seasonId,
        episodeNum,
        title,
        description,
        thumbnailUrl,
        duration,
        videoUrl,
        status: status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
      },
    });

    const season = await prisma.season.findUnique({
      where: { id: seasonId },
      include: { series: { include: { content: true } } },
    });

    if (season) {
      revalidatePath(`/admin/series/${season.series.content.id}/edit`);
      revalidatePath(`/content/${season.series.content.slug}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Create episode error:", error);
    return { error: "Failed to create episode" };
  }
}

export async function deleteEpisodeAction(episodeId: string) {
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

    if (episode?.season) {
      revalidatePath(`/admin/series/${episode.season.series.content.id}/edit`);
      revalidatePath(`/content/${episode.season.series.content.slug}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Delete episode error:", error);
    return { error: "Failed to delete episode" };
  }
}

// ============================================================
// GENRES
// ============================================================

export async function getAllGenresForSeriesAdmin() {
  return await prisma.genre.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });
}