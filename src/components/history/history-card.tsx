"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Play, X, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { deleteHistoryItemAction } from "@/server/actions/history";

interface HistoryCardProps {
  item: {
    id: string;
    progress: number;
    position: number;
    duration: number;
    isCompleted: boolean;
    lastWatched: Date;
    content: {
      id: string;
      title: string;
      slug: string;
      posterUrl: string | null;
      releaseYear: number | null;
      avgRating: number | null;
      duration: number | null;
      type: string;
    };
  };
}

export function HistoryCard({ item }: HistoryCardProps) {
  const [isRemoved, setIsRemoved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const c = item.content;

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    startTransition(async () => {
      const result = await deleteHistoryItemAction(item.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setIsRemoved(true);
      toast.success("Removed from history");
      router.refresh();
    });
  };

  if (isRemoved) return null;

  // Time formatting
  const watchedSeconds = item.position;
  const totalSeconds = item.duration;
  const watchedMinutes = Math.floor(watchedSeconds / 60);
  const totalMinutes = Math.ceil(totalSeconds / 60);

  return (
    <Link href={`/watch/${c.slug}`} className="group block">
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 ring-1 ring-white/5 card-hover">
        {/* Poster */}
        {c.posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={c.posterUrl}
            alt={c.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-950 to-black">
            <span className="text-yellow-500/40 text-xs font-bold tracking-cinematic uppercase">
              MALIX
            </span>
          </div>
        )}

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Completed badge */}
        {item.isCompleted && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-emerald-600/90 backdrop-blur px-2 py-1 rounded-md">
            <CheckCircle2 size={10} className="text-white" />
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">
              Watched
            </span>
          </div>
        )}

        {/* Progress badge */}
        {!item.isCompleted && item.progress > 0 && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur px-2 py-1 rounded-md">
            <Clock size={10} className="text-yellow-400" />
            <span className="text-[10px] font-bold text-white">
              {Math.round(item.progress)}%
            </span>
          </div>
        )}

        {/* Remove button */}
        <button
          onClick={handleRemove}
          disabled={isPending}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 hover:bg-red-600/80 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 disabled:opacity-50 z-10"
          aria-label="Remove from history"
        >
          {isPending ? (
            <Loader2 size={14} className="animate-spin text-white" />
          ) : (
            <X size={16} className="text-white" />
          )}
        </button>

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 blur-xl opacity-70" />
            <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-600 flex items-center justify-center shadow-2xl shadow-yellow-500/50 group-hover:scale-110 transition-transform">
              <Play size={20} className="text-black fill-black ml-0.5" />
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {!item.isCompleted && item.progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-amber-600 shadow-[0_0_8px_rgba(251,191,36,0.8)]"
              style={{ width: `${Math.min(item.progress, 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-3 px-1">
        <h3 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-yellow-500 transition-colors leading-snug">
          {c.title}
        </h3>
        <div className="flex items-center gap-2 mt-1.5 text-xs text-zinc-500">
          {c.releaseYear && <span>{c.releaseYear}</span>}
          {!item.isCompleted && item.progress > 0 && (
            <>
              <span>•</span>
              <span className="text-yellow-500/70">
                {watchedMinutes}/{totalMinutes} min
              </span>
            </>
          )}
          {item.isCompleted && (
            <>
              <span>•</span>
              <span className="text-emerald-500/70">Completed</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}