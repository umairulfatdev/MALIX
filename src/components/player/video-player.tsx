"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, AlertCircle, Download } from "lucide-react";

interface VideoPlayerProps {
  url?: string;
  src?: string;
  poster?: string | null;
  title?: string;
  downloadUrl?: string | null;
}

export function VideoPlayer({ url, src, poster, downloadUrl }: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 👇 NAYA: URL ko encode karo taake %5B aur %5D toot na jayein
  const rawUrl = url || src || "";
  const finalUrl = rawUrl ? encodeURI(rawUrl) : "";

  useEffect(() => {
    setIsLoading(true);
    setError(null);
  }, [finalUrl]);

  const handleIntroEnd = () => setShowIntro(false);

  if (!finalUrl) {
    return (
      <div className="aspect-video bg-black rounded-xl flex items-center justify-center border border-white/10">
        <div className="text-center text-zinc-500">
          <AlertCircle size={48} className="mx-auto mb-2 opacity-50" />
          <p>No video source available</p>
        </div>
      </div>
    );
  }

  const isYouTube = finalUrl.includes("youtube.com") || finalUrl.includes("youtu.be");

  return (
    <div className="w-full">
      <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-white/10 group shadow-2xl">
        
        {showIntro && (
          <div className="absolute inset-0 z-30 bg-black flex items-center justify-center">
            <video
              src="/intro.mp4"
              autoPlay
              muted={isMuted}
              playsInline
              className="w-full h-full object-contain"
              onEnded={handleIntroEnd}
              onError={() => setShowIntro(false)}
            />
            <button
              onClick={handleIntroEnd}
              className="absolute bottom-4 right-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg backdrop-blur-md transition-colors border border-white/20"
            >
              Skip Intro
            </button>
          </div>
        )}

        {isLoading && !error && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
          </div>
        )}

        {error && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/90 p-4 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
            <p className="text-white font-medium">Video Failed to Load</p>
            <p className="text-sm text-zinc-400 mt-1">{error}</p>
          </div>
        )}

        {isYouTube ? (
          <iframe
            src={finalUrl}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={() => setIsLoading(false)}
          />
        ) : (
          <video
            ref={videoRef}
            src={finalUrl}
            poster={poster || undefined}
            controls
            autoPlay={!showIntro}
            playsInline
            preload="auto"
            className="w-full h-full object-contain"
            onLoadedData={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setError("Could not load video stream. Please check the URL.");
            }}
          />
        )}
      </div>

      {downloadUrl && (
        <div className="mt-4 flex justify-end">
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition-all shadow-lg"
          >
            <Download size={20} />
            Download Video
          </a>
        </div>
      )}
    </div>
  );
}