"use server";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export interface SeriesFilters {
  search?: string;
  genres?: string[];
  year?: number;
  minRating?: number;
  language?: string;
  sort?: "latest" | "popular" | "top-rated" | "az" | "za";
  page?: number;
  perPage?: number;
}

export interface SeriesListItem {
  id: string;
  title: string;
  slug: string;
  posterUrl: string | null;
  releaseYear: number | null;
  avgRating: number | null;
  language: string | null;
  country: string | null;
  totalSeasons: number | null;
  genres: { id: string; name: string; slug: string }[];
}

export interface SeriesResult {
  series: SeriesListItem[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export async function getSeries(
  filters: SeriesFilters = {}
): Promise<SeriesResult> {
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
    type: "SERIES",
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
  if (minRating !== undefined) where.avgRating = { gte: minRating };
  if (language) where.language = language;

  let orderBy: Prisma.ContentOrderByWithRelationInput;
  switch (sort) {
    case "popular": orderBy = { totalViews: "desc" }; break;
    case "top-rated": orderBy = { avgRating: "desc" }; break;
    case "az": orderBy = { title: "asc" }; break;
    case "za": orderBy = { title: "desc" }; break;
    default: orderBy = { createdAt: "desc" };
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
        releaseYear: true,
        avgRating: true,
        language: true,
        country: true,
        genres: { select: { id: true, name: true, slug: true } },
        series: { select: { totalSeasons: true } },
      },
    }),
    prisma.content.count({ where }),
  ]);

  const series = contents.map((c) => ({
    id: c.id,
    title: c.title,
    slug: c.slug,
    posterUrl: c.posterUrl,
    releaseYear: c.releaseYear,
    avgRating: c.avgRating,
    language: c.language,
    country: c.country,
    totalSeasons: c.series?.totalSeasons ?? null,
    genres: c.genres,
  }));

  return {
    series,
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

export async function getSeriesGenres() {
  return prisma.genre.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });
}

export async function getSeriesLanguages() {
  const contents = await prisma.content.findMany({
    where: { type: "SERIES", status: "PUBLISHED" },
    select: { language: true },
    distinct: ["language"],
  });
  return contents
    .map((c) => c.language)
    .filter((l): l is string => Boolean(l))
    .sort();
}

export async function getSeriesYears() {
  const contents = await prisma.content.findMany({
    where: { type: "SERIES", status: "PUBLISHED" },
    select: { releaseYear: true },
    distinct: ["releaseYear"],
  });
  return contents
    .map((c) => c.releaseYear)
    .filter((y): y is number => Boolean(y))
    .sort((a, b) => b - a);
}

// ==================== Content Detail ====================

export interface EpisodeItem {
  id: string;
  episodeNum: number;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  duration: number | null;
  airDate: Date | null;
}

export interface SeasonItem {
  id: string;
  seasonNumber: number;
  title: string | null;
  description: string | null;
  posterUrl: string | null;
  releaseYear: number | null;
  episodes: EpisodeItem[];
}

export interface ContentDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: "MOVIE" | "DRAMA" | "SERIES" | "DOCUMENTARY" | "SHORT_FILM" | "TRAILER";
  releaseYear: number | null;
  language: string | null;
  country: string | null;
  duration: number | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  trailerUrl: string | null;
  avgRating: number | null;
  totalViews: number;
  totalRatings: number;
  genres: { id: string; name: string; slug: string }[];
  seasons?: SeasonItem[];
  totalSeasons?: number | null;
  related: {
    id: string;
    title: string;
    slug: string;
    posterUrl: string | null;
    releaseYear: number | null;
    avgRating: number | null;
  }[];
}

export async function getContentBySlug(
  slug: string
): Promise<ContentDetail | null> {
  const content = await prisma.content.findUnique({
    where: { slug },
    include: {
      genres: { select: { id: true, name: true, slug: true } },
      series: {
        include: {
          seasons: {
            orderBy: { seasonNumber: "asc" },
            include: {
              episodes: {
                orderBy: { episodeNum: "asc" },
                select: {
                  id: true,
                  episodeNum: true,
                  title: true,
                  description: true,
                  thumbnailUrl: true,
                  duration: true,
                  airDate: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!content || content.status !== "PUBLISHED") return null;

  // Related content (same genres)
  const genreIds = content.genres.map((g) => g.id);
  const related = await prisma.content.findMany({
    where: {
      status: "PUBLISHED",
      id: { not: content.id },
      genres: { some: { id: { in: genreIds } } },
    },
    take: 8,
    select: {
      id: true,
      title: true,
      slug: true,
      posterUrl: true,
      releaseYear: true,
      avgRating: true,
    },
  });

  return {
    id: content.id,
    title: content.title,
    slug: content.slug,
    description: content.description,
    type: content.type,
    releaseYear: content.releaseYear,
    language: content.language,
    country: content.country,
    duration: content.duration,
    posterUrl: content.posterUrl,
    backdropUrl: content.backdropUrl,
    trailerUrl: content.trailerUrl,
    avgRating: content.avgRating,
    totalViews: content.totalViews,
    totalRatings: content.totalRatings,
    genres: content.genres,
    totalSeasons: content.series?.totalSeasons ?? null,
    seasons: content.series
      ? content.series.seasons.map((s) => ({
          id: s.id,
          seasonNumber: s.seasonNumber,
          title: s.title,
          description: s.description,
          posterUrl: s.posterUrl,
          releaseYear: s.releaseYear,
          episodes: s.episodes,
        }))
      : undefined,
    related,
  };
}