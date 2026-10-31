import Link from "next/link";
import { Play, Star, TrendingUp, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { HeroSlider } from "@/components/layout/hero-slider";

export const revalidate = 60; // Cache for speed

function MovieCard({ item }: { item: any }) {
  return (
    <Link href={`/content/${item.slug}`} className="group relative flex-shrink-0 w-[160px] md:w-[220px] transition-all duration-300 hover:-translate-y-2">
      <div className="aspect-[2/3] rounded-xl overflow-hidden border border-white/10 shadow-2xl relative bg-zinc-900 group-hover:border-yellow-500/50 group-hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-all duration-300">
        {item.posterUrl ? (
          <img src={item.posterUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-600 font-bold">MALIX</div>
        )}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
          <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center transform scale-50 group-hover:scale-100 transition-transform duration-300 shadow-[0_0_15px_rgba(234,179,8,0.5)]">
            <Play size={20} className="fill-black text-black ml-1" />
          </div>
        </div>
        {item.avgRating > 0 && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-white/10 flex items-center gap-1">
            <Star size={10} className="text-yellow-500 fill-yellow-500" />
            <span className="text-xs font-bold text-white">{item.avgRating.toFixed(1)}</span>
          </div>
        )}
      </div>
      <div className="mt-3">
        <h3 className="text-sm md:text-base font-bold text-white truncate group-hover:text-yellow-500 transition-colors">{item.title}</h3>
        <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-2">
          <span>{item.releaseYear}</span>
          <span className="w-1 h-1 rounded-full bg-zinc-600" />
          <span className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-bold text-yellow-500">{item.quality || "HD"}</span>
        </p>
      </div>
    </Link>
  );
}

export default async function HomePage() {
  const [featuredMovies, trending, movies, series] = await Promise.all([
    // 👇 Yahan videoSources include kiya hai taake Hero Slider video play kar sake
    prisma.content.findMany({ 
      where: { status: "PUBLISHED", isFeatured: true, isComingSoon: false }, 
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { videoSources: { where: { isDefault: true }, take: 1 } } 
    }),
    prisma.content.findMany({ where: { status: "PUBLISHED", isComingSoon: false }, orderBy: { totalViews: "desc" }, take: 8 }),
    prisma.content.findMany({ where: { status: "PUBLISHED", type: "MOVIE", isComingSoon: false }, orderBy: { avgRating: "desc" }, take: 8 }),
    prisma.content.findMany({ where: { status: "PUBLISHED", type: "SERIES", isComingSoon: false }, orderBy: { avgRating: "desc" }, take: 8 }),
  ]);

  const sliderMovies = featuredMovies.length > 0 ? featuredMovies : trending.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-20 overflow-hidden font-sans">
      
      {/* ================= HERO SLIDER (NETFLIX STYLE) ================= */}
      <HeroSlider movies={sliderMovies} />

      {/* ================= CAROUSELS ================= */}
      <div className="relative z-20 max-w-[1400px] mx-auto px-4 md:px-8 -mt-12 space-y-12">
        {trending.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="text-yellow-500" size={26} />
                <h2 className="text-xl md:text-3xl font-bold text-white tracking-wide">Trending Now</h2>
              </div>
              <Link href="/movies" className="text-sm font-semibold text-yellow-500 hover:text-yellow-400 transition-colors">View All →</Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x">
              {trending.map((item) => <MovieCard key={item.id} item={item} />)}
            </div>
          </section>
        )}

        {movies.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="text-yellow-500" size={26} />
                <h2 className="text-xl md:text-3xl font-bold text-white tracking-wide">Popular Movies</h2>
              </div>
              <Link href="/movies" className="text-sm font-semibold text-yellow-500 hover:text-yellow-400 transition-colors">View All →</Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x">
              {movies.map((item) => <MovieCard key={item.id} item={item} />)}
            </div>
          </section>
        )}

        {series.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Star className="text-yellow-500 fill-yellow-500" size={26} />
                <h2 className="text-xl md:text-3xl font-bold text-white tracking-wide">Top Rated Series</h2>
              </div>
              <Link href="/series" className="text-sm font-semibold text-yellow-500 hover:text-yellow-400 transition-colors">View All →</Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x">
              {series.map((item) => <MovieCard key={item.id} item={item} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}