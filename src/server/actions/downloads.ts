"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export interface DownloadOption {
  id: string;
  quality: string;
  fileUrl: string;
  fileSize: string | null;
  format: string | null;
}

export interface DownloadableContent {
  id: string;
  title: string;
  slug: string;
  type: string;
  posterUrl: string | null;
  releaseYear: number | null;
  avgRating: number | null;
  downloadOptions: DownloadOption[];
}

export interface DownloadHistoryItem {
  id: string;
  quality: string;
  fileSize: string | null;
  downloadedAt: Date;
  content: {
    id: string;
    title: string;
    slug: string;
    posterUrl: string | null;
    type: string;
  };
}

function formatBytes(bytes: bigint | null): string | null {
  if (!bytes) return null;
  const n = Number(bytes);
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(n) / Math.log(k));
  return `${(n / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

// ============ Get download options for content ============
export async function getDownloadOptions(
  contentId: string
): Promise<DownloadOption[]> {
  const options = await prisma.downloadOption.findMany({
    where: { contentId, isAvailable: true },
    orderBy: { quality: "desc" },
  });

  return options.map((o) => ({
    id: o.id,
    quality: o.quality,
    fileUrl: o.fileUrl,
    fileSize: formatBytes(o.fileSize),
    format: o.format,
  }));
}

// ============ Record a download ============
export async function recordDownload(
  contentId: string,
  quality: string,
  downloadOptionId: string
) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Not authenticated" };

  try {
    const option = await prisma.downloadOption.findUnique({
      where: { id: downloadOptionId },
    });

    if (!option) return { success: false, error: "Option not found" };

    const content = await prisma.content.findUnique({
      where: { id: contentId },
    });

    if (!content?.downloadEnabled) {
      return { success: false, error: "Downloads not enabled" };
    }

    await prisma.downloadHistory.create({
      data: {
        userId: user.id,
        contentId,
        downloadOptionId,
        quality,
        fileSize: option.fileSize,
        status: "completed",
      },
    });

    await prisma.content.update({
      where: { id: contentId },
      data: { totalDownloads: { increment: 1 } },
    });

    return { success: true };
  } catch (err) {
    console.error("Record download error:", err);
    return { success: false, error: "Failed to record download" };
  }
}

// ============ Get user's download history ============
export async function getUserDownloads(): Promise<DownloadHistoryItem[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const downloads = await prisma.downloadHistory.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      content: {
        select: {
          id: true,
          title: true,
          slug: true,
          posterUrl: true,
          type: true,
        },
      },
    },
  });

  return downloads.map((d) => ({
    id: d.id,
    quality: d.quality,
    fileSize: formatBytes(d.fileSize),
    downloadedAt: d.createdAt,
    content: d.content,
  }));
}

// ============ Get all downloadable content ============
export async function getDownloadableContent(): Promise<DownloadableContent[]> {
  const contents = await prisma.content.findMany({
    where: {
      status: "PUBLISHED",
      downloadEnabled: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      downloadOptions: {
        where: { isAvailable: true },
        orderBy: { quality: "desc" },
      },
    },
  });

  return contents.map((c) => ({
    id: c.id,
    title: c.title,
    slug: c.slug,
    type: c.type,
    posterUrl: c.posterUrl,
    releaseYear: c.releaseYear,
    avgRating: c.avgRating,
    downloadOptions: c.downloadOptions.map((o) => ({
      id: o.id,
      quality: o.quality,
      fileUrl: o.fileUrl,
      fileSize: formatBytes(o.fileSize),
      format: o.format,
    })),
  }));
}

// ============ Clear download history ============
export async function clearDownloadHistory() {
  const user = await getCurrentUser();
  if (!user) return { success: false };

  try {
    await prisma.downloadHistory.deleteMany({
      where: { userId: user.id },
    });
    return { success: true };
  } catch {
    return { success: false };
  }
}