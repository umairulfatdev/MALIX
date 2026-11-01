"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Play, Info, ChevronLeft, ChevronRight } from "lucide-react";

function getYouTubeId(url: string) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export function HeroSlider({ movies }: { movies: any[] }) {
  const [current, setCurrent] = useState(0);
  const [isVideoReady, setIsVideoReady] = useState(false);

  useEffect(() => {
    if (movies.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % movies.length);
    }, 15000);
    return () => clearInterval(timer);
  }, [movies.length]);

  useEffect(() => {
    setIsVideoReady(false);
  }, [current]);

  if (!movies || movies.length === 0) return null;

  const movie = movies[current];
  const videoUrl = movie.videoSources?.[0]?.url; 
  const youtubeId = getYouTubeId(movie.trailerUrl);
  const fallbackImage = movie.backdropUrl || movie.posterUrl || "https://image.tmdb.org/t/p/original/6XjMwQTvnICBz6TguiDKkDVHvgS.jpg";

  const nextSlide = () => setCurrent((prev) => (prev + 1) % movies.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + movies.length) % movies.length);

  return (
    <div className="relative w-full h-[60vh] md:h-[85vh] bg-[#0a0a0a] overflow-hidden group">
      
      {/* 1. BACKGROUND IMAGE */}
      <img
        src={fallbackImage}
        alt={movie.title}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 z-0 ${
          isVideoReady ? "opacity-0" : "opacity-60"
        }`}
        onError={(e: any) => {
          e.target.src = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2025&auto=format&fit=crop";
        }}
      />

      {/* 2. MP4 VIDEO */}
      {videoUrl && videoUrl.includes(".mp4") && (
        <video
          key={movie.id}
          src={videoUrl}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onCanPlay={() => setIsVideoReady(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 z-0 ${
            isVideoReady ? "opacity-60" : "opacity-0"
          }`}
        />
      )}

      {/* 3. YOUTUBE TRAILER */}
      {!videoUrl && youtubeId && (
        <div 
          className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-1000 z-0 ${
            isVideoReady ? "opacity-60" : "opacity-0"
          }`}
        >
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${youtubeId}&rel=0&showinfo=0&iv_load_policy=3&modestbranding=1`}
            className="absolute inset-0 w-full h-[120%] -top-[10%] scale-[1.3] md:scale-100 object-cover"
            allow="autoplay; encrypted-media"
            frameBorder="0"
            onLoad={() => setTimeout(() => setIsVideoReady(true), 1000)}
          />
        </div>
      )}

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/30 to-transparent z-10" />

      {/* 👇 MANUAL SLIDER BUTTONS (Yahan z-index sabse zyada hai) 👇 */}
      {movies.length > 1 && (
        <>
          <button 
            onClick={prevSlide} 
            className="absolute left-4 top-1/2 -translate-y-1/2 z-[100] w-12 h-12 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-yellow-500 hover:text-black hover:scale-110 shadow-lg"
          >
            <ChevronLeft size={30} />
          </button>
          
          <button 
            onClick={nextSlide} 
            className="absolute right-4 top-1/2 -translate-y-1/2 z-[100] w-12 h-12 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-yellow-500 hover:text-black hover:scale-110 shadow-lg"
          >
            <ChevronRight size={30} />
          </button>
        </>
      )}

      {/* Content */}
      <div className="absolute bottom-0 left-0 w-full p-6 md:p-16 z-20 max-w-4xl">
        <h1 className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-lg line-clamp-2">
          {movie.title}
        </h1>
        <p className="text-sm md:text-base text-zinc-300 line-clamp-3 mb-8 drop-shadow-md max-w-2xl">
          {movie.description || "No description available."}
        </p>
        
        <div className="flex items-center gap-4">
          <Link href={`/watch/${movie.slug}`} className="flex items-center gap-2 bg-yellow-500 text-black px-8 py-3 rounded-lg font-bold hover:bg-yellow-400 transition shadow-[0_0_15px_rgba(234,179,8,0.4)]">
            <Play size={20} className="fill-black" /> Play Now
          </Link>
          <Link href={`/content/${movie.slug}`} className="flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-lg font-bold border border-white/20 hover:bg-white/20 transition">
            <Info size={20} /> More Info
          </Link>
        </div>
      </div>

    </div>
  );
}