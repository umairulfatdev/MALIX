"use server";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export interface DramaFilters {
  search?: string;
  genres?: string[];
  country?: string;
  language?: string;
  year?: number;
  minRating?: number;
  sort?: "latest" | "popular" | "az" | "za" | "top-rated" | "rating" | "oldest";
  page?: number;
  perPage?: number;
}

export interface DramaListItem {
  id: string;
  title: string;
  slug: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  releaseYear: number | null;
  avgRating: number | null;
  duration: number | null;
  language: string | null;
  country: string | null;
  totalEps: number | null;
  genres: { id: string; name: string; slug: string }[];
}

export interface DramasResult {
  dramas: DramaListItem[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export async function getDramas(
  filters: DramaFilters = {}
): Promise<DramasResult> {
  const {
    search,
    genres = [],
    country,
    language,
    year,
    minRating,
    sort = "latest",
    page = 1,
    perPage = 20,
  } = filters;

  const where: Prisma.ContentWhereInput = {
    type: "DRAMA",
    status: "PUBLISHED",
  };

  if (search && search.trim()) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  if (genres.length > 0) {
    where.genres = {
      some: {
        slug: { in: genres },
      },
    };
  }

  if (country) {
    where.country = country;
  }

  if (language) {
    where.language = language;
  }

  if (year) {
    where.releaseYear = year;
  }

  if (minRating !== undefined) {
    where.avgRating = { gte: minRating };
  }

  let orderBy: Prisma.ContentOrderByWithRelationInput;
  switch (sort) {
    case "popular":
      orderBy = { totalViews: "desc" };
      break;
    case "top-rated":
      orderBy = { avgRating: "desc" };
      break;
    case "az":
      orderBy = { title: "asc" };
      break;
    case "za":
      orderBy = { title: "desc" };
      break;
    case "latest":
    default:
      orderBy = { createdAt: "desc" };
      break;
  }

  const skip = (page - 1) * perPage;

  const [contents, total] = await Promise.all([
    prisma.content.findMany({
      where,
      orderBy,
      skip,
      take: perPage,
      select: {
        id: true,
        title: true,
        slug: true,
        posterUrl: true,
        backdropUrl: true,
        releaseYear: true,
        avgRating: true,
        duration: true,
        language: true,
        country: true,
        genres: {
          select: { id: true, name: true, slug: true },
        },
        drama: {
          select: { totalEps: true },
        },
      },
    }),
    prisma.content.count({ where }),
  ]);

  const dramas = contents.map((c) => ({
    id: c.id,
    title: c.title,
    slug: c.slug,
    posterUrl: c.posterUrl,
    backdropUrl: c.backdropUrl,
    releaseYear: c.releaseYear,
    avgRating: c.avgRating,
    duration: c.duration,
    language: c.language,
    country: c.country,
    totalEps: c.drama?.totalEps ?? null,
    genres: c.genres,
  }));

  return {
    dramas,
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

export async function getDramaCountries() {
  const contents = await prisma.content.findMany({
    where: { type: "DRAMA", status: "PUBLISHED" },
    select: { country: true },
    distinct: ["country"],
  });
  return contents
    .map((c) => c.country)
    .filter((c): c is string => Boolean(c))
    .sort();
}

export async function getDramaLanguages() {
  const contents = await prisma.content.findMany({
    where: { type: "DRAMA", status: "PUBLISHED" },
    select: { language: true },
    distinct: ["language"],
  });
  return contents
    .map((c) => c.language)
    .filter((l): l is string => Boolean(l))
    .sort();
}

export async function getDramaYears() {
  const contents = await prisma.content.findMany({
    where: { type: "DRAMA", status: "PUBLISHED" },
    select: { releaseYear: true },
    distinct: ["releaseYear"],
  });
  return contents
    .map((c) => c.releaseYear)
    .filter((y): y is number => Boolean(y))
    .sort((a, b) => b - a);
}

export async function getDramaGenres() {
  return prisma.genre.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });
}