"use client";

import { useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";

interface HeroTrailerProps {
  trailerUrl: string;
  backdropUrl?: string | null;
  title?: string;
}

export function HeroTrailer({ trailerUrl, backdropUrl, title }: HeroTrailerProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [videoId, setVideoId] = useState<string | null>(null);

  useEffect(() => {
    if (!trailerUrl) return;

    let id = "";
    if (trailerUrl.includes("youtu.be/")) {
      id = trailerUrl.split("youtu.be/")[1]?.split("?")[0];
    } else if (trailerUrl.includes("watch?v=")) {
      id = trailerUrl.split("watch?v=")[1]?.split("&")[0];
    } else if (trailerUrl.includes("embed/")) {
      id = trailerUrl.split("embed/")[1]?.split("?")[0];
    }
    
    if (!id && trailerUrl.trim().length === 11) {
      id = trailerUrl.trim();
    }

    setVideoId(id || null);
  }, [trailerUrl]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none bg-[#0a0a0a]">
      
      {/* 1. Trailer Video (Agar link hai toh) */}
      {videoId ? (
        <div className="absolute inset-0 w-full h-full scale-[1.35]">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&loop=1&playlist=${videoId}&modestbranding=1&rel=0&showinfo=0`}
            className="w-full h-full object-cover pointer-events-none opacity-70"
            allow="autoplay; encrypted-media"
            title="Hero Trailer"
          />
        </div>
      ) : (
        /* 2. Agar video nahi hai, toh Poster Image dikhao */
        backdropUrl && (
          <img
            src={backdropUrl}
            alt={title || "Backdrop"}
            className="w-full h-full object-cover opacity-60"
          />
        )
      )}

      {/* 3. Dark Gradients (Taake Text Padha Ja Sake) */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />

      {/* 4. Mute Button (Sirf tab dikhega jab video chal rahi ho) */}
      {videoId && (
        <div className="absolute bottom-1/3 right-10 z-30 pointer-events-auto hidden md:block">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center bg-black/30 backdrop-blur-md hover:bg-white/20 transition text-white"
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>
      )}
    </div>
  );
}