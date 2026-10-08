import { Suspense } from "react";
import {
  getSeries,
  getSeriesGenres,
  getSeriesLanguages,
  getSeriesYears,
} from "@/server/actions/series";
import { ContentCard } from "@/components/content/content-card";
import { SeriesFilters } from "@/components/content/series-filters";
import { Pagination } from "@/components/content/pagination";
import { EmptyState } from "@/components/content/empty-state";

// ✅ Type define karein
type SortOption =
  | "latest"
  | "oldest"
  | "popular"
  | "rating"
  | "az"
  | "za"
  | "top-rated";

interface SeriesPageProps {
  searchParams: Promise<{
    search?: string;
    genre?: string | string[];
    year?: string;
    minRating?: string;
    language?: string;
    sort?: string;
    page?: string;
  }>;
}

export const metadata = {
  title: "Series",
  description: "Browse all series on MALIX",
};

export default async function SeriesPage({ searchParams }: SeriesPageProps) {
  const params = await searchParams;

  const search = params.search || "";
  const genres = Array.isArray(params.genre)
    ? params.genre
    : params.genre
      ? [params.genre]
      : [];
  const year = params.year ? parseInt(params.year) : undefined;
  const minRating = params.minRating ? parseInt(params.minRating) : undefined;
  const language = params.language || undefined;

  // ✅ Type-safe sort mapping
  const sortMap: Record<string, SortOption> = {
    latest: "latest",
    oldest: "oldest",
    popular: "popular",
    rating: "rating",
    "top-rated": "top-rated",
    az: "az",
    za: "za",
  };
  const rawSort = params.sort || "latest";
  const sort: SortOption = sortMap[rawSort] || "latest";

  const page = params.page ? parseInt(params.page) : 1;

  const [seriesResult, allGenres, allLanguages, allYears] = await Promise.all([
    getSeries({
      search,
      genres,
      year,
      minRating,
      language,
      sort,
      page,
      perPage: 20,
    }),
    getSeriesGenres(),
    getSeriesLanguages(),
    getSeriesYears(),
  ]);

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">
          <span
            style={{
              background:
                "linear-gradient(135deg, #fde68a 0%, #fbbf24 50%, #f59e0b 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Series
          </span>
        </h1>
        <p className="text-zinc-400">
          Discover {seriesResult.total} series on MALIX
        </p>
      </div>

      <Suspense fallback={<div className="h-20" />}>
        <SeriesFilters
          genres={allGenres}
          languages={allLanguages}
          years={allYears}
          currentFilters={{ search, genres, year, minRating, language, sort }}
        />
      </Suspense>

      <div className="mt-8">
        {seriesResult.series.length === 0 ? (
          <EmptyState
            title="No series found"
            description="Try changing your search or filters to discover more."
          />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
              {seriesResult.series.map((s) => (
                <ContentCard
                  key={s.id}
                  href={`/content/${s.slug}`}
                  title={s.title}
                  posterUrl={s.posterUrl}
                  year={s.releaseYear}
                  rating={s.avgRating}
                />
              ))}
            </div>

            <Suspense fallback={null}>
              <Pagination
                currentPage={seriesResult.page}
                totalPages={seriesResult.totalPages}
              />
            </Suspense>
          </>
        )}
      </div>
    </div>
  );
}