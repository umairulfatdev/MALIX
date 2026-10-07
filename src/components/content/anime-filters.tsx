"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, X, Filter, SlidersHorizontal } from "lucide-react";

interface FilterOptions {
  genres: { id: string; name: string; slug: string }[];
  languages: string[];
  years: number[];
}

interface CurrentFilters {
  search?: string;
  genres?: string[];
  year?: number;
  minRating?: number;
  language?: string;
  sort?: string;
}

interface AnimeFiltersProps {
  genres: { id: string; name: string; slug: string }[];
  languages: string[];
  years: number[];
  currentFilters: CurrentFilters;
}

export function AnimeFilters({
  genres,
  languages,
  years,
  currentFilters,
}: AnimeFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [searchInput, setSearchInput] = useState(currentFilters.search || "");
  const currentGenre = currentFilters.genres?.[0] || "";
  const currentYear = currentFilters.year?.toString() || "";
  const currentRating = currentFilters.minRating?.toString() || "";
  const currentLanguage = currentFilters.language || "";
  const currentSort = currentFilters.sort || "latest";

  const updateURL = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    params.delete("page");

    startTransition(() => {
      router.push(`/anime?${params.toString()}`);
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateURL({ search: searchInput || null });
  };

  const clearAll = () => {
    setSearchInput("");
    startTransition(() => {
      router.push("/anime");
    });
  };

  const hasFilters =
    currentFilters.search ||
    currentGenre ||
    currentYear ||
    currentRating ||
    currentLanguage ||
    (currentSort && currentSort !== "latest");

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
          />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search anime..."
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500/60 focus:bg-white/10 transition"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                updateURL({ search: null });
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10"
            >
              <X size={14} className="text-zinc-400" />
            </button>
          )}
        </form>

        <select
          value={currentSort}
          onChange={(e) => updateURL({ sort: e.target.value })}
          className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-500/60 transition min-w-[160px] cursor-pointer"
        >
          <option value="latest" className="bg-zinc-900">Latest</option>
          <option value="oldest" className="bg-zinc-900">Oldest</option>
          <option value="popular" className="bg-zinc-900">Most Popular</option>
          <option value="rating" className="bg-zinc-900">Highest Rated</option>
          <option value="az" className="bg-zinc-900">A → Z</option>
          <option value="za" className="bg-zinc-900">Z → A</option>
        </select>

        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="md:hidden flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white text-sm transition"
        >
          <Filter size={16} />
          Filters
          {hasFilters && (
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
          )}
        </button>
      </div>

      {/* Filters Panel */}
      <div
        className={`${
          showMobileFilters ? "block" : "hidden"
        } md:block glass-cosmic rounded-xl p-4 md:p-5`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-yellow-500" />
            <h3 className="text-sm font-bold text-white tracking-wide uppercase">
              Filters
            </h3>
          </div>
          {hasFilters && (
            <button
              onClick={clearAll}
              className="text-xs text-yellow-500 hover:text-yellow-400 font-medium flex items-center gap-1"
            >
              <X size={12} />
              Clear all
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Genre */}
          <div>
            <label className="text-xs text-zinc-400 block mb-1.5 uppercase tracking-wider">
              Genre
            </label>
            <select
              value={currentGenre}
              onChange={(e) => updateURL({ genre: e.target.value || null })}
              className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500/60 cursor-pointer"
            >
              <option value="">All Genres</option>
              {genres.map((g) => (
                <option key={g.id} value={g.slug}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="text-xs text-zinc-400 block mb-1.5 uppercase tracking-wider">
              Year
            </label>
            <select
              value={currentYear}
              onChange={(e) => updateURL({ year: e.target.value || null })}
              className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500/60 cursor-pointer"
            >
              <option value="">All Years</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Rating */}
          <div>
            <label className="text-xs text-zinc-400 block mb-1.5 uppercase tracking-wider">
              Rating
            </label>
            <select
              value={currentRating}
              onChange={(e) =>
                updateURL({ minRating: e.target.value || null })
              }
              className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500/60 cursor-pointer"
            >
              <option value="">Any Rating</option>
              <option value="9">9+ ⭐</option>
              <option value="8">8+ ⭐</option>
              <option value="7">7+ ⭐</option>
              <option value="6">6+ ⭐</option>
            </select>
          </div>

          {/* Language */}
          <div>
            <label className="text-xs text-zinc-400 block mb-1.5 uppercase tracking-wider">
              Language
            </label>
            <select
              value={currentLanguage}
              onChange={(e) => updateURL({ language: e.target.value || null })}
              className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500/60 cursor-pointer"
            >
              <option value="">All Languages</option>
              {languages.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isPending && (
        <div className="h-0.5 rounded-full bg-white/5 overflow-hidden">
          <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-yellow-500 to-transparent animate-marquee" />
        </div>
      )}
    </div>
  );
}