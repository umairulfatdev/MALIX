"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Play, X, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { removeFromContinueWatchingAction } from "@/server/actions/progress";

interface ContinueWatchingCardProps {
  item: {
    id: string;
    progress: number;
    position: number;
    duration: number;
    content: {
      id: string;
      title: string;
      slug: string;
      posterUrl: string | null;
      backdropUrl: string | null;
      releaseYear: number | null;
      avgRating: number | null;
      duration: number | null;
      type: string;
    };
  };
}

export function ContinueWatchingCard({ item }: ContinueWatchingCardProps) {
  const [isRemoved, setIsRemoved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const c = item.content;

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    startTransition(async () => {
      const result = await removeFromContinueWatchingAction(item.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setIsRemoved(true);
      toast.success("Removed from Continue Watching");
      router.refresh();
    });
  };

  if (isRemoved) return null;

  // Format remaining time
  const remainingSeconds = item.duration - item.position;
  const minutesLeft = Math.max(1, Math.ceil(remainingSeconds / 60));

  return (
    <Link href={`/watch/${c.slug}`} className="group block">
      <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-900 ring-1 ring-white/5 card-hover">
        {/* Backdrop / Poster */}
        {c.backdropUrl || c.posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={c.backdropUrl || c.posterUrl || ""}
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 blur-xl opacity-80" />
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-600 flex items-center justify-center shadow-2xl shadow-yellow-500/50 group-hover:scale-110 transition-transform">
              <Play size={24} className="text-black fill-black ml-1" />
            </div>
          </div>
        </div>

        {/* Remove button */}
        <button
          onClick={handleRemove}
          disabled={isPending}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/70 hover:bg-red-600/80 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 disabled:opacity-50 z-10"
          aria-label="Remove from Continue Watching"
        >
          {isPending ? (
            <Loader2 size={14} className="animate-spin text-white" />
          ) : (
            <X size={16} className="text-white" />
          )}
        </button>

        {/* Info at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-sm font-bold text-white mb-1 line-clamp-1">
            {c.title}
          </h3>

          <div className="flex items-center gap-2 text-xs text-zinc-300 mb-2">
            <Clock size={11} />
            <span>{minutesLeft} min left</span>
          </div>

          {/* Progress bar */}
          <div className="relative h-1 rounded-full bg-white/20 overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-400 to-amber-600 shadow-[0_0_10px_rgba(251,191,36,0.8)]"
              style={{ width: `${Math.min(item.progress, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}