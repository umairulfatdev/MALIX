"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Star, Clock, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { removeFromWatchlist } from "@/server/actions/watchlist";

interface WatchlistCardProps {
  item: {
    id: string;
    content: {
      id: string;
      title: string;
      slug: string;
      posterUrl: string | null;
      releaseYear: number | null;
      avgRating: number | null;
      duration: number | null;
      type: string;
      genres: { id: string; name: string }[];
    };
  };
}

export function WatchlistCard({ item }: WatchlistCardProps) {
  const [isRemoved, setIsRemoved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const c = item.content;

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    startTransition(async () => {
      const result = await removeFromWatchlist(c.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setIsRemoved(true);
      toast.success("Removed from watchlist");
    });
  };

  if (isRemoved) {
    return null;
  }

  return (
    <Link
      href={`/content/${c.slug}`}
      className="group relative block"
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 ring-1 ring-white/5 transition-all duration-400 group-hover:ring-yellow-500/40 group-hover:shadow-2xl group-hover:shadow-yellow-500/20 group-hover:-translate-y-2">
        {c.posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={c.posterUrl}
            alt={c.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-950 to-black relative">
            <div className="absolute top-1/4 left-1/4 w-16 h-16 nebula-purple" />
            <div className="absolute bottom-1/4 right-1/4 w-12 h-12 nebula-pink" />
            <span className="relative text-yellow-500/50 text-xs font-bold tracking-cinematic uppercase">
              MALIX
            </span>
          </div>
        )}

        {/* Rating badge */}
        {c.avgRating && c.avgRating > 0 && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur px-2 py-1 rounded-md">
            <Star size={11} className="fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-bold text-white">
              {c.avgRating.toFixed(1)}
            </span>
          </div>
        )}

        {/* Remove button */}
        <button
          onClick={handleRemove}
          disabled={isPending}
          aria-label="Remove from watchlist"
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 hover:bg-red-600/80 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 size={14} className="animate-spin text-white" />
          ) : (
            <X size={16} className="text-white" />
          )}
        </button>

        {/* Duration */}
        {c.duration && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur px-2 py-1 rounded-md">
            <Clock size={10} className="text-zinc-300" />
            <span className="text-xs text-zinc-300">{c.duration}m</span>
          </div>
        )}

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 blur-xl opacity-60" />
            <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-yellow-300 to-amber-600 flex items-center justify-center shadow-2xl shadow-yellow-500/50 group-hover:scale-110 transition-transform">
              <svg
                className="w-5 h-5 text-black ml-0.5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="mt-3 px-1">
        <h3 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-yellow-500 transition-colors leading-snug">
          {c.title}
        </h3>
        <div className="flex items-center gap-2 mt-1.5">
          {c.releaseYear && (
            <span className="text-xs text-zinc-500">{c.releaseYear}</span>
          )}
          {c.genres.length > 0 && (
            <>
              <span className="text-zinc-700">•</span>
              <span className="text-xs text-zinc-500 truncate">
                {c.genres[0].name}
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}