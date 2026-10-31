"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Play, Info } from "lucide-react";

// YouTube URL se ID nikaalne ka function
function getYouTubeId(url: string) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export function HeroSlider({ movies }: { movies: any[] }) {
  const [current, setCurrent] = useState(0);

  // Slider Change Timer
  useEffect(() => {
    if (movies.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % movies.length);
    }, 15000); // 15 seconds
    return () => clearInterval(timer);
  }, [movies.length]);

  if (!movies || movies.length === 0) return null;

  const movie = movies[current];
  
  // Check karein ke video source kya hai
  const videoUrl = movie.videoSources?.[0]?.url; 
  const youtubeId = getYouTubeId(movie.trailerUrl);
  
  // Background Image (Agar video na ho toh yeh dikhegi)
  const fallbackImage = movie.backdropUrl || movie.posterUrl || "https://image.tmdb.org/t/p/original/6XjMwQTvnICBz6TguiDKkDVHvgS.jpg"; // Ek default dark image

  return (
    <div className="relative w-full h-[60vh] md:h-[85vh] bg-[#0a0a0a] overflow-hidden">
      
      {/* 1. AGAR MP4 VIDEO HAI */}
      {videoUrl && videoUrl.includes(".mp4") ? (
        <video
          key={movie.id}
          src={videoUrl}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
      ) : 
      /* 2. AGAR YOUTUBE TRAILER HAI */
      youtubeId ? (
        <div className="absolute inset-0 w-full h-full opacity-60 pointer-events-none">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${youtubeId}&showinfo=0&rel=0&iv_load_policy=3`}
            className="absolute inset-0 w-full h-[120%] -top-[10%] scale-[1.3] md:scale-100 object-cover"
            allow="autoplay; encrypted-media"
            frameBorder="0"
          />
        </div>
      ) : 
      /* 3. AGAR KOI VIDEO NAHI HAI TOH POSTER DIKHAYE */
      (
        <img
          src={fallbackImage}
          alt={movie.title}
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
      )}

      {/* Dark Gradient Overlays (Taake text clear nazar aaye) */}
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