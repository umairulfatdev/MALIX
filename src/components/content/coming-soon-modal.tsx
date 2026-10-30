"use client";

import { useState, useEffect } from "react";
import { PlayCircle, Calendar, X } from "lucide-react";

interface ComingSoonModalProps {
  item: any; 
  children: React.ReactNode;
}

export function ComingSoonModal({ item, children }: ComingSoonModalProps) {
  const [open, setOpen] = useState(false);

  // Jab modal khule toh background scroll rok dein
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  // YouTube URL ko embed format mein convert karne ka function
  const getEmbedUrl = (url: string | null) => {
    if (!url) return null;
    if (url.includes("embed/")) return url;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}?autoplay=1`
      : url;
  };

  const embedUrl = getEmbedUrl(item.trailerUrl);

  return (
    <>
      {/* Trigger (Card jis par click karna hai) */}
      <div onClick={() => setOpen(true)} className="cursor-pointer group relative h-full">
        {children}
        {/* Hover par play icon dikhane ke liye overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
          <PlayCircle size={48} className="text-yellow-500" />
        </div>
      </div>

      {/* Modal Overlay (Jab open ho) */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          
          {/* Close Button (Background click karne ke liye) */}
          <div className="absolute inset-0 cursor-pointer" onClick={() => setOpen(false)} />

          {/* Modal Content */}
          <div className="relative z-10 w-full max-w-4xl bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in fade-in zoom-in duration-200">
            
            {/* Close Button (X icon) */}
            <button 
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black text-white rounded-full transition"
            >
              <X size={20} />
            </button>

            {/* Left Side: Trailer */}
            <div className="w-full md:w-2/3 bg-black aspect-video relative">
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  className="w-full h-full absolute inset-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-500 flex-col gap-2">
                  <PlayCircle size={40} />
                  <p>No trailer available</p>
                </div>
              )}
            </div>

            {/* Right Side: Details */}
            <div className="w-full md:w-1/3 p-6 flex flex-col justify-center bg-[#111]">
              <h2 className="text-2xl font-bold text-white mb-2">{item.title}</h2>
              
              <div className="flex items-center gap-2 text-yellow-500 mb-4">
                <Calendar size={18} />
                <span className="font-semibold">
                  {item.comingSoonDate 
                    ? new Date(item.comingSoonDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                    : "Date TBA"}
                </span>
              </div>

              <p className="text-sm text-zinc-400 mb-4 line-clamp-4">
                {item.description || "No description available."}
              </p>

              <div className="flex flex-wrap gap-2 mt-auto">
                {item.genres?.map((g: any) => (
                  <span key={g.id} className="text-xs px-2 py-1 bg-white/10 rounded-md text-zinc-300">
                    {g.name}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}