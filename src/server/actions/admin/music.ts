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

export interface MusicFormState {
  error?: string;
  success?: boolean;
}

export async function getAdminMusic() {
  try { await requireAdminAction(); } catch { return []; }
  return await prisma.content.findMany({
    where: { type: "MUSIC" },
    include: { music: true, genres: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function createMusicAction(_prev: MusicFormState, formData: FormData): Promise<MusicFormState> {
  try { await requireAdminAction(); } catch { return { error: "Unauthorized" }; }

  const title = (formData.get("title") as string)?.trim();
  const artist = (formData.get("artist") as string)?.trim() || null;
  const album = (formData.get("album") as string)?.trim() || null;
  const posterUrl = (formData.get("posterUrl") as string)?.trim() || null;
  const videoUrl = (formData.get("videoUrl") as string)?.trim() || null;
  const downloadUrl = (formData.get("downloadUrl") as string)?.trim() || null; // 👈 NAYA
  const status = (formData.get("status") as string) || "PUBLISHED";

  if (!title) return { error: "Title is required" };
  if (!videoUrl) return { error: "Audio/Video URL is required" };

  let slug = slugify(title);
  const existing = await prisma.content.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now()}`;

  try {
    const content = await prisma.content.create({
      data: {
        title,
        slug,
        description: `${title} by ${artist || "Unknown Artist"}`,
        type: "MUSIC",
        posterUrl,
        status: status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
        publishedAt: status === "PUBLISHED" ? new Date() : null,
        music: { create: { artist, album } },
        downloadEnabled: downloadUrl ? true : false, // 👈 NAYA
      },
    });

    if (videoUrl) {
      await prisma.videoSource.create({
        data: { contentId: content.id, url: videoUrl, type: "mp4", isDefault: true },
      });
    }

    if (downloadUrl) {
      await prisma.downloadOption.create({ // 👈 NAYA
        data: { contentId: content.id, quality: "Original", fileUrl: downloadUrl, format: "mp3", isAvailable: true },
      });
    }

    revalidatePath("/admin/music");
    revalidatePath("/music");
  } catch (error) {
    console.error("Create music error:", error);
    return { error: "Failed to create music" };
  }

  redirect("/admin/music");
}

export async function updateMusicAction(contentId: string, _prev: MusicFormState, formData: FormData): Promise<MusicFormState> {
  try { await requireAdminAction(); } catch { return { error: "Unauthorized" }; }

  const title = (formData.get("title") as string)?.trim();
  const artist = (formData.get("artist") as string)?.trim() || null;
  const album = (formData.get("album") as string)?.trim() || null;
  const posterUrl = (formData.get("posterUrl") as string)?.trim() || null;
  const videoUrl = (formData.get("videoUrl") as string)?.trim() || null;
  const downloadUrl = (formData.get("downloadUrl") as string)?.trim() || null; // 👈 NAYA
  const status = (formData.get("status") as string) || "PUBLISHED";

  if (!title) return { error: "Title is required" };

  try {
    await prisma.content.update({
      where: { id: contentId },
      data: {
        title,
        posterUrl,
        status: status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
        music: { upsert: { create: { artist, album }, update: { artist, album } } },
        downloadEnabled: downloadUrl ? true : false, // 👈 NAYA
      },
    });

    if (videoUrl) {
      await prisma.videoSource.deleteMany({ where: { contentId } });
      await prisma.videoSource.create({ data: { contentId, url: videoUrl, type: "mp4", isDefault: true } });
    }

    if (downloadUrl) {
      await prisma.downloadOption.deleteMany({ where: { contentId } }); // 👈 NAYA
      await prisma.downloadOption.create({ data: { contentId, quality: "Original", fileUrl: downloadUrl, format: "mp3", isAvailable: true } });
    }

    revalidatePath("/admin/music");
    revalidatePath(`/admin/music/${contentId}/edit`);
    revalidatePath("/music");
  } catch (error) {
    console.error("Update music error:", error);
    return { error: "Failed to update music" };
  }

  redirect("/admin/music");
}

export async function deleteMusicAction(id: string) {
  try { await requireAdminAction(); } catch { return { error: "Unauthorized" }; }
  try {
    await prisma.content.delete({ where: { id } });
    revalidatePath("/admin/music");
    revalidatePath("/music");
    return { success: true };
  } catch (error) { return { error: "Failed to delete music" }; }
}