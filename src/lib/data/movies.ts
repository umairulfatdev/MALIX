import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export interface MovieFilters {
  search?: string;
  genre?: string;
  year?: number;
  minRating?: number;
  language?: string;
  sort?: "latest" | "oldest" | "popular" | "rating" | "az" | "za";
  page?: number;
  limit?: number;
}

export interface MovieListItem {
  id: string;
  title: string;
  slug: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  releaseYear: number | null;
  language: string | null;
  duration: number | null;
  avgRating: number | null;
  totalViews: number;
  createdAt: Date;
  genres: { id: string; name: string; slug: string }[];
}

export async function getMovies(filters: MovieFilters = {}) {
  const {
    search,
    genre,
    year,
    minRating,
    language,
    sort = "latest",
    page = 1,
    limit = 24,
  } = filters;

  const where: Prisma.ContentWhereInput = {
    type: "MOVIE",
    status: "PUBLISHED",
  };

  if (search && search.trim()) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  if (genre) where.genres = { some: { slug: genre } };
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
      orderBy = { avgRating: "desc" };
      break;
    case "az":
      orderBy = { title: "asc" };
      break;
    case "za":
      orderBy = { title: "desc" };
      break;
  }

  const [movies, total] = await Promise.all([
    prisma.content.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        posterUrl: true,
        backdropUrl: true,
        releaseYear: true,
        language: true,
        duration: true,
        avgRating: true,
        totalViews: true,
        createdAt: true,
        genres: {
          select: { id: true, name: true, slug: true },
        },
      },
    }),
    prisma.content.count({ where }),
  ]);

  return {
    movies: movies as MovieListItem[],
    total,
    page,
    totalPages: Math.ceil(total / limit),
    hasMore: page * limit < total,
  };
}

export async function getMovieFilterOptions() {
  const [genres, years, languages] = await Promise.all([
    prisma.genre.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    prisma.content.findMany({
      where: {
        type: "MOVIE",
        status: "PUBLISHED",
        releaseYear: { not: null },
      },
      select: { releaseYear: true },
      distinct: ["releaseYear"],
      orderBy: { releaseYear: "desc" },
    }),
    prisma.content.findMany({
      where: {
        type: "MOVIE",
        status: "PUBLISHED",
        language: { not: null },
      },
      select: { language: true },
      distinct: ["language"],
      orderBy: { language: "asc" },
    }),
  ]);

  return {
    genres,
    years: years.map((y) => y.releaseYear).filter(Boolean) as number[],
    languages: languages.map((l) => l.language).filter(Boolean) as string[],
  };
}