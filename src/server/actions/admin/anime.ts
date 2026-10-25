"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { slugify } from "@/lib/utils";

async function requireAdminAction() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") throw new Error("FORBIDDEN");
  return user;
}

export interface ContentFormState {
  error?: string;
  success?: boolean;
}

// ============================================================
// CREATE ANIME
// ============================================================
export async function createAnimeAction(
  _prev: ContentFormState,
  formData: FormData
): Promise<ContentFormState> {
  try { await requireAdminAction(); } catch { return { error: "Unauthorized" }; }

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const shortDesc = (formData.get("shortDesc") as string)?.trim() || null;
  const releaseYearRaw = formData.get("releaseYear") as string;
  const language = (formData.get("language") as string)?.trim() || null;
  const country = (formData.get("country") as string)?.trim() || null;
  const quality = (formData.get("quality") as string) || "HD";
  const posterUrl = (formData.get("posterUrl") as string)?.trim() || null;
  const backdropUrl = (formData.get("backdropUrl") as string)?.trim() || null;
  const trailerUrl = (formData.get("trailerUrl") as string)?.trim() || null;
  const videoUrl = (formData.get("videoUrl") as string)?.trim() || null;
  const status = (formData.get("status") as string) || "DRAFT";
  const isFeatured = formData.get("isFeatured") === "on";
  const genreIds = formData.getAll("genres") as string[];

  const dl480 = (formData.get("download480p") as string)?.trim() || null;
  const dl720 = (formData.get("download720p") as string)?.trim() || null;
  const dl1080 = (formData.get("download1080p") as string)?.trim() || null;

  if (!title || title.length < 2) return { error: "Title is required" };
  if (!description || description.length < 10) return { error: "Description is required" };
  if (!videoUrl) return { error: "Video URL is required" };

  const releaseYear = releaseYearRaw ? parseInt(releaseYearRaw) : null;

  let slug = slugify(title);
  const existing = await prisma.content.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now()}`;

  try {
    const content = await prisma.content.create({
      data: {
        title, slug, description, shortDesc, type: "ANIME",
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
      const videoType = videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be") ? "youtube" : videoUrl.includes("vimeo.com") ? "vimeo" : "mp4";
      await prisma.videoSource.create({ data: { contentId: content.id, url: videoUrl, type: videoType, isDefault: true } });
    }

    const downloadOptions = [];
    if (dl480) downloadOptions.push({ contentId: content.id, quality: "480p", fileUrl: dl480, format: "mp4", isAvailable: true });
    if (dl720) downloadOptions.push({ contentId: content.id, quality: "720p", fileUrl: dl720, format: "mp4", isAvailable: true });
    if (dl1080) downloadOptions.push({ contentId: content.id, quality: "1080p", fileUrl: dl1080, format: "mp4", isAvailable: true });
    if (downloadOptions.length > 0) await prisma.downloadOption.createMany({ data: downloadOptions });

    revalidatePath("/admin/anime"); revalidatePath("/anime"); revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Create anime error:", error);
    return { error: "Failed to create anime." };
  }
}

// ============================================================
// UPDATE ANIME
// ============================================================
export async function updateAnimeAction(
  animeId: string,
  _prev: ContentFormState,
  formData: FormData
): Promise<ContentFormState> {
  try { await requireAdminAction(); } catch { return { error: "Unauthorized" }; }

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const shortDesc = (formData.get("shortDesc") as string)?.trim() || null;
  const releaseYearRaw = formData.get("releaseYear") as string;
  const language = (formData.get("language") as string)?.trim() || null;
  const country = (formData.get("country") as string)?.trim() || null;
  const quality = (formData.get("quality") as string) || "HD";
  const posterUrl = (formData.get("posterUrl") as string)?.trim() || null;
  const backdropUrl = (formData.get("backdropUrl") as string)?.trim() || null;
  const trailerUrl = (formData.get("trailerUrl") as string)?.trim() || null;
  const videoUrl = (formData.get("videoUrl") as string)?.trim() || null;
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
    const existing = await prisma.content.findUnique({ where: { id: animeId } });
    if (!existing) return { error: "Anime not found" };

    await prisma.content.update({
      where: { id: animeId },
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
      const videoType = videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be") ? "youtube" : videoUrl.includes("vimeo.com") ? "vimeo" : "mp4";
      await prisma.videoSource.deleteMany({ where: { contentId: animeId, episodeId: null } });
      await prisma.videoSource.create({ data: { contentId: animeId, url: videoUrl, type: videoType, isDefault: true } });
    }

    await prisma.downloadOption.deleteMany({ where: { contentId: animeId } });
    const downloadOptions = [];
    if (dl480) downloadOptions.push({ contentId: animeId, quality: "480p", fileUrl: dl480, format: "mp4", isAvailable: true });
    if (dl720) downloadOptions.push({ contentId: animeId, quality: "720p", fileUrl: dl720, format: "mp4", isAvailable: true });
    if (dl1080) downloadOptions.push({ contentId: animeId, quality: "1080p", fileUrl: dl1080, format: "mp4", isAvailable: true });
    if (downloadOptions.length > 0) await prisma.downloadOption.createMany({ data: downloadOptions });

    revalidatePath("/admin/anime"); revalidatePath(`/admin/anime/${animeId}/edit`); revalidatePath("/anime"); revalidatePath(`/content/${existing.slug}`); revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Update anime error:", error);
    return { error: "Failed to update anime" };
  }
}

// ============================================================
// GET / DELETE / TOGGLE
// ============================================================
export async function getAdminAnime(params: { search?: string; status?: string; page?: number; perPage?: number }) {
  try { await requireAdminAction(); } catch { return { anime: [], total: 0, page: 1, totalPages: 0 }; }
  const { search, status, page = 1, perPage = 20 } = params;
  const where: any = { type: "ANIME" };
  if (search && search.trim()) where.OR = [{ title: { contains: search, mode: "insensitive" } }];
  if (status && status !== "ALL") where.status = status;
  const [anime, total] = await Promise.all([
    prisma.content.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * perPage, take: perPage, include: { genres: true, videoSources: true } }),
    prisma.content.count({ where }),
  ]);
  return { anime, total, page, totalPages: Math.ceil(total / perPage) };
}

export async function getAnimeForEdit(animeId: string) {
  try { await requireAdminAction(); } catch { return null; }
  const content = await prisma.content.findUnique({
    where: { id: animeId, type: "ANIME" },
    include: { genres: true, videoSources: true, downloadOptions: true },
  });
  if (!content) return null;
  const videoUrl = content.videoSources.find((v) => v.isDefault)?.url || null;
  const dl480 = content.downloadOptions.find((d) => d.quality === "480p")?.fileUrl || null;
  const dl720 = content.downloadOptions.find((d) => d.quality === "720p")?.fileUrl || null;
  const dl1080 = content.downloadOptions.find((d) => d.quality === "1080p")?.fileUrl || null;
  return { ...content, videoUrl, download480p: dl480, download720p: dl720, download1080p: dl1080 };
}

export async function deleteAnimeAction(animeId: string) {
  try { await requireAdminAction(); } catch { return { error: "Unauthorized" }; }
  try {
    await prisma.content.delete({ where: { id: animeId } });
    revalidatePath("/admin/anime"); revalidatePath("/anime");
    return { success: true };
  } catch (error) { return { error: "Failed to delete anime" }; }
}

export async function toggleAnimePublishAction(animeId: string) {
  try { await requireAdminAction(); } catch { return { error: "Unauthorized" }; }
  try {
    const content = await prisma.content.findUnique({ where: { id: animeId } });
    if (!content) return { error: "Not found" };
    const newStatus = content.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    await prisma.content.update({
      where: { id: animeId },
      data: { status: newStatus, publishedAt: newStatus === "PUBLISHED" ? new Date() : content.publishedAt },
    });
    revalidatePath("/admin/anime"); revalidatePath("/anime");
    return { success: true, status: newStatus };
  } catch (error) { return { error: "Failed to toggle status" }; }
}

export async function getAllGenresForAnimeAdmin() {
  return await prisma.genre.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });
}