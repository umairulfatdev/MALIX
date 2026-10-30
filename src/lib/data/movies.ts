"use server";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export interface MovieListItem {
  id: string;
  title: string;
  slug: string;
  posterUrl: string | null;
  releaseYear: number | null;
  avgRating: number | null;
  language: string | null;
  duration: number | null;
  genres: { id: string; name: string; slug: string }[];
}

export async function getMovies(filters: any = {}) {
  const { search, genres = [], year, minRating, language, sort = "latest", page = 1, perPage = 20 } = filters;
  // 👈 Yahan isComingSoon: false add kiya hai
  const where: Prisma.ContentWhereInput = { type: "MOVIE", status: "PUBLISHED", isComingSoon: false };

  if (search && search.trim()) where.OR = [{ title: { contains: search, mode: "insensitive" } }];
  if (genres.length > 0) where.genres = { some: { slug: { in: genres } } };
  if (year) where.releaseYear = year;
  if (minRating !== undefined) where.avgRating = { gte: minRating };
  if (language) where.language = language;

  let orderBy: Prisma.ContentOrderByWithRelationInput = { createdAt: "desc" };
  if (sort === "popular") orderBy = { totalViews: "desc" };
  if (sort === "top-rated") orderBy = { avgRating: "desc" };
  if (sort === "az") orderBy = { title: "asc" };
  if (sort === "za") orderBy = { title: "desc" };

  const [contents, total] = await Promise.all([
    prisma.content.findMany({
      where, orderBy, skip: (page - 1) * perPage, take: perPage,
      select: { id: true, title: true, slug: true, posterUrl: true, releaseYear: true, avgRating: true, language: true, duration: true, genres: { select: { id: true, name: true, slug: true } } },
    }),
    prisma.content.count({ where }),
  ]);

  return { movies: contents, total, page, perPage, totalPages: Math.ceil(total / perPage) };
}

export async function getAllGenres() {
  return prisma.genre.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, slug: true } });
}

export async function getAllLanguages() {
  // 👈 Yahan bhi add kiya hai
  const contents = await prisma.content.findMany({ where: { type: "MOVIE", status: "PUBLISHED", isComingSoon: false }, select: { language: true }, distinct: ["language"] });
  return contents.map((c) => c.language).filter((l): l is string => Boolean(l)).sort();
}

export async function getAllYears() {
  // 👈 Yahan bhi add kiya hai
  const contents = await prisma.content.findMany({ where: { type: "MOVIE", status: "PUBLISHED", isComingSoon: false }, select: { releaseYear: true }, distinct: ["releaseYear"] });
  return contents.map((c) => c.releaseYear).filter((y): y is number => Boolean(y)).sort((a, b) => b - a);
}