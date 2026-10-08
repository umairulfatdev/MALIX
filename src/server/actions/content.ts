"use server";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export interface MovieFilters {
  search?: string;
  genres?: string[];
  year?: number;
  minRating?: number;
  language?: string;
  sort?:
  | "latest"
  | "oldest"
  | "popular"
  | "rating"
  | "top-rated"
  | "az"
  | "za";
  page?: number;
  perPage?: number;
}

export interface MovieListItem {
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
  genres: { id: string; name: string; slug: string }[];
}

export interface MoviesResult {
  movies: MovieListItem[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export async function getMovies(
  filters: MovieFilters = {}
): Promise<MoviesResult> {
  const {
    search,
    genres = [],
    year,
    minRating,
    language,
    sort = "latest",
    page = 1,
    perPage = 20,
  } = filters;

  const where: Prisma.ContentWhereInput = {
    type: "MOVIE",
    status: "PUBLISHED",
  };

  // Search
  if (search && search.trim()) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  // Genres
  if (genres.length > 0) {
    where.genres = {
      some: {
        slug: { in: genres },
      },
    };
  }

  // Year
  if (year) {
    where.releaseYear = year;
  }

  // Rating
  if (minRating !== undefined) {
    where.avgRating = { gte: minRating };
  }

  // Language
  if (language) {
    where.language = language;
  }

  // Sort
  let orderBy: Prisma.ContentOrderByWithRelationInput;switch (sort) {
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
  default:
    orderBy = { createdAt: "desc" };
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
      },
    }),
    prisma.content.count({ where }),
  ]);

  return {
    movies: contents,
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

export async function getAllGenres() {
  return prisma.genre.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });
}

export async function getAllLanguages() {
  const contents = await prisma.content.findMany({
    where: { type: "MOVIE", status: "PUBLISHED" },
    select: { language: true },
    distinct: ["language"],
  });
  return contents
    .map((c) => c.language)
    .filter((l): l is string => Boolean(l))
    .sort();
}

export async function getAllYears() {
  const contents = await prisma.content.findMany({
    where: { type: "MOVIE", status: "PUBLISHED" },
    select: { releaseYear: true },
    distinct: ["releaseYear"],
  });
  return contents
    .map((c) => c.releaseYear)
    .filter((y): y is number => Boolean(y))
    .sort((a, b) => b - a);
}