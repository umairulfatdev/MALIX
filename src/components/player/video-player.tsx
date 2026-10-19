"use client";

import { useState, useEffect } from "react";
import { Loader2, AlertCircle } from "lucide-react";

interface VideoPlayerProps {
  url?: string;
  src?: string;
  poster?: string;
  title?: string;
  contentId?: string;
  episodeId?: string | null;
  initialPosition?: number;
  autoPlay?: boolean;
  onProgressUpdate?: (position: number, duration: number) => void;
  onEnded?: () => void;
}

export function VideoPlayer({ url, src, poster }: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const rawUrl = url || src || "";

  const getProcessedUrl = (originalUrl: string) => {
    if (!originalUrl) return "";

    if (originalUrl.includes("youtube.com") || originalUrl.includes("youtu.be")) {
      let videoId = "";
      if (originalUrl.includes("youtu.be/")) {
        videoId = originalUrl.split("youtu.be/")[1]?.split("?")[0];
      } else if (originalUrl.includes("watch?v=")) {
        videoId = originalUrl.split("watch?v=")[1]?.split("&")[0];
      } else if (originalUrl.includes("embed/")) {
        return originalUrl;
      }
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    }

    if (originalUrl.includes("vimeo.com")) {
      const videoId = originalUrl.split("vimeo.com/")[1]?.split("?")[0];
      return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
    }

    if (originalUrl.includes("drive.google.com")) {
      const match = originalUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `/api/stream/${match[1]}`;
      }
    }

    if (/^[a-zA-Z0-9_-]{25,}$/.test(originalUrl) && !originalUrl.startsWith("http")) {
      return `/api/stream/${originalUrl}`;
    }

    return originalUrl;
  };

  const finalUrl = getProcessedUrl(rawUrl);
  const isIframe = finalUrl.includes("youtube.com/embed") || finalUrl.includes("player.vimeo.com");

  useEffect(() => {
    setIsLoading(true);
    setError(null);
  }, [rawUrl]);

  if (!rawUrl) {
    return (
      <div className="aspect-video bg-black rounded-xl flex items-center justify-center border border-white/10">
        <div className="text-center text-zinc-500">
          <AlertCircle size={48} className="mx-auto mb-2 opacity-50" />
          <p>No video source available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-white/10 group shadow-2xl">
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

      {isIframe ? (
        <iframe
          src={finalUrl}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setError("Could not load iframe video.");
          }}
        />
      ) : (
        <video
          src={finalUrl}
          poster={poster}
          controls
          autoPlay
          playsInline
          className="w-full h-full object-contain"
          onLoadedData={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setError("Could not load video stream. Please check the URL.");
          }}
        />
      )}
    </div>
  );
}