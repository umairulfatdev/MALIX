"use client";

import { useState, useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface VideoPlayerProps {
  src: string;
  type?: string;
  poster?: string;
  autoPlay?: boolean;
  onProgress?: (position: number, duration: number) => void;
}

export function VideoPlayer({
  src,
  type = "mp4",
  poster,
  autoPlay = false,
  onProgress,
}: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // ✅ Detect video type from URL
  const detectType = (url: string): string => {
    if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
    if (url.includes("vimeo.com")) return "vimeo";
    if (url.includes("dailymotion.com")) return "dailymotion";
    if (url.includes(".mp4") || url.includes(".webm") || url.includes(".m4v"))
      return "mp4";
    if (url.includes(".m3u8")) return "hls";
    return type;
  };

  const actualType = detectType(src);

  // Convert YouTube watch URL to embed URL
  const getYouTubeEmbed = (url: string): string => {
    let videoId = "";
    if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1].split("?")[0];
    } else if (url.includes("watch?v=")) {
      videoId = url.split("watch?v=")[1].split("&")[0];
    } else if (url.includes("embed/")) {
      return url;
    }
    return `https://www.youtube.com/embed/${videoId}?autoplay=${autoPlay ? 1 : 0}&rel=0`;
  };

  // Convert Vimeo watch URL to embed URL
  const getVimeoEmbed = (url: string): string => {
    const match = url.match(/vimeo\.com\/(\d+)/);
    const id = match ? match[1] : "";
    return `https://player.vimeo.com/video/${id}?autoplay=${autoPlay ? 1 : 0}`;
  };

  // Handle progress tracking for MP4
  useEffect(() => {
    const video = videoRef.current;
    if (!video || actualType !== "mp4") return;

    const handleTimeUpdate = () => {
      if (onProgress && video.duration) {
        onProgress(video.currentTime, video.duration);
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, [onProgress, actualType]);

  // ===== YOUTUBE =====
  if (actualType === "youtube") {
    return (
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-black">
        <iframe
          src={getYouTubeEmbed(src)}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          title="Video Player"
        />
      </div>
    );
  }

  // ===== VIMEO =====
  if (actualType === "vimeo") {
    return (
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-black">
        <iframe
          src={getVimeoEmbed(src)}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title="Video Player"
        />
      </div>
    );
  }

  // ===== DAILYMOTION =====
  if (actualType === "dailymotion") {
    const match = src.match(/video\/([a-zA-Z0-9]+)/);
    const id = match ? match[1] : "";
    return (
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-black">
        <iframe
          src={`https://www.dailymotion.com/embed/video/${id}?autoplay=${autoPlay ? 1 : 0}`}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; fullscreen"
          allowFullScreen
          title="Video Player"
        />
      </div>
    );
  }

  // ===== MP4 / HLS (Direct Video) =====
  return (
    <div className="relative aspect-video rounded-2xl overflow-hidden bg-black">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <Loader2 className="w-12 h-12 text-yellow-500 animate-spin" />
        </div>
      )}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        controls
        autoPlay={autoPlay}
        className="absolute inset-0 w-full h-full"
        onLoadedData={() => setIsLoading(false)}
        onError={() => setIsLoading(false)}
        controlsList="nodownload"
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}