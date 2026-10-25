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

export interface DramaFormState {
  error?: string;
  success?: boolean;
}

export async function getAdminDramas(params: { search?: string; status?: string; page?: number; perPage?: number }) {
  try { await requireAdminAction(); } catch { return { dramas: [], total: 0, page: 1, totalPages: 0 }; }
  const { search, status, page = 1, perPage = 20 } = params;
  const where: any = { type: "DRAMA" };
  if (search && search.trim()) where.OR = [{ title: { contains: search, mode: "insensitive" } }];
  if (status && status !== "ALL") where.status = status;
  const [dramas, total] = await Promise.all([
    prisma.content.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * perPage, take: perPage, include: { genres: true } }),
    prisma.content.count({ where }),
  ]);
  return { dramas, total, page, totalPages: Math.ceil(total / perPage) };
}

export async function getDramaForEdit(dramaId: string) {
  try { await requireAdminAction(); } catch { return null; }
  const content = await prisma.content.findUnique({
    where: { id: dramaId, type: "DRAMA" },
    include: { genres: true, drama: true, videoSources: true, downloadOptions: true },
  });
  if (!content) return null;
  const videoUrl = content.videoSources.find((v) => v.isDefault)?.url || null;
  const dl480 = content.downloadOptions.find((d) => d.quality === "480p")?.fileUrl || null;
  const dl720 = content.downloadOptions.find((d) => d.quality === "720p")?.fileUrl || null;
  const dl1080 = content.downloadOptions.find((d) => d.quality === "1080p")?.fileUrl || null;
  return { ...content, videoUrl, download480p: dl480, download720p: dl720, download1080p: dl1080 };
}

export async function createDramaAction(_prev: DramaFormState, formData: FormData): Promise<DramaFormState> {
  try { await requireAdminAction(); } catch { return { error: "Unauthorized" }; }
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const shortDesc = (formData.get("shortDesc") as string)?.trim() || null;
  const releaseYearRaw = formData.get("releaseYear") as string;
  const durationRaw = formData.get("duration") as string;
  const totalEpsRaw = formData.get("totalEps") as string;
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
  const duration = durationRaw ? parseInt(durationRaw) : null;
  const totalEps = totalEpsRaw ? parseInt(totalEpsRaw) : 1;

  let slug = slugify(title);
  const existing = await prisma.content.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now()}`;

  try {
    const content = await prisma.content.create({
      data: {
        title, slug, description, shortDesc, type: "DRAMA",
        releaseYear, duration, language, country, quality,
        posterUrl, backdropUrl, trailerUrl,
        status: status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
        isFeatured,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
        genres: genreIds.length ? { connect: genreIds.map((id) => ({ id })) } : undefined,
        drama: { create: { totalEps } },
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

    revalidatePath("/admin/dramas"); revalidatePath("/dramas"); revalidatePath("/");
    redirect("/admin/dramas");
  } catch (error) {
    console.error("Create drama error:", error);
    return { error: "Failed to create drama" };
  }
}

export async function updateDramaAction(dramaId: string, _prev: DramaFormState, formData: FormData): Promise<DramaFormState> {
  try { await requireAdminAction(); } catch { return { error: "Unauthorized" }; }
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const shortDesc = (formData.get("shortDesc") as string)?.trim() || null;
  const releaseYearRaw = formData.get("releaseYear") as string;
  const durationRaw = formData.get("duration") as string;
  const totalEpsRaw = formData.get("totalEps") as string;
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
  const duration = durationRaw ? parseInt(durationRaw) : null;
  const totalEps = totalEpsRaw ? parseInt(totalEpsRaw) : 1;

  try {
    const existing = await prisma.content.findUnique({ where: { id: dramaId }, include: { drama: true } });
    if (!existing) return { error: "Drama not found" };

    await prisma.content.update({
      where: { id: dramaId },
      data: {
        title, description, shortDesc, releaseYear, duration, language, country, quality,
        posterUrl, backdropUrl, trailerUrl,
        status: status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
        isFeatured,
        publishedAt: status === "PUBLISHED" && !existing.publishedAt ? new Date() : existing.publishedAt,
        genres: { set: [], connect: genreIds.map((id) => ({ id })) },
        drama: existing.drama ? { update: { totalEps } } : { create: { totalEps } },
      },
    });

    if (videoUrl) {
      await prisma.videoSource.deleteMany({ where: { contentId: dramaId } });
      await prisma.videoSource.create({ data: { contentId: dramaId, url: videoUrl, type: "mp4", isDefault: true } });
    }

    await prisma.downloadOption.deleteMany({ where: { contentId: dramaId } });
    const downloadOptions = [];
    if (dl480) downloadOptions.push({ contentId: dramaId, quality: "480p", fileUrl: dl480, format: "mp4", isAvailable: true });
    if (dl720) downloadOptions.push({ contentId: dramaId, quality: "720p", fileUrl: dl720, format: "mp4", isAvailable: true });
    if (dl1080) downloadOptions.push({ contentId: dramaId, quality: "1080p", fileUrl: dl1080, format: "mp4", isAvailable: true });
    if (downloadOptions.length > 0) await prisma.downloadOption.createMany({ data: downloadOptions });

    revalidatePath("/admin/dramas"); revalidatePath(`/admin/dramas/${dramaId}/edit`); revalidatePath("/dramas"); revalidatePath("/");
    redirect("/admin/dramas");
  } catch (error) {
    console.error("Update drama error:", error);
    return { error: "Failed to update drama" };
  }
}

export async function deleteDramaAction(dramaId: string) {
  try { await requireAdminAction(); } catch { return { error: "Unauthorized" }; }
  try {
    await prisma.content.delete({ where: { id: dramaId } });
    revalidatePath("/admin/dramas"); revalidatePath("/dramas");
    return { success: true };
  } catch (error) { return { error: "Failed to delete drama" }; }
}

export async function toggleDramaPublishAction(dramaId: string) {
  try { await requireAdminAction(); } catch { return { error: "Unauthorized" }; }
  try {
    const content = await prisma.content.findUnique({ where: { id: dramaId } });
    if (!content) return { error: "Not found" };
    const newStatus = content.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    await prisma.content.update({ where: { id: dramaId }, data: { status: newStatus, publishedAt: newStatus === "PUBLISHED" ? new Date() : content.publishedAt } });
    revalidatePath("/admin/dramas"); revalidatePath("/dramas");
    return { success: true, status: newStatus };
  } catch (error) { return { error: "Failed to toggle status" }; }
}

export async function getAllGenresForDramaAdmin() {
  return await prisma.genre.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, slug: true } });
}