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

export async function getAdminSeries(params: { search?: string; status?: string; page?: number; perPage?: number }) {
  try { await requireAdminAction(); } catch { return { series: [], total: 0, page: 1, totalPages: 0 }; }
  const { search, status, page = 1, perPage = 20 } = params;
  const where: any = { type: "SERIES" };
  if (search && search.trim()) where.OR = [{ title: { contains: search, mode: "insensitive" } }];
  if (status && status !== "ALL") where.status = status;
  const [series, total] = await Promise.all([
    prisma.content.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * perPage, take: perPage, include: { genres: true, series: { include: { _count: { select: { seasons: true } } } } } }),
    prisma.content.count({ where }),
  ]);
  return { series, total, page, totalPages: Math.ceil(total / perPage) };
}

export async function getSeriesForEdit(seriesId: string) {
  try { await requireAdminAction(); } catch { return null; }
  const content = await prisma.content.findUnique({
    where: { id: seriesId, type: "SERIES" },
    include: { genres: true, videoSources: true, downloadOptions: true, series: { include: { seasons: { include: { episodes: true } } } } },
  });
  if (!content) return null;
  const videoUrl = content.videoSources.find((v) => v.isDefault)?.url || null;
  const downloadUrl = content.downloadOptions[0]?.fileUrl || null; // 👈 NAYA
  return { ...content, videoUrl, downloadUrl };
}

export async function createSeriesAction(_prev: SeriesFormState, formData: FormData): Promise<SeriesFormState> {
  try { await requireAdminAction(); } catch { return { error: "Unauthorized" }; }
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const shortDesc = (formData.get("shortDesc") as string)?.trim() || null;
  const releaseYearRaw = formData.get("releaseYear") as string;
  const language = (formData.get("language") as string)?.trim() || null;
  const country = (formData.get("country") as string)?.trim() || null;
  const quality = (formData.get("quality") as string) || "HD";
  const videoUrl = (formData.get("videoUrl") as string)?.trim() || null;
  const downloadUrl = (formData.get("downloadUrl") as string)?.trim() || null; // 👈 NAYA
  const posterUrl = (formData.get("posterUrl") as string)?.trim() || null;
  const backdropUrl = (formData.get("backdropUrl") as string)?.trim() || null;
  const trailerUrl = (formData.get("trailerUrl") as string)?.trim() || null;
  const status = (formData.get("status") as string) || "DRAFT";
  const isFeatured = formData.get("isFeatured") === "on";
  const genreIds = formData.getAll("genres") as string[];

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
        series: { create: { totalSeasons: 0 } },
      },
    });

    if (videoUrl) await prisma.videoSource.create({ data: { contentId: content.id, url: videoUrl, type: "mp4", isDefault: true } });
    if (downloadUrl) await prisma.downloadOption.create({ data: { contentId: content.id, quality: "1080p", fileUrl: downloadUrl, format: "mp4", isAvailable: true } });

    revalidatePath("/admin/series"); revalidatePath("/series"); revalidatePath("/");
    redirect("/admin/series");
  } catch (error) {
    console.error("Create series error:", error);
    return { error: "Failed to create series" };
  }
}

export async function updateSeriesAction(seriesId: string, _prev: SeriesFormState, formData: FormData): Promise<SeriesFormState> {
  try { await requireAdminAction(); } catch { return { error: "Unauthorized" }; }
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const shortDesc = (formData.get("shortDesc") as string)?.trim() || null;
  const releaseYearRaw = formData.get("releaseYear") as string;
  const language = (formData.get("language") as string)?.trim() || null;
  const country = (formData.get("country") as string)?.trim() || null;
  const quality = (formData.get("quality") as string) || "HD";
  const videoUrl = (formData.get("videoUrl") as string)?.trim() || null;
  const downloadUrl = (formData.get("downloadUrl") as string)?.trim() || null; // 👈 NAYA
  const posterUrl = (formData.get("posterUrl") as string)?.trim() || null;
  const backdropUrl = (formData.get("backdropUrl") as string)?.trim() || null;
  const trailerUrl = (formData.get("trailerUrl") as string)?.trim() || null;
  const status = (formData.get("status") as string) || "DRAFT";
  const isFeatured = formData.get("isFeatured") === "on";
  const genreIds = formData.getAll("genres") as string[];

  if (!title || title.length < 2) return { error: "Title required" };
  if (!description || description.length < 10) return { error: "Description required" };

  const releaseYear = releaseYearRaw ? parseInt(releaseYearRaw) : null;

  try {
    const existing = await prisma.content.findUnique({ where: { id: seriesId }, include: { series: true } });
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
        series: existing.series ? { update: {} } : { create: { totalSeasons: 0 } },
      },
    });

    if (videoUrl) {
      await prisma.videoSource.deleteMany({ where: { contentId: seriesId } });
      await prisma.videoSource.create({ data: { contentId: seriesId, url: videoUrl, type: "mp4", isDefault: true } });
    }

    await prisma.downloadOption.deleteMany({ where: { contentId: seriesId } }); // 👈 NAYA
    if (downloadUrl) {
      await prisma.downloadOption.create({ data: { contentId: seriesId, quality: "1080p", fileUrl: downloadUrl, format: "mp4", isAvailable: true } });
    }

    revalidatePath("/admin/series"); revalidatePath("/series"); revalidatePath("/");
    redirect("/admin/series");
  } catch (error) {
    console.error("Update series error:", error);
    return { error: "Failed to update series" };
  }
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