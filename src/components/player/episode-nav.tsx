import Link from "next/link";
import { SkipBack, SkipForward, List } from "lucide-react";

interface EpisodeNavProps {
  slug: string;
  prevEpisodeId: string | null;
  nextEpisodeId: string | null;
  currentSeason?: number;
  currentEpisode?: number;
}

export function EpisodeNav({
  slug,
  prevEpisodeId,
  nextEpisodeId,
  currentSeason,
  currentEpisode,
}: EpisodeNavProps) {
  return (
    <div className="flex items-center justify-between gap-3 mt-4">
      {prevEpisodeId ? (
        <Link
          href={`/watch/${slug}?episode=${prevEpisodeId}`}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-yellow-500/40 transition-all text-sm font-medium"
        >
          <SkipBack size={16} />
          <span className="hidden sm:inline">Previous Episode</span>
          <span className="sm:hidden">Prev</span>
        </Link>
      ) : (
        <div />
      )}

      {currentSeason && currentEpisode && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30">
          <List size={14} className="text-yellow-500" />
          <span className="text-xs font-bold text-yellow-500">
            S{currentSeason} · E{currentEpisode}
          </span>
        </div>
      )}

      {nextEpisodeId ? (
        <Link
          href={`/watch/${slug}?episode=${nextEpisodeId}`}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-yellow-500 text-black hover:bg-yellow-400 transition-all text-sm font-bold"
        >
          <span className="hidden sm:inline">Next Episode</span>
          <span className="sm:hidden">Next</span>
          <SkipForward size={16} />
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}