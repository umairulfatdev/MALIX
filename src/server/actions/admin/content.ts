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

export async function createMovieAction(
  _prev: ContentFormState,
  formData: FormData
): Promise<ContentFormState> {
  try { await requireAdminAction(); } catch { return { error: "Unauthorized" }; }

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const shortDesc = (formData.get("shortDesc") as string)?.trim() || null;
  const releaseYearRaw = formData.get("releaseYear") as string;
  const durationRaw = formData.get("duration") as string;
  const language = (formData.get("language") as string)?.trim() || null;
  const country = (formData.get("country") as string)?.trim() || null;
  const quality = (formData.get("quality") as string) || "HD";
  const posterUrl = (formData.get("posterUrl") as string)?.trim() || null;
  const backdropUrl = (formData.get("backdropUrl") as string)?.trim() || null;
  const trailerUrl = (formData.get("trailerUrl") as string)?.trim() || null;
  const videoUrl = (formData.get("videoUrl") as string)?.trim() || null;
  const downloadUrl = (formData.get("downloadUrl") as string)?.trim() || null;
  const status = (formData.get("status") as string) || "DRAFT";
  const isFeatured = formData.get("isFeatured") === "on";
  const genreIds = formData.getAll("genres") as string[];
  const driveId = (formData.get("driveId") as string) || null;

  if (!title || title.length < 2) return { error: "Title is required" };
  if (!description || description.length < 10) return { error: "Description is required" };
  if (!videoUrl) return { error: "Video URL is required" };

  const releaseYear = releaseYearRaw ? parseInt(releaseYearRaw) : null;
  const duration = durationRaw ? parseInt(durationRaw) : null;

  let slug = slugify(title);
  const existing = await prisma.content.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now()}`;

  try {
    const videoType = videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")
      ? "youtube"
      : videoUrl.includes("vimeo.com")
        ? "vimeo"
        : "mp4";

    const content = await prisma.content.create({
      data: {
        title, slug, description, shortDesc, type: "MOVIE",
        releaseYear, duration, language, country, quality,
        posterUrl, backdropUrl, trailerUrl,
        status: status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
        isFeatured,
        downloadEnabled: !!downloadUrl, // 👈 YAHAN FIX
        publishedAt: status === "PUBLISHED" ? new Date() : null,
        genres: genreIds.length ? { connect: genreIds.map((id) => ({ id })) } : undefined,
        movie: { create: {} },
      },
    });

    if (videoUrl) {
      await prisma.videoSource.create({
        data: { contentId: content.id, url: videoUrl, type: videoType, isDefault: true },
      });
    }

    // 👇 DOWNLOAD SAVE
    if (downloadUrl) {
      await prisma.downloadOption.create({
        data: {
          contentId: content.id,
          quality: "1080p",
          fileUrl: downloadUrl,
          format: "mp4",
          isAvailable: true,
        },
      });
    }

    revalidatePath("/admin/movies");
    revalidatePath("/movies");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Create movie error:", error);
    return { error: "Failed to create movie" };
  }
}

export async function updateMovieAction(
  movieId: string,
  _prev: ContentFormState,
  formData: FormData
): Promise<ContentFormState> {
  try { await requireAdminAction(); } catch { return { error: "Unauthorized" }; }

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const shortDesc = (formData.get("shortDesc") as string)?.trim() || null;
  const releaseYearRaw = formData.get("releaseYear") as string;
  const durationRaw = formData.get("duration") as string;
  const language = (formData.get("language") as string)?.trim() || null;
  const country = (formData.get("country") as string)?.trim() || null;
  const quality = (formData.get("quality") as string) || "HD";
  const posterUrl = (formData.get("posterUrl") as string)?.trim() || null;
  const backdropUrl = (formData.get("backdropUrl") as string)?.trim() || null;
  const trailerUrl = (formData.get("trailerUrl") as string)?.trim() || null;
  const videoUrl = (formData.get("videoUrl") as string)?.trim() || null;
  const downloadUrl = (formData.get("downloadUrl") as string)?.trim() || null;
  const status = (formData.get("status") as string) || "DRAFT";
  const isFeatured = formData.get("isFeatured") === "on";
  const genreIds = formData.getAll("genres") as string[];
  const driveId = (formData.get("driveId") as string) || null;

  if (!title || title.length < 2) return { error: "Title required" };
  if (!description || description.length < 10) return { error: "Description required" };

  const releaseYear = releaseYearRaw ? parseInt(releaseYearRaw) : null;
  const duration = durationRaw ? parseInt(durationRaw) : null;

  try {
    const existing = await prisma.content.findUnique({ where: { id: movieId } });
    if (!existing) return { error: "Movie not found" };

    await prisma.content.update({
      where: { id: movieId },
      data: {
        title, description, shortDesc, driveId, releaseYear, duration, language, country, quality,
        posterUrl, backdropUrl, trailerUrl,
        status: status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
        isFeatured,
        downloadEnabled: !!downloadUrl, // 👈 YAHAN FIX
        publishedAt: status === "PUBLISHED" && !existing.publishedAt ? new Date() : existing.publishedAt,
        genres: { set: [], connect: genreIds.map((id) => ({ id })) },
      },
    });

    if (videoUrl) {
      const videoType = videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be") ? "youtube" : videoUrl.includes("vimeo.com") ? "vimeo" : "mp4";
      await prisma.videoSource.deleteMany({ where: { contentId: movieId, episodeId: null } });
      await prisma.videoSource.create({ data: { contentId: movieId, url: videoUrl, type: videoType, isDefault: true } });
    }

    // 👇 DOWNLOAD UPDATE
    await prisma.downloadOption.deleteMany({ where: { contentId: movieId } });
    if (downloadUrl) {
      await prisma.downloadOption.create({
        data: {
          contentId: movieId,
          quality: "1080p",
          fileUrl: downloadUrl,
          format: "mp4",
          isAvailable: true,
        },
      });
    }

    revalidatePath("/admin/movies");
    revalidatePath(`/admin/movies/${movieId}/edit`);
    revalidatePath("/movies");
    revalidatePath(`/content/${existing.slug}`);
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Update movie error:", error);
    return { error: "Failed to update movie" };
  }
}

export async function deleteMovieAction(movieId: string) {
  try { await requireAdminAction(); } catch { return { error: "Unauthorized" }; }
  try {
    await prisma.content.delete({ where: { id: movieId } });
    revalidatePath("/admin/movies"); revalidatePath("/movies");
    return { success: true };
  } catch (error) { return { error: "Failed to delete movie" }; }
}

export async function togglePublishAction(movieId: string) {
  try { await requireAdminAction(); } catch { return { error: "Unauthorized" }; }
  try {
    const content = await prisma.content.findUnique({ where: { id: movieId } });
    if (!content) return { error: "Not found" };
    const newStatus = content.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    await prisma.content.update({ where: { id: movieId }, data: { status: newStatus, publishedAt: newStatus === "PUBLISHED" ? new Date() : content.publishedAt } });
    revalidatePath("/admin/movies"); revalidatePath("/movies");
    return { success: true, status: newStatus };
  } catch (error) { return { error: "Failed to toggle status" }; }
}

export async function getAdminMovies(params: { search?: string; status?: string; page?: number; perPage?: number }) {
  try { await requireAdminAction(); } catch { return { movies: [], total: 0, page: 1, totalPages: 0 }; }
  const { search, status, page = 1, perPage = 20 } = params;
  const where: any = { type: "MOVIE" };
  if (search && search.trim()) where.OR = [{ title: { contains: search, mode: "insensitive" } }, { description: { contains: search, mode: "insensitive" } }];
  if (status && status !== "ALL") where.status = status;
  const [movies, total] = await Promise.all([
    prisma.content.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * perPage, take: perPage, include: { genres: true, videoSources: true } }),
    prisma.content.count({ where }),
  ]);
  return { movies, total, page, totalPages: Math.ceil(total / perPage) };
}

export async function getMovieForEdit(movieId: string) {
  try { await requireAdminAction(); } catch { return null; }
  const content = await prisma.content.findUnique({
    where: { id: movieId, type: "MOVIE" },
    include: { genres: true, movie: true, videoSources: true, downloadOptions: true },
  });
  if (!content) return null;
  const videoUrl = content.videoSources.find((v) => v.isDefault)?.url || null;
  const downloadUrl = content.downloadOptions[0]?.fileUrl || null;
  return { ...content, videoUrl, downloadUrl };
}

export async function getAllGenresForAdmin() {
  return await prisma.genre.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, slug: true } });
}