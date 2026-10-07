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

// ============================================================
// GET DRAMAS FOR ADMIN
// ============================================================

export async function getAdminDramas(params: {
  search?: string;
  status?: string;
  page?: number;
  perPage?: number;
}) {
  try {
    await requireAdminAction();
  } catch {
    return { dramas: [], total: 0, page: 1, totalPages: 0 };
  }

  const { search, status, page = 1, perPage = 20 } = params;
  const where: any = { type: "DRAMA" };

  if (search && search.trim()) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }
  if (status && status !== "ALL") where.status = status;

  const [dramas, total] = await Promise.all([
    prisma.content.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        genres: { select: { id: true, name: true, slug: true } },
      },
    }),
    prisma.content.count({ where }),
  ]);

  return { dramas, total, page, totalPages: Math.ceil(total / perPage) };
}

// ============================================================
// GET DRAMA FOR EDIT
// ============================================================

export async function getDramaForEdit(dramaId: string) {
  try {
    await requireAdminAction();
  } catch {
    return null;
  }

  return await prisma.content.findUnique({
    where: { id: dramaId, type: "DRAMA" },
    include: {
      genres: { select: { id: true, name: true } },
      drama: true,
    },
  });
}

// ============================================================
// CREATE DRAMA
// ============================================================

export async function createDramaAction(
  _prev: DramaFormState,
  formData: FormData
): Promise<DramaFormState> {
  try {
    await requireAdminAction();
  } catch {
    return { error: "Unauthorized" };
  }

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const shortDesc = (formData.get("shortDesc") as string)?.trim() || null;
  const releaseYearRaw = formData.get("releaseYear") as string;
  const durationRaw = formData.get("duration") as string;
  const totalEpsRaw = formData.get("totalEps") as string;
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
  const duration = durationRaw ? parseInt(durationRaw) : null;
  const totalEps = totalEpsRaw ? parseInt(totalEpsRaw) : 1;

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
        type: "DRAMA",
        releaseYear,
        duration,
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
        drama: {
          create: { totalEps },
        },
      },
    });

    revalidatePath("/admin/dramas");
    revalidatePath("/dramas");
    revalidatePath("/");
    redirect("/admin/dramas");
  } catch (error) {
    console.error("Create drama error:", error);
    return { error: "Failed to create drama" };
  }
}

// ============================================================
// UPDATE DRAMA
// ============================================================

export async function updateDramaAction(
  dramaId: string,
  _prev: DramaFormState,
  formData: FormData
): Promise<DramaFormState> {
  try {
    await requireAdminAction();
  } catch {
    return { error: "Unauthorized" };
  }

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const shortDesc = (formData.get("shortDesc") as string)?.trim() || null;
  const releaseYearRaw = formData.get("releaseYear") as string;
  const durationRaw = formData.get("duration") as string;
  const totalEpsRaw = formData.get("totalEps") as string;
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
    return { error: "Description required (min 10 chars)" };

  const releaseYear = releaseYearRaw ? parseInt(releaseYearRaw) : null;
  const duration = durationRaw ? parseInt(durationRaw) : null;
  const totalEps = totalEpsRaw ? parseInt(totalEpsRaw) : 1;

  try {
    const existing = await prisma.content.findUnique({
      where: { id: dramaId },
      include: { drama: true },
    });

    if (!existing) return { error: "Drama not found" };

    await prisma.content.update({
      where: { id: dramaId },
      data: {
        title,
        description,
        shortDesc,
        releaseYear,
        duration,
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
        drama: existing.drama
          ? { update: { totalEps } }
          : { create: { totalEps } },
      },
    });

    revalidatePath("/admin/dramas");
    revalidatePath(`/admin/dramas/${dramaId}/edit`);
    revalidatePath("/dramas");
    revalidatePath("/");
    redirect("/admin/dramas");
  } catch (error) {
    console.error("Update drama error:", error);
    return { error: "Failed to update drama" };
  }
}

// ============================================================
// DELETE DRAMA
// ============================================================

export async function deleteDramaAction(dramaId: string) {
  try {
    await requireAdminAction();
  } catch {
    return { error: "Unauthorized" };
  }

  try {
    await prisma.content.delete({ where: { id: dramaId } });
    revalidatePath("/admin/dramas");
    revalidatePath("/dramas");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Delete drama error:", error);
    return { error: "Failed to delete drama" };
  }
}

// ============================================================
// TOGGLE PUBLISH
// ============================================================

export async function toggleDramaPublishAction(dramaId: string) {
  try {
    await requireAdminAction();
  } catch {
    return { error: "Unauthorized" };
  }

  try {
    const content = await prisma.content.findUnique({ where: { id: dramaId } });
    if (!content) return { error: "Not found" };

    const newStatus = content.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";

    await prisma.content.update({
      where: { id: dramaId },
      data: {
        status: newStatus,
        publishedAt: newStatus === "PUBLISHED" ? new Date() : content.publishedAt,
      },
    });

    revalidatePath("/admin/dramas");
    revalidatePath("/dramas");
    revalidatePath("/");
    return { success: true, status: newStatus };
  } catch (error) {
    console.error("Toggle drama publish error:", error);
    return { error: "Failed to toggle status" };
  }
}

// ============================================================
// GET ALL GENRES
// ============================================================

export async function getAllGenresForDramaAdmin() {
  return await prisma.genre.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });
}