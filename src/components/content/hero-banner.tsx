import Link from "next/link";
import { Play, Info, Plus, Star, Sparkles } from "lucide-react";

interface HeroBannerProps {
  title: string;
  description: string;
  backdropUrl?: string | null;
  posterUrl?: string | null;
  year?: number | null;
  rating?: number | null;
  duration?: number | null;
  genres?: string[];
  slug: string;
  type: string;
}

export function HeroBanner({
  title,
  description,
  backdropUrl,
  year,
  rating,
  duration,
  genres = [],
  slug,
  type,
}: HeroBannerProps) {
  return (
    <section className="relative h-[90vh] min-h-[640px] mt-4">
      {/* ==================== BACKDROP ==================== */}
      <div className="absolute inset-0 overflow-hidden">
        {backdropUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={backdropUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full deep-space-bg relative overflow-hidden">
            {/* Rotating aurora ring */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1400px] h-[1400px] animate-aurora-ring">
  <div
    className="w-full h-full rounded-full opacity-50"
    style={{
      background: `conic-gradient(
        from 0deg,
        transparent 0deg,
        rgba(217, 119, 6, 0.5) 60deg,
        rgba(251, 191, 36, 0.6) 120deg,
        transparent 180deg,
        rgba(245, 158, 11, 0.6) 240deg,
        rgba(153, 87, 27, 0.5) 300deg,
        transparent 360deg
      )`,
      filter: "blur(60px)",
    }}
  />
</div>

            {/* Central glowing galaxy core */}
            <div
  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full animate-pulse-slow"
  style={{
    background: `radial-gradient(circle, 
      rgba(251, 191, 36, 0.7) 0%, 
      rgba(245, 158, 11, 0.5) 25%, 
      rgba(217, 119, 6, 0.4) 45%, 
      transparent 70%)`,
    filter: "blur(60px)",
  }}
/>

            {/* Secondary core */}
            <div
  className="absolute top-[45%] left-[55%] -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full animate-pulse-slow"
  style={{
    background: `radial-gradient(circle, 
      rgba(253, 230, 138, 0.6) 0%, 
      transparent 70%)`,
    filter: "blur(50px)",
    animationDelay: "2s",
  }}
/>

            {/* Drifting nebula clouds */}
            <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] nebula-purple animate-drift-nebula" />
            <div
              className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] nebula-pink animate-drift-nebula"
              style={{ animationDelay: "3s" }}
            />
            <div
              className="absolute top-1/3 right-1/3 w-[400px] h-[400px] nebula-red animate-drift-nebula"
              style={{ animationDelay: "6s" }}
            />

            {/* Orbital rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-cosmic-pink/20 animate-orbit-slow" />
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-cosmic-purple/15 animate-orbit-slow"
              style={{ animationDirection: "reverse", animationDuration: "40s" }}
            />

            {/* Orbiting dots */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] animate-orbit-slow">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_15px_5px_rgba(251,191,36,0.9)]" />
            </div>
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] animate-orbit-slow"
              style={{ animationDirection: "reverse", animationDuration: "40s" }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_12px_4px_rgba(217,119,6,0.9)]" />
            </div>
          </div>
        )}

        {/* ==================== GRADIENT OVERLAYS ==================== */}
        <div className="absolute inset-0 hero-cosmic-gradient" />
        <div className="absolute inset-0 hero-cosmic-side" />
      </div>

      {/* ==================== CONTENT ==================== */}
      <div className="relative h-full max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12 flex flex-col justify-end pb-20 md:pb-28">
        <div className="max-w-3xl animate-slide-up">
          {/* Featured badge */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2 glass-cosmic px-3 py-1.5 rounded-full border border-cosmic-pink/30">
              <Sparkles size={12} className="text-cosmic-pink animate-pulse" />
              <span className="text-xs font-bold tracking-cinematic uppercase text-cosmic-pink">
                Featured {type}
              </span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9] mb-6">
            <span className="text-cosmic-gradient">{title}</span>
          </h1>

          {/* Meta */}
          <div className="flex items-center flex-wrap gap-3 md:gap-4 mb-6 text-sm md:text-base">
            {rating && rating > 0 && (
              <div className="flex items-center gap-1.5 glass-cosmic px-2.5 py-1 rounded-lg border border-star-gold/30">
                <Star
                  size={14}
                  className="fill-star-gold text-star-gold"
                />
                <span className="font-bold text-white">
                  {rating.toFixed(1)}
                </span>
              </div>
            )}
            {year && (
              <span className="text-zinc-400 font-medium">{year}</span>
            )}
            {duration && (
              <span className="text-zinc-400 font-medium">
                {duration} min
              </span>
            )}
            {genres.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                {genres.slice(0, 3).map((g, i) => (
                  <span
                    key={i}
                    className="text-zinc-300 text-xs px-2 py-1 rounded-md bg-white/5 border border-cosmic-purple/30"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-base md:text-lg text-zinc-300 leading-relaxed mb-8 line-clamp-3 max-w-xl">
            {description}
          </p>

          {/* Actions */}
          <div className="flex items-center flex-wrap gap-3">
            <Link
              href={`/watch/${slug}`}
              className="btn-cosmic flex items-center gap-2 px-6 md:px-8 py-3 md:py-3.5 text-base font-bold"
            >
              <Play size={20} className="fill-white" />
              Watch Now
            </Link>
            <Link
              href={`/content/${slug}`}
              className="btn-cosmic-ghost flex items-center gap-2 px-6 md:px-8 py-3 md:py-3.5 text-base font-semibold"
            >
              <Info size={20} />
              More Info
            </Link>
            <button className="w-12 h-12 md:w-14 md:h-14 rounded-full btn-cosmic-ghost flex items-center justify-center group">
              <Plus
                size={22}
                className="text-white group-hover:text-cosmic-pink transition-colors"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-space-deep to-transparent pointer-events-none" />
    </section>
  );
}