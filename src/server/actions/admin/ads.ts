"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

async function requireAdminAction() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") throw new Error("FORBIDDEN");
  return user;
}

export interface AdFormState {
  error?: string;
  success?: boolean;
}

export async function createAdAction(
  _prev: AdFormState,
  formData: FormData
): Promise<AdFormState> {
  try { await requireAdminAction(); } catch { return { error: "Unauthorized" }; }

  const title = (formData.get("title") as string)?.trim();
  const type = (formData.get("type") as string) || "banner";
  const position = (formData.get("position") as string) || "homepage";
  const imageUrl = (formData.get("imageUrl") as string)?.trim() || null;
  const videoUrl = (formData.get("videoUrl") as string)?.trim() || null;
  const linkUrl = (formData.get("linkUrl") as string)?.trim() || null;

  if (!title) return { error: "Title is required" };

  try {
    await prisma.ad.create({
      data: { title, type, position, imageUrl, videoUrl, linkUrl, isActive: true },
    });
    revalidatePath("/admin/ads");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Create ad error:", error);
    return { error: "Failed to create ad" };
  }
}

export async function updateAdAction(
  adId: string,
  _prev: AdFormState,
  formData: FormData
): Promise<AdFormState> {
  try { await requireAdminAction(); } catch { return { error: "Unauthorized" }; }

  const title = (formData.get("title") as string)?.trim();
  const type = (formData.get("type") as string) || "banner";
  const position = (formData.get("position") as string) || "homepage";
  const imageUrl = (formData.get("imageUrl") as string)?.trim() || null;
  const videoUrl = (formData.get("videoUrl") as string)?.trim() || null;
  const linkUrl = (formData.get("linkUrl") as string)?.trim() || null;
  const isActive = formData.get("isActive") === "on";

  if (!title) return { error: "Title is required" };

  try {
    await prisma.ad.update({
      where: { id: adId },
      data: { title, type, position, imageUrl, videoUrl, linkUrl, isActive },
    });
    revalidatePath("/admin/ads");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Update ad error:", error);
    return { error: "Failed to update ad" };
  }
}

export async function deleteAdAction(adId: string) {
  try { await requireAdminAction(); } catch { return { error: "Unauthorized" }; }
  try {
    await prisma.ad.delete({ where: { id: adId } });
    revalidatePath("/admin/ads"); revalidatePath("/");
    return { success: true };
  } catch (error) { return { error: "Failed to delete ad" }; }
}

export async function getAdminAds() {
  try { await requireAdminAction(); } catch { return []; }
  return await prisma.ad.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getAdForEdit(adId: string) {
  try { await requireAdminAction(); } catch { return null; }
  return await prisma.ad.findUnique({ where: { id: adId } });
}