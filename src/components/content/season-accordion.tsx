"use client";

import { useState } from "react";
import { ChevronDown, Play, Clock } from "lucide-react";

interface Episode {
  id: string;
  episodeNum: number;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  duration: number | null;
}

interface Season {
  id: string;
  seasonNumber: number;
  title: string | null;
  description: string | null;
  releaseYear: number | null;
  episodes: Episode[];
}

interface SeasonAccordionProps {
  seasons: Season[];
  contentSlug: string;
}

export function SeasonAccordion({ seasons, contentSlug }: SeasonAccordionProps) {
  const [openSeasonId, setOpenSeasonId] = useState<string | null>(
    seasons[0]?.id ?? null
  );

  return (
    <div className="space-y-4">
      {seasons.map((season) => {
        const isOpen = openSeasonId === season.id;
        return (
          <div
            key={season.id}
            className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all"
          >
            {/* Header */}
            <button
              onClick={() => setOpenSeasonId(isOpen ? null : season.id)}
              className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-4 text-left">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-black font-black text-lg">
                  S{season.seasonNumber}
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-white">
                    {season.title || `Season ${season.seasonNumber}`}
                  </h3>
                  <p className="text-sm text-zinc-500">
                    {season.episodes.length} episodes
                    {season.releaseYear && ` • ${season.releaseYear}`}
                  </p>
                </div>
              </div>
              <ChevronDown
                size={22}
                className={`text-zinc-400 transition-transform duration-300 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Episodes */}
            {isOpen && (
              <div className="border-t border-white/5 p-4 md:p-5 space-y-3 animate-fade-in">
                {season.episodes.map((ep) => (
                  <a
                    key={ep.id}
                    href={`/watch/${contentSlug}?episode=${ep.id}`}
                    className="flex items-center gap-4 p-3 md:p-4 rounded-xl bg-white/[0.02] hover:bg-white/10 border border-transparent hover:border-yellow-500/30 transition-all group"
                  >
                    {/* Episode number / thumbnail */}
                    <div className="relative w-32 md:w-44 aspect-video rounded-lg overflow-hidden bg-black/40 flex-shrink-0">
                      {ep.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={ep.thumbnailUrl}
                          alt={ep.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                          <span className="text-3xl font-black text-zinc-700">
                            {ep.episodeNum}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center shadow-lg shadow-yellow-500/50">
                          <Play size={16} className="text-black fill-black ml-0.5" />
                        </div>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-yellow-500">
                          E{ep.episodeNum}
                        </span>
                        {ep.duration && (
                          <span className="text-xs text-zinc-500 flex items-center gap-1">
                            <Clock size={10} /> {ep.duration} min
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm md:text-base font-semibold text-white line-clamp-1 group-hover:text-yellow-500 transition-colors">
                        {ep.title}
                      </h4>
                      {ep.description && (
                        <p className="text-xs md:text-sm text-zinc-500 line-clamp-2 mt-1">
                          {ep.description}
                        </p>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}