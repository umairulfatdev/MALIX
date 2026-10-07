"use server";

import { prisma } from "@/lib/prisma";

export interface SearchResult {
  id: string;
  title: string;
  slug: string;
  posterUrl: string | null;
  releaseYear: number | null;
  avgRating: number | null;
  type: string;
}

export async function globalSearch(params: {
  query: string;
  type?: string;
  sort?: string;
  page?: number;
  perPage?: number;
}) {
  const { query, type, sort = "relevance", page = 1, perPage = 24 } = params;

  if (!query || query.trim().length < 2) {
    return {
      results: [],
      total: 0,
      page: 1,
      totalPages: 0,
    };
  }

  const where: any = {
    status: "PUBLISHED",
    OR: [
      { title: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
      { shortDesc: { contains: query, mode: "insensitive" } },
    ],
  };

  if (type && type !== "ALL") {
    where.type = type;
  }

  let orderBy: any = { createdAt: "desc" };
  switch (sort) {
    case "latest":
      orderBy = { releaseYear: "desc" };
      break;
    case "oldest":
      orderBy = { releaseYear: "asc" };
      break;
    case "rating":
      orderBy = { avgRating: "desc" };
      break;
    case "popular":
      orderBy = { totalViews: "desc" };
      break;
    case "az":
      orderBy = { title: "asc" };
      break;
    case "relevance":
    default:
      orderBy = { avgRating: "desc" };
      break;
  }

  const [results, total] = await Promise.all([
    prisma.content.findMany({
      where,
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        title: true,
        slug: true,
        posterUrl: true,
        releaseYear: true,
        avgRating: true,
        type: true,
      },
    }),
    prisma.content.count({ where }),
  ]);

  return {
    results,
    total,
    page,
    totalPages: Math.ceil(total / perPage),
  };
}

// ============================================================
// QUICK SEARCH SUGGESTIONS (navbar ke liye)
// ============================================================

export async function quickSearch(query: string, limit = 6) {
  if (!query || query.trim().length < 2) return [];

  const results = await prisma.content.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: { avgRating: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      slug: true,
      posterUrl: true,
      releaseYear: true,
      avgRating: true,
      type: true,
    },
  });

  return results;
}