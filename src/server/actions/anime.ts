"use server";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

type SortOption =
  | "latest"
  | "oldest"
  | "popular"
  | "rating"
  | "az"
  | "za"
  | "top-rated";

export async function getAnime(params: {
  search?: string;
  genres?: string[];
  year?: number;
  minRating?: number;
  language?: string;
  sort?: SortOption;
  page?: number;
  perPage?: number;
}) {
  const {
    search,
    genres = [],
    year,
    minRating,
    language,
    sort = "latest",
    page = 1,
    perPage = 20,
  } = params;

  const where: Prisma.ContentWhereInput = {
    type: "ANIME",
    status: "PUBLISHED",
  };

  if (search && search.trim()) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  if (genres.length > 0) {
    where.genres = { some: { slug: { in: genres } } };
  }

  if (year) where.releaseYear = year;
  if (minRating && minRating > 0) where.avgRating = { gte: minRating };
  if (language) where.language = language;

  let orderBy: Prisma.ContentOrderByWithRelationInput = {
    createdAt: "desc",
  };
  switch (sort) {
    case "latest":
      orderBy = { releaseYear: "desc" };
      break;
    case "oldest":
      orderBy = { releaseYear: "asc" };
      break;
    case "popular":
      orderBy = { totalViews: "desc" };
      break;
        case "rating":
    case "top-rated":
      orderBy = { avgRating: "desc" };
      break;
    case "az":
      orderBy = { title: "asc" };
      break;
    case "za":
      orderBy = { title: "desc" };
      break;
  }

  const [anime, total] = await Promise.all([
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
        backdropUrl: true,
        releaseYear: true,
        language: true,
        avgRating: true,
        totalViews: true,
        createdAt: true,
        genres: { select: { id: true, name: true, slug: true } },
      },
    }),
    prisma.content.count({ where }),
  ]);

  return {
    anime,
    total,
    page,
    totalPages: Math.ceil(total / perPage),
  };
}

export async function getAllAnimeGenres() {
  const genres = await prisma.genre.findMany({
    where: {
      contents: {
        some: { type: "ANIME", status: "PUBLISHED" },
      },
    },
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });
  return genres;
}

export async function getAllAnimeLanguages() {
  const items = await prisma.content.findMany({
    where: { type: "ANIME", status: "PUBLISHED", language: { not: null } },
    select: { language: true },
    distinct: ["language"],
    orderBy: { language: "asc" },
  });
  return items.map((i) => i.language).filter(Boolean) as string[];
}

export async function getAllAnimeYears() {
  const items = await prisma.content.findMany({
    where: {
      type: "ANIME",
      status: "PUBLISHED",
      releaseYear: { not: null },
    },
    select: { releaseYear: true },
    distinct: ["releaseYear"],
    orderBy: { releaseYear: "desc" },
  });
  return items.map((i) => i.releaseYear).filter(Boolean) as number[];
}