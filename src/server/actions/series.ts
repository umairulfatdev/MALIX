"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { slugify } from "@/lib/utils";

async function requireAdminAction() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") throw new Error("FORBIDDEN");
  return user;
}

// 👇 YEH ADD KAR DIYA HAI
export interface ContentFormState {
  error?: string;
  success?: boolean;
}

export interface SeriesFilters {
  search?: string;
  genres?: string[];
  year?: number;
  minRating?: number;
  language?: string;
  sort?: "latest" | "popular" | "top-rated" | "az" | "za";
  page?: number;
  perPage?: number;
}

export interface SeriesListItem {
  id: string;
  title: string;
  slug: string;
  posterUrl: string | null;
  releaseYear: number | null;
  avgRating: number | null;
  language: string | null;
  country: string | null;
  totalSeasons: number | null;
  genres: { id: string; name: string; slug: string }[];
}

export interface SeriesResult {
  series: SeriesListItem[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export async function getSeries(
  filters: SeriesFilters = {}
): Promise<SeriesResult> {
  const {
    search,
    genres = [],
    year,
    minRating,
    language,
    sort = "latest",
    page = 1,
    perPage = 20,
  } = filters;

  const where: Prisma.ContentWhereInput = {
    type: "SERIES",
    status: "PUBLISHED",
  };

  if (search && search.trim()) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }
  if (genres.length > 0) {
    where.genres = { some: { slug: { in: genres } } };
  }
  if (year) where.releaseYear = year;
  if (minRating !== undefined) where.avgRating = { gte: minRating };
  if (language) where.language = language;

  let orderBy: Prisma.ContentOrderByWithRelationInput;
  switch (sort) {
    case "popular": orderBy = { totalViews: "desc" }; break;
    case "top-rated": orderBy = { avgRating: "desc" }; break;
    case "az": orderBy = { title: "asc" }; break;
    case "za": orderBy = { title: "desc" }; break;
    default: orderBy = { createdAt: "desc" };
  }

  const skip = (page - 1) * perPage;

  const [contents, total] = await Promise.all([
    prisma.content.findMany({
      where,
      orderBy,
      skip,
      take: perPage,
      select: {
        id: true,
        title: true,
        slug: true,
        posterUrl: true,
        releaseYear: true,
        avgRating: true,
        language: true,
        country: true,
        genres: { select: { id: true, name: true, slug: true } },
        series: { select: { totalSeasons: true } },
      },
    }),
    prisma.content.count({ where }),
  ]);

  const series = contents.map((c) => ({
    id: c.id,
    title: c.title,
    slug: c.slug,
    posterUrl: c.posterUrl,
    releaseYear: c.releaseYear,
    avgRating: c.avgRating,
    language: c.language,
    country: c.country,
    totalSeasons: c.series?.totalSeasons ?? null,
    genres: c.genres,
  }));

  return { series, total, page, perPage, totalPages: Math.ceil(total / perPage) };
}

export async function getSeriesGenres() {
  return prisma.genre.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, slug: true } });
}

export async function getSeriesLanguages() {
  const contents = await prisma.content.findMany({ where: { type: "SERIES", status: "PUBLISHED" }, select: { language: true }, distinct: ["language"] });
  return contents.map((c) => c.language).filter((l): l is string => Boolean(l)).sort();
}

export async function getSeriesYears() {
  const contents = await prisma.content.findMany({ where: { type: "SERIES", status: "PUBLISHED" }, select: { releaseYear: true }, distinct: ["releaseYear"] });
  return contents.map((c) => c.releaseYear).filter((y): y is number => Boolean(y)).sort((a, b) => b - a);
}

// ==================== Content Detail ====================

export interface EpisodeItem {
  id: string;
  episodeNum: number;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  duration: number | null;
  airDate: Date | null;
}

export interface SeasonItem {
  id: string;
  seasonNumber: number;
  title: string | null;
  description: string | null;
  posterUrl: string | null;
  releaseYear: number | null;
  episodes: EpisodeItem[];
}

export interface ContentDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: "MOVIE" | "DRAMA" | "SERIES" | "DOCUMENTARY" | "SHORT_FILM" | "TRAILER";
  releaseYear: number | null;
  language: string | null;
  country: string | null;
  duration: number | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  trailerUrl: string | null;
  avgRating: number | null;
  totalViews: number;
  totalRatings: number;
  genres: { id: string; name: string; slug: string }[];
  seasons?: SeasonItem[];
  totalSeasons?: number | null;
  related: {
    id: string;
    title: string;
    slug: string;
    posterUrl: string | null;
    releaseYear: number | null;
    avgRating: number | null;
  }[];
}

export async function getContentBySlug(
  slug: string
): Promise<ContentDetail | null> {
  const content = await prisma.content.findUnique({
    where: { slug },
    include: {
      genres: { select: { id: true, name: true, slug: true } },
      series: {
        include: {
          seasons: {
            orderBy: { seasonNumber: "asc" },
            include: {
              episodes: {
                orderBy: { episodeNum: "asc" },
                select: { id: true, episodeNum: true, title: true, description: true, thumbnailUrl: true, duration: true, airDate: true },
              },
            },
          },
        },
      },
    },
  });

  if (!content || content.status !== "PUBLISHED") return null;

  const genreIds = content.genres.map((g) => g.id);
  const related = await prisma.content.findMany({
    where: { status: "PUBLISHED", id: { not: content.id }, genres: { some: { id: { in: genreIds } } } },
    take: 8,
    select: { id: true, title: true, slug: true, posterUrl: true, releaseYear: true, avgRating: true },
  });

  return {
    id: content.id,
    title: content.title,
    slug: content.slug,
    description: content.description,
    type: content.type,
    releaseYear: content.releaseYear,
    language: content.language,
    country: content.country,
    duration: content.duration,
    posterUrl: content.posterUrl,
    backdropUrl: content.backdropUrl,
    trailerUrl: content.trailerUrl,
    avgRating: content.avgRating,
    totalViews: content.totalViews,
    totalRatings: content.totalRatings,
    genres: content.genres,
    totalSeasons: content.series?.totalSeasons ?? null,
    seasons: content.series ? content.series.seasons.map((s) => ({
      id: s.id,
      seasonNumber: s.seasonNumber,
      title: s.title,
      description: s.description,
      posterUrl: s.posterUrl,
      releaseYear: s.releaseYear,
      episodes: s.episodes,
    })) : undefined,
    related,
  };
}

// ============================================================
// CREATE SERIES
// ============================================================
export async function createSeriesAction(_prev: ContentFormState, formData: FormData): Promise<ContentFormState> {
  try { await requireAdminAction(); } catch { return { error: "Unauthorized" }; }
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const shortDesc = (formData.get("shortDesc") as string)?.trim() || null;
  const releaseYearRaw = formData.get("releaseYear") as string;
  const language = (formData.get("language") as string)?.trim() || null;
  const country = (formData.get("country") as string)?.trim() || null;
  const quality = (formData.get("quality") as string) || "HD";
  const videoUrl = (formData.get("videoUrl") as string)?.trim() || null;
  const posterUrl = (formData.get("posterUrl") as string)?.trim() || null;
  const backdropUrl = (formData.get("backdropUrl") as string)?.trim() || null;
  const trailerUrl = (formData.get("trailerUrl") as string)?.trim() || null;
  const status = (formData.get("status") as string) || "DRAFT";
  const isFeatured = formData.get("isFeatured") === "on";
  const genreIds = formData.getAll("genres") as string[];
  const dl480 = (formData.get("download480p") as string)?.trim() || null;
  const dl720 = (formData.get("download720p") as string)?.trim() || null;
  const dl1080 = (formData.get("download1080p") as string)?.trim() || null;

  if (!title || title.length < 2) return { error: "Title is required" };
  if (!description || description.length < 10) return { error: "Description is required" };

  const releaseYear = releaseYearRaw ? parseInt(releaseYearRaw) : null;
  let slug = slugify(title);
  const existing = await prisma.content.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now()}`;

  try {
    const content = await prisma.content.create({
      data: {
        title, slug, description, shortDesc, type: "SERIES",
        releaseYear, language, country, quality,
        posterUrl, backdropUrl, trailerUrl,
        status: status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
        isFeatured,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
        genres: genreIds.length ? { connect: genreIds.map((id) => ({ id })) } : undefined,
        series: { create: { totalSeasons: 1 } },
      },
    });

    if (videoUrl) {
      await prisma.videoSource.create({ data: { contentId: content.id, url: videoUrl, type: "mp4", isDefault: true } });
    }

    const downloadOptions = [];
    if (dl480) downloadOptions.push({ contentId: content.id, quality: "480p", fileUrl: dl480, format: "mp4", isAvailable: true });
    if (dl720) downloadOptions.push({ contentId: content.id, quality: "720p", fileUrl: dl720, format: "mp4", isAvailable: true });
    if (dl1080) downloadOptions.push({ contentId: content.id, quality: "1080p", fileUrl: dl1080, format: "mp4", isAvailable: true });
    if (downloadOptions.length > 0) await prisma.downloadOption.createMany({ data: downloadOptions });

    revalidatePath("/admin/series"); revalidatePath("/series"); revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Create series error:", error);
    return { error: "Failed to create series" };
  }
}

// ============================================================
// UPDATE SERIES
// ============================================================
export async function updateSeriesAction(seriesId: string, _prev: ContentFormState, formData: FormData): Promise<ContentFormState> {
  try { await requireAdminAction(); } catch { return { error: "Unauthorized" }; }
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const shortDesc = (formData.get("shortDesc") as string)?.trim() || null;
  const releaseYearRaw = formData.get("releaseYear") as string;
  const language = (formData.get("language") as string)?.trim() || null;
  const country = (formData.get("country") as string)?.trim() || null;
  const quality = (formData.get("quality") as string) || "HD";
  const videoUrl = (formData.get("videoUrl") as string)?.trim() || null;
  const posterUrl = (formData.get("posterUrl") as string)?.trim() || null;
  const backdropUrl = (formData.get("backdropUrl") as string)?.trim() || null;
  const trailerUrl = (formData.get("trailerUrl") as string)?.trim() || null;
  const status = (formData.get("status") as string) || "DRAFT";
  const isFeatured = formData.get("isFeatured") === "on";
  const genreIds = formData.getAll("genres") as string[];
  const dl480 = (formData.get("download480p") as string)?.trim() || null;
  const dl720 = (formData.get("download720p") as string)?.trim() || null;
  const dl1080 = (formData.get("download1080p") as string)?.trim() || null;

  if (!title || title.length < 2) return { error: "Title required" };
  if (!description || description.length < 10) return { error: "Description required" };

  const releaseYear = releaseYearRaw ? parseInt(releaseYearRaw) : null;

  try {
    const existing = await prisma.content.findUnique({ where: { id: seriesId } });
    if (!existing) return { error: "Series not found" };

    await prisma.content.update({
      where: { id: seriesId },
      data: {
        title, description, shortDesc, releaseYear, language, country, quality,
        posterUrl, backdropUrl, trailerUrl,
        status: status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
        isFeatured,
        publishedAt: status === "PUBLISHED" && !existing.publishedAt ? new Date() : existing.publishedAt,
        genres: { set: [], connect: genreIds.map((id) => ({ id })) },
      },
    });

    if (videoUrl) {
      await prisma.videoSource.deleteMany({ where: { contentId: seriesId } });
      await prisma.videoSource.create({ data: { contentId: seriesId, url: videoUrl, type: "mp4", isDefault: true } });
    }

    await prisma.downloadOption.deleteMany({ where: { contentId: seriesId } });
    const downloadOptions = [];
    if (dl480) downloadOptions.push({ contentId: seriesId, quality: "480p", fileUrl: dl480, format: "mp4", isAvailable: true });
    if (dl720) downloadOptions.push({ contentId: seriesId, quality: "720p", fileUrl: dl720, format: "mp4", isAvailable: true });
    if (dl1080) downloadOptions.push({ contentId: seriesId, quality: "1080p", fileUrl: dl1080, format: "mp4", isAvailable: true });
    if (downloadOptions.length > 0) await prisma.downloadOption.createMany({ data: downloadOptions });

    revalidatePath("/admin/series"); revalidatePath(`/admin/series/${seriesId}/edit`); revalidatePath("/series"); revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Update series error:", error);
    return { error: "Failed to update series" };
  }
}

export async function getAdminSeries(params: { search?: string; status?: string; page?: number; perPage?: number }) {
  try { await requireAdminAction(); } catch { return { series: [], total: 0, page: 1, totalPages: 0 }; }
  const { search, status, page = 1, perPage = 20 } = params;
  const where: any = { type: "SERIES" };
  if (search && search.trim()) where.OR = [{ title: { contains: search, mode: "insensitive" } }];
  if (status && status !== "ALL") where.status = status;
  const [series, total] = await Promise.all([
    prisma.content.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * perPage, take: perPage, include: { genres: true } }),
    prisma.content.count({ where }),
  ]);
  return { series, total, page, totalPages: Math.ceil(total / perPage) };
}

export async function getSeriesForEdit(seriesId: string) {
  try { await requireAdminAction(); } catch { return null; }
  const content = await prisma.content.findUnique({
    where: { id: seriesId, type: "SERIES" },
    include: { genres: true, series: true, videoSources: true, downloadOptions: true },
  });
  if (!content) return null;
  const videoUrl = content.videoSources.find((v) => v.isDefault)?.url || null;
  const dl480 = content.downloadOptions.find((d) => d.quality === "480p")?.fileUrl || null;
  const dl720 = content.downloadOptions.find((d) => d.quality === "720p")?.fileUrl || null;
  const dl1080 = content.downloadOptions.find((d) => d.quality === "1080p")?.fileUrl || null;
  return { ...content, videoUrl, download480p: dl480, download720p: dl720, download1080p: dl1080 };
}

export async function deleteSeriesAction(seriesId: string) {
  try { await requireAdminAction(); } catch { return { error: "Unauthorized" }; }
  try {
    await prisma.content.delete({ where: { id: seriesId } });
    revalidatePath("/admin/series"); revalidatePath("/series");
    return { success: true };
  } catch (error) { return { error: "Failed to delete series" }; }
}

export async function toggleSeriesPublishAction(seriesId: string) {
  try { await requireAdminAction(); } catch { return { error: "Unauthorized" }; }
  try {
    const content = await prisma.content.findUnique({ where: { id: seriesId } });
    if (!content) return { error: "Not found" };
    const newStatus = content.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    await prisma.content.update({ where: { id: seriesId }, data: { status: newStatus, publishedAt: newStatus === "PUBLISHED" ? new Date() : content.publishedAt } });
    revalidatePath("/admin/series"); revalidatePath("/series");
    return { success: true, status: newStatus };
  } catch (error) { return { error: "Failed to toggle status" }; }
}

export async function getAllGenresForSeriesAdmin() {
  return await prisma.genre.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, slug: true } });
}