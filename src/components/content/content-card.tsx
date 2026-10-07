import Link from "next/link";
import { Star } from "lucide-react";

interface ContentCardProps {
  href: string;
  title: string;
  posterUrl?: string | null;
  year?: number | null;
  rating?: number | null;
  progress?: number;
  numberBadge?: number;
}

export function ContentCard({
  href,
  title,
  posterUrl,
  year,
  rating,
  progress,
  numberBadge,
}: ContentCardProps) {
  return (
    <Link href={href} className="group block relative">
      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-space-card ring-1 ring-cosmic-purple/20 card-cosmic">
        {posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={posterUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-space-card via-space-dark to-space-deep relative">
            {/* Cosmic placeholder */}
            <div className="absolute inset-0 opacity-40">
              <div className="absolute top-1/4 left-1/4 w-20 h-20 nebula-purple" />
              <div className="absolute bottom-1/4 right-1/4 w-16 h-16 nebula-pink" />
            </div>
            <span className="relative text-cosmic-pink/60 text-xs font-bold tracking-cinematic uppercase">
              MALIX
            </span>
          </div>
        )}

        {/* Bottom fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-space-deep/95 via-space-deep/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Rating */}
        {rating !== undefined && rating !== null && rating > 0 && (
          <div className="absolute top-2.5 right-2.5 glass-cosmic px-2 py-1 rounded-lg flex items-center gap-1 backdrop-blur-xl">
            <Star size={11} className="fill-star-gold text-star-gold" />
            <span className="text-xs font-semibold text-white">
              {rating.toFixed(1)}
            </span>
          </div>
        )}

        {/* Number Badge */}
        {numberBadge && (
          <div className="absolute -left-2 -bottom-3 top-10-cosmic select-none pointer-events-none">
            {numberBadge}
          </div>
        )}

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cosmic-red to-cosmic-purple blur-xl opacity-70" />
            <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-cosmic-red via-cosmic-pink to-cosmic-purple flex items-center justify-center shadow-2xl shadow-cosmic-pink/50 group-hover:scale-110 transition-transform">
              <svg
                className="w-5 h-5 text-white ml-0.5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {progress !== undefined && progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-cosmic-pink to-cosmic-purple"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        )}
      </div>

      <div className="mt-3 px-1">
        <h3 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-cosmic-pink transition-colors leading-snug">
          {title}
        </h3>
        {year && (
          <p className="text-xs text-zinc-500 mt-1 tracking-wider">{year}</p>
        )}
      </div>
    </Link>
  );
}