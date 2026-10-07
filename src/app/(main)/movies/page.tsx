import { Suspense } from "react";
import {
  getMovies,
  getAllGenres,
  getAllLanguages,
  getAllYears,
} from "@/server/actions/content";
import { ContentCard } from "@/components/content/content-card";
import { MovieFilters } from "@/components/content/movie-filters";
import { Pagination } from "@/components/content/pagination";
import { EmptyState } from "@/components/content/empty-state";

// ✅ Type define karein — koi 'any' nahi
type SortOption =
  | "latest"
  | "oldest"
  | "popular"
  | "rating"
  | "az"
  | "za";

interface MoviesPageProps {
  // ✅ Next.js 15: searchParams is now a Promise
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
  title: "Movies",
  description: "Browse all movies on MALIX",
};

export default async function MoviesPage({ searchParams }: MoviesPageProps) {
  // ✅ Await searchParams — Next.js 15 requirement
  const params = await searchParams;

  // Parse search params
  const search = params.search || "";
  const genres = Array.isArray(params.genre)
    ? params.genre
    : params.genre
      ? [params.genre]
      : [];
  const year = params.year ? parseInt(params.year) : undefined;
  const minRating = params.minRating ? parseInt(params.minRating) : undefined;
  const language = params.language || undefined;
  // ✅ Type-safe cast (no 'any')
  const sort = (params.sort as SortOption) || "latest";
  const page = params.page ? parseInt(params.page) : 1;

  // Fetch data (server-side, in parallel)
  const [moviesResult, allGenres, allLanguages, allYears] = await Promise.all([
    getMovies({
      search,
      genres,
      year,
      minRating,
      language,
      sort,
      page,
      perPage: 20,
    }),
    getAllGenres(),
    getAllLanguages(),
    getAllYears(),
  ]);

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-12">
      {/* Header */}
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
            Movies
          </span>
        </h1>
        <p className="text-zinc-400">
          Discover {moviesResult.total} movies in the MALIX galaxy
        </p>
      </div>

      {/* Filters */}
      <Suspense fallback={<div className="h-20" />}>
        <MovieFilters
          genres={allGenres}
          languages={allLanguages}
          years={allYears}
          currentFilters={{
            search,
            genres,
            year,
            minRating,
            language,
            sort,
          }}
        />
      </Suspense>

      {/* Results */}
      <div className="mt-8">
        {moviesResult.movies.length === 0 ? (
          <EmptyState
            title="No movies found"
            description="Try changing your search or filters to discover more."
          />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
              {moviesResult.movies.map((movie) => (
                <ContentCard
                  key={movie.id}
                  href={`/content/${movie.slug}`}
                  title={movie.title}
                  posterUrl={movie.posterUrl}
                  year={movie.releaseYear}
                  rating={movie.avgRating}
                />
              ))}
            </div>

            {/* Pagination */}
            <Suspense fallback={null}>
              <Pagination
                currentPage={moviesResult.page}
                totalPages={moviesResult.totalPages}
              />
            </Suspense>
          </>
        )}
      </div>
    </div>
  );
}