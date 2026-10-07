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

export interface AnimeFormState {
  error?: string;
  success?: boolean;
}

// ============================================================
// GET ANIME FOR ADMIN
// ============================================================

export async function getAdminAnime(params: {
  search?: string;
  status?: string;
  page?: number;
  perPage?: number;
}) {
  try {
    await requireAdminAction();
  } catch {
    return { anime: [], total: 0, page: 1, totalPages: 0 };
  }

  const { search, status, page = 1, perPage = 20 } = params;
  const where: any = { type: "ANIME" };

  if (search && search.trim()) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }
  if (status && status !== "ALL") where.status = status;

  const [anime, total] = await Promise.all([
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

  return { anime, total, page, totalPages: Math.ceil(total / perPage) };
}

// ============================================================
// GET ANIME FOR EDIT
// ============================================================

export async function getAnimeForEdit(animeId: string) {
  try {
    await requireAdminAction();
  } catch {
    return null;
  }

  return await prisma.content.findUnique({
    where: { id: animeId, type: "ANIME" },
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
// CREATE ANIME
// ============================================================

export async function createAnimeAction(
  _prev: AnimeFormState,
  formData: FormData
): Promise<AnimeFormState> {
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
        type: "ANIME",
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

    revalidatePath("/admin/anime");
    revalidatePath("/anime");
    revalidatePath("/");
    redirect("/admin/anime");
  } catch (error) {
    console.error("Create anime error:", error);
    return { error: "Failed to create anime" };
  }
}

// ============================================================
// UPDATE ANIME
// ============================================================

export async function updateAnimeAction(
  animeId: string,
  _prev: AnimeFormState,
  formData: FormData
): Promise<AnimeFormState> {
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
      where: { id: animeId },
      include: { series: true },
    });

    if (!existing) return { error: "Anime not found" };

    await prisma.content.update({
      where: { id: animeId },
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

    revalidatePath("/admin/anime");
    revalidatePath(`/admin/anime/${animeId}/edit`);
    revalidatePath("/anime");
    revalidatePath("/");
    redirect("/admin/anime");
  } catch (error) {
    console.error("Update anime error:", error);
    return { error: "Failed to update anime" };
  }
}

// ============================================================
// DELETE ANIME
// ============================================================

export async function deleteAnimeAction(animeId: string) {
  try {
    await requireAdminAction();
  } catch {
    return { error: "Unauthorized" };
  }

  try {
    await prisma.content.delete({ where: { id: animeId } });
    revalidatePath("/admin/anime");
    revalidatePath("/anime");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Delete anime error:", error);
    return { error: "Failed to delete anime" };
  }
}

// ============================================================
// TOGGLE PUBLISH
// ============================================================

export async function toggleAnimePublishAction(animeId: string) {
  try {
    await requireAdminAction();
  } catch {
    return { error: "Unauthorized" };
  }

  try {
    const content = await prisma.content.findUnique({ where: { id: animeId } });
    if (!content) return { error: "Not found" };

    const newStatus = content.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";

    await prisma.content.update({
      where: { id: animeId },
      data: {
        status: newStatus,
        publishedAt:
          newStatus === "PUBLISHED" ? new Date() : content.publishedAt,
      },
    });

    revalidatePath("/admin/anime");
    revalidatePath("/anime");
    revalidatePath("/");
    return { success: true, status: newStatus };
  } catch (error) {
    console.error("Toggle anime publish error:", error);
    return { error: "Failed to toggle status" };
  }
}

// ============================================================
// GET ALL GENRES FOR ANIME FORM (still needed for tags)
// ============================================================

export async function getAllGenresForAnimeAdmin() {
  return await prisma.genre.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });
}