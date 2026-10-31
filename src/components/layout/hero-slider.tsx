"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Play, Info } from "lucide-react";

function getYouTubeId(url: string) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export function HeroSlider({ movies }: { movies: any[] }) {
  const [current, setCurrent] = useState(0);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false); // 👈 Track karne ke liye ke video load hui ya nahi

  useEffect(() => {
    if (movies.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % movies.length);
    }, 15000);
    return () => clearInterval(timer);
  }, [movies.length]);

  // Jab bhi slide change ho, toh video ka loading state reset kar dein
  useEffect(() => {
    setIsVideoLoaded(false);
  }, [current]);

  if (!movies || movies.length === 0) return null;

  const movie = movies[current];
  
  const videoUrl = movie.videoSources?.[0]?.url; 
  const youtubeId = getYouTubeId(movie.trailerUrl);
  const fallbackImage = movie.backdropUrl || movie.posterUrl || "https://image.tmdb.org/t/p/original/6XjMwQTvnICBz6TguiDKkDVHvgS.jpg";

  return (
    <div className="relative w-full h-[60vh] md:h-[85vh] bg-[#0a0a0a] overflow-hidden">
      
      {/* 1. BACKGROUND IMAGE (Yeh hamesha rahegi, video ke neeche) */}
      <img
        src={fallbackImage}
        alt={movie.title}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
          isVideoLoaded ? "opacity-0" : "opacity-60"
        }`}
      />

      {/* 2. MP4 VIDEO (Agar available ho) */}
      {videoUrl && videoUrl.includes(".mp4") && (
        <video
          key={movie.id}
          src={videoUrl}
          autoPlay
          muted
          loop
          playsInline
          onLoadedData={() => setIsVideoLoaded(true)} // 👈 Jab video play ke liye ready ho jaye
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            isVideoLoaded ? "opacity-60" : "opacity-0"
          }`}
        />
      )}

      {/* 3. YOUTUBE TRAILER (Agar available ho) */}
      {!videoUrl && youtubeId && (
        <div 
          className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-1000 ${
            isVideoLoaded ? "opacity-60" : "opacity-0"
          }`}
        >
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${youtubeId}&showinfo=0&rel=0&iv_load_policy=3`}
            className="absolute inset-0 w-full h-[120%] -top-[10%] scale-[1.3] md:scale-100 object-cover"
            allow="autoplay; encrypted-media"
            frameBorder="0"
            // YouTube iframe direct load event nahi deta, isliye hum thoda wait karke isko show karte hain
            onLoad={() => setTimeout(() => setIsVideoLoaded(true), 1500)}
          />
        </div>
      )}

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 w-full p-6 md:p-16 z-10 max-w-4xl">
        <h1 className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-lg line-clamp-2">
          {movie.title}
        </h1>
        <p className="text-sm md:text-base text-zinc-300 line-clamp-3 mb-8 drop-shadow-md max-w-2xl">
          {movie.description || "No description available."}
        </p>
        
        <div className="flex items-center gap-4">
          <Link href={`/watch/${movie.slug}`} className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg font-bold hover:bg-zinc-200 transition">
            <Play size={20} className="fill-black" /> Play Now
          </Link>
          <Link href={`/content/${movie.slug}`} className="flex items-center gap-2 bg-zinc-600/80 text-white px-6 py-3 rounded-lg font-bold hover:bg-zinc-600 transition">
            <Info size={20} /> More Info
          </Link>
        </div>
      </div>

    </div>
  );
}