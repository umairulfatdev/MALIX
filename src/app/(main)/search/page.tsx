import Link from "next/link";
import { Search, Film, Tv, Play, Sparkles, Compass } from "lucide-react";
import { globalSearch } from "@/server/actions/search";
import { ContentCard } from "@/components/content/content-card";

export const metadata = {
  title: "Search",
  description: "Search movies, dramas, series, and anime on MALIX",
};

interface Props {
  searchParams: Promise<{
    q?: string;
    type?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = params.q || "";
  const type = params.type || "ALL";
  const sort = params.sort || "relevance";
  const page = Math.max(1, parseInt(params.page || "1", 10));

  const result = await globalSearch({
    query,
    type,
    sort,
    page,
    perPage: 24,
  });

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-12">
      {/* Header */}
      <div className="mb-10">
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
              Search
            </span>
          </h1>
          <Search className="text-yellow-500/50" size={28} />
        </div>
        {query ? (
          <p className="text-zinc-400 ml-4">
            {result.total} result{result.total === 1 ? "" : "s"} for{" "}
            <span className="text-white font-semibold">
              &ldquo;{query}&rdquo;
            </span>
          </p>
        ) : (
          <p className="text-zinc-400 ml-4">
            Search across movies, dramas, series, and anime
          </p>
        )}
      </div>

      {/* No query yet */}
      {!query ? (
        <EmptySearch />
      ) : result.results.length === 0 ? (
        <NoResults query={query} />
      ) : (
        <>
          {/* Filters */}
          <div className="glass-cosmic rounded-2xl p-4 mb-8 flex flex-col md:flex-row gap-3">
            <div className="flex-1 flex flex-wrap gap-2">
              {["ALL", "MOVIE", "DRAMA", "SERIES", "ANIME"].map((t) => (
                <Link
                  key={t}
                  href={`/search?q=${encodeURIComponent(query)}&type=${t}${
                    sort !== "relevance" ? `&sort=${sort}` : ""
                  }`}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                    type === t
                      ? "bg-gradient-to-br from-yellow-400 to-amber-600 text-black"
                      : "bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10"
                  }`}
                >
                  {t === "ALL" ? "All" : t.toLowerCase()}
                </Link>
              ))}
            </div>

            <select
              value={sort}
              onChange={(e) => {
                window.location.href = `/search?q=${encodeURIComponent(
                  query
                )}&type=${type}&sort=${e.target.value}`;
              }}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-yellow-500/50 cursor-pointer"
            >
              <option value="relevance" className="bg-zinc-900">
                Most Relevant
              </option>
              <option value="latest" className="bg-zinc-900">
                Latest
              </option>
              <option value="rating" className="bg-zinc-900">
                Top Rated
              </option>
              <option value="popular" className="bg-zinc-900">
                Most Popular
              </option>
              <option value="az" className="bg-zinc-900">
                A → Z
              </option>
            </select>
          </div>

          {/* Results */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
            {result.results.map((item) => (
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

          {/* Pagination */}
          {result.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              {Array.from({ length: result.totalPages }, (_, i) => i + 1).map(
                (p) => {
                  const qs = new URLSearchParams();
                  qs.set("q", query);
                  if (type !== "ALL") qs.set("type", type);
                  if (sort !== "relevance") qs.set("sort", sort);
                  if (p > 1) qs.set("page", String(p));

                  return (
                    <Link
                      key={p}
                      href={`/search?${qs.toString()}`}
                      className={`min-w-[36px] h-9 flex items-center justify-center rounded-lg text-sm font-medium transition ${
                        p === result.page
                          ? "bg-gradient-to-br from-yellow-400 to-amber-600 text-black"
                          : "bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10"
                      }`}
                    >
                      {p}
                    </Link>
                  );
                }
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function EmptySearch() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-yellow-500/20 blur-2xl" />
        <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-yellow-300/20 via-yellow-500/20 to-amber-600/20 border border-yellow-500/30 flex items-center justify-center backdrop-blur">
          <Search size={40} className="text-yellow-500/70" />
        </div>
      </div>
      <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
        What are you looking for?
      </h3>
      <p className="text-zinc-400 text-sm md:text-base max-w-md mb-8">
        Search for movies, dramas, series, anime, and more. Use the search bar
        above to get started.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        {[
          { label: "Movies", href: "/movies", icon: Film },
          { label: "Dramas", href: "/dramas", icon: Tv },
          { label: "Series", href: "/series", icon: Play },
          { label: "Anime", href: "/anime", icon: Sparkles },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-zinc-300 hover:text-white transition"
          >
            <item.icon size={16} />
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function NoResults({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-red-500/20 blur-2xl" />
        <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-red-500/10 to-orange-600/10 border border-red-500/30 flex items-center justify-center backdrop-blur">
          <Search size={40} className="text-red-400/70" />
        </div>
      </div>
      <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
        No results found
      </h3>
      <p className="text-zinc-400 text-sm md:text-base max-w-md mb-8">
        We couldn&apos;t find anything for{" "}
        <span className="text-white font-semibold">&ldquo;{query}&rdquo;</span>.
        Try a different search term or explore our collection.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          href="/movies"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 text-black font-bold rounded-xl hover:shadow-lg hover:shadow-yellow-500/50 transition-all"
        >
          <Film size={16} />
          Browse Movies
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-white transition"
        >
          <Compass size={16} />
          Go Home
        </Link>
      </div>
    </div>
  );
}