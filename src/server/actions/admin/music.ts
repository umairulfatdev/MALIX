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

export async function createMusicAction(
  _prev: ContentFormState,
  formData: FormData
): Promise<ContentFormState> {
  try { await requireAdminAction(); } catch { return { error: "Unauthorized" }; }

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const artist = (formData.get("artist") as string)?.trim() || null;
  const album = (formData.get("album") as string)?.trim() || null;
  const genre = (formData.get("genre") as string)?.trim() || null;
  const releaseYearRaw = formData.get("releaseYear") as string;
  const posterUrl = (formData.get("posterUrl") as string)?.trim() || null;
  const videoUrl = (formData.get("videoUrl") as string)?.trim() || null;
  const status = (formData.get("status") as string) || "DRAFT";

  if (!title || title.length < 2) return { error: "Title is required" };
  if (!description || description.length < 10) return { error: "Description is required" };
  if (!videoUrl) return { error: "Audio/Video URL is required" };

  const releaseYear = releaseYearRaw ? parseInt(releaseYearRaw) : null;

  let slug = slugify(title);
  const existing = await prisma.content.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now()}`;

  try {
    const content = await prisma.content.create({
      data: {
        title, slug, description, type: "MUSIC",
        releaseYear, posterUrl,
        status: status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
        publishedAt: status === "PUBLISHED" ? new Date() : null,
        music: {
          create: { artist, album, genre },
        },
      },
    });

    if (videoUrl) {
      await prisma.videoSource.create({
        data: { contentId: content.id, url: videoUrl, type: "mp4", isDefault: true },
      });
    }

    revalidatePath("/admin/music");
    revalidatePath("/music");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Create music error:", error);
    return { error: "Failed to create music" };
  }
}

export async function updateMusicAction(
  musicId: string,
  _prev: ContentFormState,
  formData: FormData
): Promise<ContentFormState> {
  try { await requireAdminAction(); } catch { return { error: "Unauthorized" }; }

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const artist = (formData.get("artist") as string)?.trim() || null;
  const album = (formData.get("album") as string)?.trim() || null;
  const genre = (formData.get("genre") as string)?.trim() || null;
  const releaseYearRaw = formData.get("releaseYear") as string;
  const posterUrl = (formData.get("posterUrl") as string)?.trim() || null;
  const videoUrl = (formData.get("videoUrl") as string)?.trim() || null;
  const status = (formData.get("status") as string) || "DRAFT";

  if (!title || title.length < 2) return { error: "Title required" };
  if (!description || description.length < 10) return { error: "Description required" };

  const releaseYear = releaseYearRaw ? parseInt(releaseYearRaw) : null;

  try {
    const existing = await prisma.content.findUnique({ where: { id: musicId } });
    if (!existing) return { error: "Music not found" };

    await prisma.content.update({
      where: { id: musicId },
      data: {
        title, description, releaseYear, posterUrl,
        status: status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
        publishedAt: status === "PUBLISHED" && !existing.publishedAt ? new Date() : existing.publishedAt,
      },
    });

    await prisma.music.upsert({
      where: { contentId: musicId },
      create: { contentId: musicId, artist, album, genre },
      update: { artist, album, genre },
    });

    if (videoUrl) {
      await prisma.videoSource.deleteMany({ where: { contentId: musicId } });
      await prisma.videoSource.create({ data: { contentId: musicId, url: videoUrl, type: "mp4", isDefault: true } });
    }

    revalidatePath("/admin/music");
    revalidatePath("/music");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Update music error:", error);
    return { error: "Failed to update music" };
  }
}

export async function deleteMusicAction(musicId: string) {
  try { await requireAdminAction(); } catch { return { error: "Unauthorized" }; }
  try {
    await prisma.content.delete({ where: { id: musicId } });
    revalidatePath("/admin/music"); revalidatePath("/music");
    return { success: true };
  } catch (error) { return { error: "Failed to delete music" }; }
}

export async function getAdminMusic(params: { search?: string; page?: number; perPage?: number }) {
  try { await requireAdminAction(); } catch { return { music: [], total: 0, page: 1, totalPages: 0 }; }
  const { search, page = 1, perPage = 20 } = params;
  const where: any = { type: "MUSIC" };
  if (search && search.trim()) where.OR = [{ title: { contains: search, mode: "insensitive" } }];
  const [music, total] = await Promise.all([
    prisma.content.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * perPage, take: perPage, include: { music: true, videoSources: true } }),
    prisma.content.count({ where }),
  ]);
  return { music, total, page, totalPages: Math.ceil(total / perPage) };
}

export async function getMusicForEdit(musicId: string) {
  try { await requireAdminAction(); } catch { return null; }
  const content = await prisma.content.findUnique({
    where: { id: musicId, type: "MUSIC" },
    include: { music: true, videoSources: true },
  });
  if (!content) return null;
  const videoUrl = content.videoSources.find((v) => v.isDefault)?.url || null;
  return { ...content, videoUrl };
}