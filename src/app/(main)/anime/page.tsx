import { Suspense } from "react";
import { Sparkles } from "lucide-react";
import {
  getAnime,
  getAllAnimeGenres,
  getAllAnimeLanguages,
  getAllAnimeYears,
} from "@/server/actions/anime";
import { ContentCard } from "@/components/content/content-card";
import { EmptyState } from "@/components/content/empty-state";
import { AnimeFilters } from "@/components/content/anime-filters";

type SortOption =
  | "latest"
  | "oldest"
  | "popular"
  | "rating"
  | "az"
  | "za"
  | "top-rated";

interface AnimePageProps {
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
  title: "Anime",
  description: "Browse all anime on MALIX",
};

export default async function AnimePage({ searchParams }: AnimePageProps) {
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

  const [animeResult, allGenres, allLanguages, allYears] = await Promise.all([
    getAnime({
      search,
      genres,
      year,
      minRating,
      language,
      sort,
      page,
      perPage: 20,
    }),
    getAllAnimeGenres(),
    getAllAnimeLanguages(),
    getAllAnimeYears(),
  ]);

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-1 h-8 bg-gradient-to-b from-yellow-400 to-amber-600 rounded-full shadow-lg shadow-yellow-500/50" />
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            <span
              style={{
                background:
                  "linear-gradient(135deg, #fde68a 0%, #fbbf24 50%, #f59e0b 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Anime
            </span>
          </h1>
          <Sparkles className="text-yellow-500/50" size={28} />
        </div>
        <p className="text-zinc-400 ml-4">
          Discover {animeResult.total} anime titles on MALIX
        </p>
      </div>

      <Suspense fallback={<div className="h-20" />}>
        <AnimeFilters
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

      <div className="mt-8">
        {animeResult.anime.length === 0 ? (
          <EmptyState
            title="No anime found"
            description="Try changing your search or filters to discover more."
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
            {animeResult.anime.map((item) => (
              <ContentCard
                key={item.id}
                href={`/content/${item.slug}`}
                title={item.title}
                posterUrl={item.posterUrl}
                year={item.releaseYear}
                rating={item.avgRating}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}