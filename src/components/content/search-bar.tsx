"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Star, Loader2 } from "lucide-react";
import { quickSearch } from "@/server/actions/search";

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  posterUrl: string | null;
  releaseYear: number | null;
  avgRating: number | null;
  type: string;
}

export function SearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      startTransition(async () => {
        const res = await quickSearch(query, 6);
        setResults(res);
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length < 2) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const typeLabel = (type: string) => {
    switch (type) {
      case "MOVIE":
        return "Movie";
      case "DRAMA":
        return "Drama";
      case "SERIES":
        return "Series";
      case "ANIME":
        return "Anime";
      default:
        return type;
    }
  };

  return (
    <div className="relative" ref={ref}>
      {/* Search input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-4 py-2 transition-all group focus-within:border-yellow-500/50 focus-within:bg-white/10 w-56 lg:w-72"
      >
        <Search
          size={16}
          className="text-zinc-500 group-focus-within:text-yellow-500 transition-colors flex-shrink-0"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search movies, series..."
          className="bg-transparent border-none outline-none text-sm text-white placeholder-zinc-500 w-full"
        />
        {isPending && (
          <Loader2 size={14} className="animate-spin text-yellow-500 flex-shrink-0" />
        )}
        {query && !isPending && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
            }}
            className="p-0.5 rounded-full hover:bg-white/10 flex-shrink-0"
          >
            <X size={12} className="text-zinc-500" />
          </button>
        )}
      </form>

      {/* Dropdown */}
      {open && (query.trim().length >= 2 || results.length > 0) && (
        <div className="absolute top-full right-0 mt-2 w-96 max-w-[90vw] glass-cosmic rounded-2xl shadow-2xl shadow-black/50 border border-yellow-500/20 overflow-hidden z-50">
          {isPending && results.length === 0 ? (
            <div className="p-6 text-center">
              <Loader2
                size={20}
                className="animate-spin text-yellow-500 mx-auto"
              />
            </div>
          ) : results.length === 0 ? (
            <div className="p-6 text-center">
              <Search size={24} className="text-zinc-600 mx-auto mb-2" />
              <p className="text-sm text-zinc-500">
                No results for &ldquo;{query}&rdquo;
              </p>
            </div>
          ) : (
            <>
              <div className="p-2">
                {results.map((item) => (
                  <Link
                    key={item.id}
                    href={`/content/${item.slug}`}
                    onClick={() => {
                      setOpen(false);
                      setQuery("");
                      setResults([]);
                    }}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition group"
                  >
                    <div className="w-10 h-14 rounded-lg bg-zinc-900 overflow-hidden flex-shrink-0">
                      {item.posterUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.posterUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[8px] text-zinc-700 font-bold">
                          MALIX
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white truncate group-hover:text-yellow-400 transition">
                        {item.title}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-500">
                        <span className="px-1.5 py-0.5 rounded bg-white/5 text-[10px]">
                          {typeLabel(item.type)}
                        </span>
                        {item.releaseYear && <span>{item.releaseYear}</span>}
                        {item.avgRating && item.avgRating > 0 && (
                          <span className="flex items-center gap-0.5 text-yellow-400">
                            <Star size={9} className="fill-yellow-400" />
                            {item.avgRating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <Link
                href={`/search?q=${encodeURIComponent(query)}`}
                onClick={() => setOpen(false)}
                className="block px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-yellow-400 hover:text-yellow-300 bg-yellow-500/5 hover:bg-yellow-500/10 border-t border-white/5 transition"
              >
                View all results →
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}