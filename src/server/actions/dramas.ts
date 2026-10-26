"use server";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function getDramas(filters: any = {}) {
  const { search, genres = [], year, minRating, language, sort = "latest", page = 1, perPage = 20 } = filters;
  const where: Prisma.ContentWhereInput = { type: "DRAMA", status: "PUBLISHED" };

  if (search && search.trim()) where.OR = [{ title: { contains: search, mode: "insensitive" } }];
  if (genres.length > 0) where.genres = { some: { slug: { in: genres } } };
  if (year) where.releaseYear = year;
  if (minRating !== undefined) where.avgRating = { gte: minRating };
  if (language) where.language = language;

  let orderBy: Prisma.ContentOrderByWithRelationInput = { createdAt: "desc" };
  if (sort === "popular") orderBy = { totalViews: "desc" };
  if (sort === "top-rated") orderBy = { avgRating: "desc" };

  const [contents, total] = await Promise.all([
    prisma.content.findMany({
      where, orderBy, skip: (page - 1) * perPage, take: perPage,
      select: { id: true, title: true, slug: true, posterUrl: true, releaseYear: true, avgRating: true, language: true, country: true, genres: { select: { id: true, name: true, slug: true } } },
    }),
    prisma.content.count({ where }),
  ]);

  return { dramas: contents, total, page, perPage, totalPages: Math.ceil(total / perPage) };
}

export async function getDramaGenres() {
  return prisma.genre.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, slug: true } });
}

export async function getDramaLanguages() {
  const contents = await prisma.content.findMany({ where: { type: "DRAMA", status: "PUBLISHED" }, select: { language: true }, distinct: ["language"] });
  return contents.map((c) => c.language).filter((l): l is string => Boolean(l)).sort();
}

export async function getDramaYears() {
  const contents = await prisma.content.findMany({ where: { type: "DRAMA", status: "PUBLISHED" }, select: { releaseYear: true }, distinct: ["releaseYear"] });
  return contents.map((c) => c.releaseYear).filter((y): y is number => Boolean(y)).sort((a, b) => b - a);
}

export async function getDramaCountries() {
  const contents = await prisma.content.findMany({ where: { type: "DRAMA", status: "PUBLISHED" }, select: { country: true }, distinct: ["country"] });
  return contents.map((c) => c.country).filter((c): c is string => Boolean(c)).sort();
}