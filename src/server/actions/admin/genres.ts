"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { slugify } from "@/lib/utils";

async function requireAdminAction() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }
  return user;
}

export interface GenreFormState {
  error?: string;
  success?: boolean;
}

// ============================================================
// GET ALL GENRES
// ============================================================

export async function getAdminGenres(params: {
  search?: string;
  page?: number;
  perPage?: number;
} = {}) {
  try {
    await requireAdminAction();
  } catch {
    return { genres: [], total: 0, page: 1, totalPages: 0 };
  }

  const { search, page = 1, perPage = 30 } = params;

  const where: any = {};
  if (search && search.trim()) {
    where.name = { contains: search, mode: "insensitive" };
  }

  const [genres, total] = await Promise.all([
    prisma.genre.findMany({
      where,
      orderBy: { name: "asc" },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        _count: {
          select: { contents: true },
        },
      },
    }),
    prisma.genre.count({ where }),
  ]);

  return {
    genres,
    total,
    page,
    totalPages: Math.ceil(total / perPage),
  };
}

// ============================================================
// CREATE GENRE
// ============================================================

export async function createGenreAction(
  _prev: GenreFormState,
  formData: FormData
): Promise<GenreFormState> {
  try {
    await requireAdminAction();
  } catch {
    return { error: "Unauthorized" };
  }

  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;

  if (!name || name.length < 2) {
    return { error: "Genre name is required (min 2 characters)" };
  }

  const slug = slugify(name);

  const existing = await prisma.genre.findFirst({
    where: {
      OR: [{ name }, { slug }],
    },
  });

  if (existing) {
    return { error: "Genre already exists" };
  }

  try {
    await prisma.genre.create({
      data: { name, slug, description },
    });

    revalidatePath("/admin/genres");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Create genre error:", error);
    return { error: "Failed to create genre" };
  }
}

// ============================================================
// UPDATE GENRE
// ============================================================

export async function updateGenreAction(
  genreId: string,
  _prev: GenreFormState,
  formData: FormData
): Promise<GenreFormState> {
  try {
    await requireAdminAction();
  } catch {
    return { error: "Unauthorized" };
  }

  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;

  if (!name || name.length < 2) {
    return { error: "Genre name is required" };
  }

  const slug = slugify(name);

  try {
    await prisma.genre.update({
      where: { id: genreId },
      data: { name, slug, description },
    });

    revalidatePath("/admin/genres");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Update genre error:", error);
    return { error: "Failed to update genre" };
  }
}

// ============================================================
// DELETE GENRE
// ============================================================

export async function deleteGenreAction(genreId: string) {
  try {
    await requireAdminAction();
  } catch {
    return { error: "Unauthorized" };
  }

  try {
    // Check if genre is used by any content
    const count = await prisma.genre.findUnique({
      where: { id: genreId },
      include: { _count: { select: { contents: true } } },
    });

    if (count && count._count.contents > 0) {
      return {
        error: `Cannot delete — genre is used by ${count._count.contents} content item(s)`,
      };
    }

    await prisma.genre.delete({ where: { id: genreId } });

    revalidatePath("/admin/genres");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Delete genre error:", error);
    return { error: "Failed to delete genre" };
  }
}