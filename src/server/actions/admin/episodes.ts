"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

async function requireAdminAction() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") throw new Error("FORBIDDEN");
  return user;
}

export interface EpisodeFormState {
  error?: string;
  success?: boolean;
}

export async function getEpisodes() {
  try { await requireAdminAction(); } catch { return []; }
  return await prisma.episode.findMany({
    orderBy: [{ season: { series: { content: { title: "asc" } } } }, { seasonId: "asc" }, { episodeNum: "asc" }],
    include: {
      season: {
        include: {
          series: {
            include: { content: { select: { title: true } } }
          }
        }
      }
    }
  });
}

export async function getSeriesWithSeasons() {
  try { await requireAdminAction(); } catch { return []; }
  return await prisma.series.findMany({
    include: {
      content: { select: { title: true } },
      seasons: { orderBy: { seasonNumber: "asc" } }
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function createEpisodeAction(_prev: EpisodeFormState, formData: FormData): Promise<EpisodeFormState> {
  try { await requireAdminAction(); } catch { return { error: "Unauthorized" }; }

  const seasonId = formData.get("seasonId") as string;
  const episodeNumRaw = formData.get("episodeNum") as string;
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const durationRaw = formData.get("duration") as string;
  const videoUrl = (formData.get("videoUrl") as string)?.trim() || null;
  const thumbnailUrl = (formData.get("thumbnailUrl") as string)?.trim() || null;
  const status = (formData.get("status") as string) || "PUBLISHED";

  if (!seasonId) return { error: "Please select a Season" };
  if (!episodeNumRaw) return { error: "Episode number is required" };
  if (!title) return { error: "Episode title is required" };

  const episodeNum = parseInt(episodeNumRaw);
  const duration = durationRaw ? parseInt(durationRaw) : null;

  try {
    await prisma.episode.create({
      data: {
        seasonId,
        episodeNum,
        title,
        description,
        duration,
        videoUrl,
        thumbnailUrl,
        status: status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
      },
    });

    revalidatePath("/admin/episodes");
    revalidatePath("/series");
  } catch (error) {
    console.error("Create episode error:", error);
    return { error: "Failed to create episode" };
  }

  redirect("/admin/episodes");
}

export async function deleteEpisodeAction(id: string) {
  try { await requireAdminAction(); } catch { return { error: "Unauthorized" }; }
  try {
    await prisma.episode.delete({ where: { id } });
    revalidatePath("/admin/episodes");
    return { success: true };
  } catch (error) { return { error: "Failed to delete episode" }; }
}