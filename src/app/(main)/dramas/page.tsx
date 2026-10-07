import { Suspense } from "react";
import {
  getDramas,
  getDramaCountries,
  getDramaLanguages,
  getDramaYears,
  getDramaGenres,
} from "@/server/actions/dramas";
import { ContentCard } from "@/components/content/content-card";
import { DramaFilters } from "@/components/content/drama-filters";
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

interface DramasPageProps {
  searchParams: Promise<{
    search?: string;
    genre?: string | string[];
    country?: string;
    language?: string;
    year?: string;
    minRating?: string;
    sort?: string;
    page?: string;
  }>;
}

export const metadata = {
  title: "Dramas",
  description: "Browse all dramas on MALIX",
};

export default async function DramasPage({ searchParams }: DramasPageProps) {
  // ✅ Await searchParams — Next.js 15 requirement
  const params = await searchParams;

  const search = params.search || "";
  const genres = Array.isArray(params.genre)
    ? params.genre
    : params.genre
      ? [params.genre]
      : [];
  const country = params.country || undefined;
  const language = params.language || undefined;
  const year = params.year ? parseInt(params.year) : undefined;
  const minRating = params.minRating ? parseInt(params.minRating) : undefined;
  // ✅ Type-safe cast (no 'any')
  const sort = (params.sort as SortOption) || "latest";
  const page = params.page ? parseInt(params.page) : 1;

  const [dramasResult, countries, languages, years, allGenres] =
    await Promise.all([
      getDramas({
        search,
        genres,
        country,
        language,
        year,
        minRating,
        sort,
        page,
        perPage: 20,
      }),
      getDramaCountries(),
      getDramaLanguages(),
      getDramaYears(),
      getDramaGenres(),
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
            Dramas
          </span>
        </h1>
        <p className="text-zinc-400">
          Discover {dramasResult.total} dramas from around the world
        </p>
      </div>

      {/* Filters */}
      <Suspense fallback={<div className="h-20" />}>
        <DramaFilters
          genres={allGenres}
          countries={countries}
          languages={languages}
          years={years}
          currentFilters={{
            search,
            genres,
            country,
            language,
            year,
            minRating,
            sort,
          }}
        />
      </Suspense>

      {/* Results */}
      <div className="mt-8">
        {dramasResult.dramas.length === 0 ? (
          <EmptyState
            title="No dramas found"
            description="Try changing your search or filters to discover more."
          />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
              {dramasResult.dramas.map((drama) => (
                <ContentCard
                  key={drama.id}
                  href={`/content/${drama.slug}`}
                  title={drama.title}
                  posterUrl={drama.posterUrl}
                  year={drama.releaseYear}
                  rating={drama.avgRating}
                />
              ))}
            </div>

            {/* Pagination */}
            <Suspense fallback={null}>
              <Pagination
                currentPage={dramasResult.page}
                totalPages={dramasResult.totalPages}
              />
            </Suspense>
          </>
        )}
      </div>
    </div>
  );
}