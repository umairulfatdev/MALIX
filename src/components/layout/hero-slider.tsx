"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Play, Info, Volume2, VolumeX, ChevronLeft, ChevronRight } from "lucide-react";

interface SliderItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  backdropUrl: string | null;
  posterUrl: string | null;
  trailerUrl: string | null;
  releaseYear: number | null;
  quality: string | null;
}

export function HeroSlider({ movies }: { movies: SliderItem[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  // 👇 Auto-slide ab har 5 second me hoga
  useEffect(() => {
    if (movies.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 5000); // 5000 ms = 5 seconds
    return () => clearInterval(interval);
  }, [movies.length]);

  if (!movies || movies.length === 0) return null;

  const current = movies[currentIndex];

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % movies.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);

  const getVideoId = (url: string | null) => {
    if (!url) return null;
    let id = "";
    if (url.includes("youtu.be/")) id = url.split("youtu.be/")[1]?.split("?")[0];
    else if (url.includes("watch?v=")) id = url.split("watch?v=")[1]?.split("&")[0];
    else if (url.includes("embed/")) id = url.split("embed/")[1]?.split("?")[0];
    if (!id && url.trim().length === 11) id = url.trim();
    return id || null;
  };

  const videoId = getVideoId(current.trailerUrl);

  return (
    <div className="relative w-full h-[85vh] flex items-end pb-24 overflow-hidden bg-[#0a0a0a]">
      
      {/* 1. Background (Video ya Image) */}
      {videoId ? (
        <div className="absolute inset-0 w-full h-full scale-[1.35] pointer-events-none">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&loop=1&playlist=${videoId}&modestbranding=1&rel=0&showinfo=0`}
            className="w-full h-full object-cover opacity-70"
            allow="autoplay; encrypted-media"
          />
        </div>
      ) : current.backdropUrl || current.posterUrl ? (
        <img
          src={current.backdropUrl || current.posterUrl || ""}
          alt={current.title}
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
      ) : null}

      {/* 2. Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />

      {/* 3. Content */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-8 w-full">
        <div className="max-w-3xl transition-all duration-500">
          
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1 rounded-sm bg-yellow-500 text-black text-xs font-black uppercase tracking-widest shadow-[0_0_10px_rgba(234,179,8,0.5)]">
              Featured
            </span>
            <span className="text-sm font-semibold text-zinc-300 border border-white/20 px-2 py-0.5 rounded">
              {current.quality || "HD"}
            </span>
            <span className="text-sm font-semibold text-zinc-300">
              {current.releaseYear}
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight drop-shadow-2xl bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-zinc-400">
            {current.title}
          </h1>

          <p className="text-zinc-300 text-sm md:text-lg leading-relaxed mb-8 line-clamp-3 max-w-2xl text-shadow-md">
            {current.description}
          </p>

          <div className="flex items-center gap-4">
            <Link 
              href={`/watch/${current.slug}`} 
              className="flex items-center gap-2 px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-black rounded-xl transition-all hover:scale-105 shadow-[0_0_20px_rgba(234,179,8,0.4)]"
            >
              <Play size={22} className="fill-black" /> Watch Now
            </Link>
            <Link 
              href={`/content/${current.slug}`} 
              className="flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 font-bold rounded-xl transition-all"
            >
              <Info size={22} /> More Info
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Controls (Arrows, Dots, Mute) */}
      <div className="absolute bottom-10 right-10 z-20 flex items-center gap-4">
        <div className="flex items-center gap-2 mr-4">
          {movies.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? "bg-yellow-500 w-6" : "bg-white/30"}`}
            />
          ))}
        </div>
        
        {videoId && (
          <button onClick={() => setIsMuted(!isMuted)} className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center bg-black/30 backdrop-blur-md hover:bg-white/20 transition text-white">
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        )}
      </div>

      {/* Arrows */}
      {movies.length > 1 && (
        <>
          <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 border border-white/10 flex items-center justify-center hover:bg-yellow-500 hover:text-black text-white transition-all backdrop-blur-sm">
            <ChevronLeft size={24} />
          </button>
          <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 border border-white/10 flex items-center justify-center hover:bg-yellow-500 hover:text-black text-white transition-all backdrop-blur-sm">
            <ChevronRight size={24} />
          </button>
        </>
      )}
    </div>
  );
}