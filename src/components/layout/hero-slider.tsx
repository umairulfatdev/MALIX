"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Play, Info, Volume2, VolumeX } from "lucide-react";

// YouTube URL se Video ID nikaalne ka function
function getYouTubeId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url?.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export function HeroSlider({ movies }: { movies: any[] }) {
  const [current, setCurrent] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (movies.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % movies.length);
    }, 15000); // 15 seconds tak rukega
    return () => clearInterval(timer);
  }, [movies.length]);

  if (!movies || movies.length === 0) return null;

  const movie = movies[current];
  
  // Priority: 1. MP4 Video, 2. YouTube Trailer
  const videoUrl = movie.videoSources?.[0]?.url; 
  const youtubeId = getYouTubeId(movie.trailerUrl);

  return (
    <div className="relative w-full h-[60vh] md:h-[85vh] bg-black overflow-hidden">
      
      {/* Agar MP4 Video hai toh <video> tag chalega */}
      {videoUrl && videoUrl.includes(".mp4") ? (
        <video
          ref={videoRef}
          key={movie.id}
          src={videoUrl}
          autoPlay
          muted={isMuted}
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
      ) : youtubeId ? (
        /* Agar MP4 nahi hai lekin YouTube link hai, toh background iframe chalega */
        <div className="absolute inset-0 w-full h-full opacity-60 pointer-events-none">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&loop=1&playlist=${youtubeId}&showinfo=0&rel=0`}
            className="absolute inset-0 w-full h-[120%] -top-[10%] scale-150 md:scale-100 object-cover"
            allow="autoplay; encrypted-media"
            frameBorder="0"
          />
        </div>
      ) : (
        /* Agar koi video nahi hai, toh sirf Image dikhegi */
        <img
          src={movie.backdropUrl || movie.posterUrl || "/placeholder.jpg"}
          alt={movie.title}
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
      )}

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 w-full p-6 md:p-16 z-10 max-w-4xl">
        <h1 className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-lg line-clamp-2">
          {movie.title}
        </h1>
        <p className="text-sm md:text-base text-zinc-300 line-clamp-3 mb-8 drop-shadow-md max-w-2xl">
          {movie.description}
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

      {/* Mute/Unmute Button */}
      {(videoUrl || youtubeId) && (
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="absolute bottom-16 right-8 md:bottom-24 md:right-16 w-10 h-10 rounded-full border border-white/40 flex items-center justify-center text-white hover:bg-white/20 transition z-20"
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      )}
    </div>
  );
}