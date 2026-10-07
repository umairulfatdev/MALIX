"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";

interface Genre {
  id: string;
  name: string;
  slug: string;
}

interface DramaFiltersProps {
  genres: Genre[];
  countries: string[];
  languages: string[];
  years: number[];
  currentFilters: {
    search?: string;
    genres?: string[];
    country?: string;
    language?: string;
    year?: number;
    minRating?: number;
    sort?: string;
  };
}

export function DramaFilters({
  genres,
  countries,
  languages,
  years,
  currentFilters,
}: DramaFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(currentFilters.search || "");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== (currentFilters.search || "")) {
        updateParam("search", search || null);
      }
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/dramas?${params.toString()}`);
  }

  function toggleGenre(slug: string) {
    const current = currentFilters.genres || [];
    const updated = current.includes(slug)
      ? current.filter((g) => g !== slug)
      : [...current, slug];
    const params = new URLSearchParams(searchParams.toString());
    params.delete("genre");
    updated.forEach((g) => params.append("genre", g));
    params.delete("page");
    router.push(`/dramas?${params.toString()}`);
  }

  function clearAll() {
    setSearch("");
    router.push("/dramas");
  }

  const hasFilters =
    currentFilters.search ||
    (currentFilters.genres && currentFilters.genres.length > 0) ||
    currentFilters.country ||
    currentFilters.language ||
    currentFilters.year ||
    currentFilters.minRating ||
    (currentFilters.sort && currentFilters.sort !== "latest");

  return (
    <div className="space-y-4">
      {/* Top row */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dramas..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500/50 focus:bg-white/10 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10"
            >
              <X size={14} className="text-zinc-400" />
            </button>
          )}
        </div>

        {/* Sort */}
        <select
          value={currentFilters.sort || "latest"}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500/50 cursor-pointer"
        >
          <option value="latest" className="bg-zinc-900">Latest</option>
          <option value="popular" className="bg-zinc-900">Most Popular</option>
          <option value="top-rated" className="bg-zinc-900">Top Rated</option>
          <option value="az" className="bg-zinc-900">A → Z</option>
          <option value="za" className="bg-zinc-900">Z → A</option>
        </select>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white hover:bg-white/10 transition-all"
        >
          <SlidersHorizontal size={18} />
          <span>Filters</span>
          {currentFilters.genres && currentFilters.genres.length > 0 && (
            <span className="bg-yellow-500 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {currentFilters.genres.length}
            </span>
          )}
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-5 animate-fade-in">
          {/* Genres */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Genres</h4>
            <div className="flex flex-wrap gap-2">
              {genres.map((g) => {
                const active = (currentFilters.genres || []).includes(g.slug);
                return (
                  <button
                    key={g.id}
                    onClick={() => toggleGenre(g.slug)}
                    className={`px-3 py-1.5 text-sm rounded-full transition-all ${
                      active
                        ? "bg-yellow-500 text-black font-semibold"
                        : "bg-white/5 text-zinc-300 hover:bg-white/10 border border-white/10"
                    }`}
                  >
                    {g.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Country + Language + Year + Rating */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Country */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">Country</h4>
              <select
                value={currentFilters.country || ""}
                onChange={(e) => updateParam("country", e.target.value || null)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500/50"
              >
                <option value="" className="bg-zinc-900">All Countries</option>
                {countries.map((c) => (
                  <option key={c} value={c} className="bg-zinc-900">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Language */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">Language</h4>
              <select
                value={currentFilters.language || ""}
                onChange={(e) => updateParam("language", e.target.value || null)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500/50"
              >
                <option value="" className="bg-zinc-900">All Languages</option>
                {languages.map((l) => (
                  <option key={l} value={l} className="bg-zinc-900">
                    {l}
                  </option>
                ))}
              </select>
            </div>

            {/* Year */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">Year</h4>
              <select
                value={currentFilters.year || ""}
                onChange={(e) => updateParam("year", e.target.value || null)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500/50"
              >
                <option value="" className="bg-zinc-900">All Years</option>
                {years.map((y) => (
                  <option key={y} value={y} className="bg-zinc-900">
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Rating */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">Min Rating</h4>
              <select
                value={currentFilters.minRating || ""}
                onChange={(e) =>
                  updateParam("minRating", e.target.value || null)
                }
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500/50"
              >
                <option value="" className="bg-zinc-900">Any Rating</option>
                <option value="9" className="bg-zinc-900">9+ ⭐</option>
                <option value="8" className="bg-zinc-900">8+ ⭐</option>
                <option value="7" className="bg-zinc-900">7+ ⭐</option>
                <option value="6" className="bg-zinc-900">6+ ⭐</option>
              </select>
            </div>
          </div>

          {/* Clear all */}
          {hasFilters && (
            <button
              onClick={clearAll}
              className="text-sm text-yellow-500 hover:text-yellow-400 font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}