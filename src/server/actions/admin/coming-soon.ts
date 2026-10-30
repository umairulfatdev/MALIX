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

export interface ComingSoonFormState {
  error?: string;
  success?: boolean;
}

export async function getAdminComingSoon(params: { search?: string; status?: string; page?: number; perPage?: number }) {
  try { await requireAdminAction(); } catch { return { items: [], total: 0, page: 1, totalPages: 0 }; }
  const { search, status, page = 1, perPage = 20 } = params;
  const where: any = { isComingSoon: true };
  if (search && search.trim()) where.title = { contains: search, mode: "insensitive" };
  if (status && status !== "ALL") where.status = status;
  const [items, total] = await Promise.all([
    prisma.content.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * perPage, take: perPage, include: { genres: true } }),
    prisma.content.count({ where }),
  ]);
  return { items, total, page, totalPages: Math.ceil(total / perPage) };
}

export async function getComingSoonForEdit(contentId: string) {
  try { await requireAdminAction(); } catch { return null; }
  return await prisma.content.findFirst({
    where: { id: contentId, isComingSoon: true },
    include: { genres: true },
  });
}

export async function createComingSoonAction(_prev: ComingSoonFormState, formData: FormData): Promise<ComingSoonFormState> {
  try { await requireAdminAction(); } catch { return { error: "Unauthorized" }; }

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || "";
  const shortDesc = (formData.get("shortDesc") as string)?.trim() || null;
  const type = (formData.get("type") as string) || "MOVIE";
  const releaseYearRaw = formData.get("releaseYear") as string;
  const comingSoonDateRaw = formData.get("comingSoonDate") as string;
  const language = (formData.get("language") as string)?.trim() || null;
  const country = (formData.get("country") as string)?.trim() || null;
  const posterUrl = (formData.get("posterUrl") as string)?.trim() || null;
  const backdropUrl = (formData.get("backdropUrl") as string)?.trim() || null;
  const trailerUrl = (formData.get("trailerUrl") as string)?.trim() || null;
  const status = (formData.get("status") as string) || "DRAFT";
  const isFeatured = formData.get("isFeatured") === "on";
  const genreIds = formData.getAll("genres") as string[];

  if (!title || title.length < 2) return { error: "Title is required" };

  const releaseYear = releaseYearRaw ? parseInt(releaseYearRaw) : null;
  const comingSoonDate = comingSoonDateRaw ? new Date(comingSoonDateRaw) : null;

  let slug = slugify(title);
  const existing = await prisma.content.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now()}`;

  try {
    await prisma.content.create({
      data: {
        title, slug, description, shortDesc,
        type: type as "MOVIE" | "SERIES" | "ANIME",
        releaseYear, language, country,
        posterUrl, backdropUrl, trailerUrl,
        status: status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
        isFeatured,
        isComingSoon: true,
        comingSoonDate,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
        genres: genreIds.length ? { connect: genreIds.map((id) => ({ id })) } : undefined,
      },
    });

    revalidatePath("/admin/coming-soon");
    revalidatePath("/coming-soon");
    revalidatePath("/");
  } catch (error) {
    console.error("Create coming soon error:", error);
    return { error: "Failed to create coming soon" };
  }

  // 👈 Redirect ab try/catch ke bahar hai
  redirect("/admin/coming-soon");
}

export async function updateComingSoonAction(contentId: string, _prev: ComingSoonFormState, formData: FormData): Promise<ComingSoonFormState> {
  try { await requireAdminAction(); } catch { return { error: "Unauthorized" }; }

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || "";
  const shortDesc = (formData.get("shortDesc") as string)?.trim() || null;
  const type = (formData.get("type") as string) || "MOVIE";
  const releaseYearRaw = formData.get("releaseYear") as string;
  const comingSoonDateRaw = formData.get("comingSoonDate") as string;
  const language = (formData.get("language") as string)?.trim() || null;
  const country = (formData.get("country") as string)?.trim() || null;
  const posterUrl = (formData.get("posterUrl") as string)?.trim() || null;
  const backdropUrl = (formData.get("backdropUrl") as string)?.trim() || null;
  const trailerUrl = (formData.get("trailerUrl") as string)?.trim() || null;
  const status = (formData.get("status") as string) || "DRAFT";
  const isFeatured = formData.get("isFeatured") === "on";
  const genreIds = formData.getAll("genres") as string[];

  if (!title || title.length < 2) return { error: "Title is required" };

  const releaseYear = releaseYearRaw ? parseInt(releaseYearRaw) : null;
  const comingSoonDate = comingSoonDateRaw ? new Date(comingSoonDateRaw) : null;

  try {
    const existing = await prisma.content.findFirst({ where: { id: contentId, isComingSoon: true } });
    if (!existing) return { error: "Coming Soon not found" };

    await prisma.content.update({
      where: { id: contentId },
      data: {
        title, description, shortDesc,
        type: type as "MOVIE" | "SERIES" | "ANIME",
        releaseYear, language, country,
        posterUrl, backdropUrl, trailerUrl,
        status: status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
        isFeatured,
        comingSoonDate,
        publishedAt: status === "PUBLISHED" && !existing.publishedAt ? new Date() : existing.publishedAt,
        genres: { set: [], connect: genreIds.map((id) => ({ id })) },
      },
    });

    revalidatePath("/admin/coming-soon");
    revalidatePath(`/admin/coming-soon/${contentId}/edit`);
    revalidatePath("/coming-soon");
    revalidatePath("/");
  } catch (error) {
    console.error("Update coming soon error:", error);
    return { error: "Failed to update coming soon" };
  }

  // 👈 Redirect ab try/catch ke bahar hai
  redirect("/admin/coming-soon");
}

export async function deleteComingSoonAction(contentId: string) {
  try { await requireAdminAction(); } catch { return { error: "Unauthorized" }; }
  try {
    await prisma.content.delete({ where: { id: contentId } });
    revalidatePath("/admin/coming-soon");
    revalidatePath("/coming-soon");
    return { success: true };
  } catch (error) { return { error: "Failed to delete" }; }
}

export async function toggleComingSoonPublishAction(contentId: string) {
  try { await requireAdminAction(); } catch { return { error: "Unauthorized" }; }
  try {
    const content = await prisma.content.findFirst({ where: { id: contentId, isComingSoon: true } });
    if (!content) return { error: "Not found" };
    const newStatus = content.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    await prisma.content.update({
      where: { id: contentId },
      data: { status: newStatus, publishedAt: newStatus === "PUBLISHED" ? new Date() : content.publishedAt },
    });
    revalidatePath("/admin/coming-soon");
    revalidatePath("/coming-soon");
    return { success: true, status: newStatus };
  } catch (error) { return { error: "Failed to toggle status" }; }
}

export async function getAllGenresForComingSoonAdmin() {
  return await prisma.genre.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, slug: true } });
}