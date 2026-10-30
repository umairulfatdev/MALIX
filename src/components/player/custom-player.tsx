"use client";

import { useRef, useState } from "react";
import { Play, Pause, Maximize, Volume2, VolumeX, RotateCcw } from "lucide-react";

export function CustomPlayer({ url, poster }: { url: string; poster?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setProgress((current / total) * 100);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const seekTime = (parseFloat(e.target.value) / 100) * videoRef.current.duration;
      videoRef.current.currentTime = seekTime;
      setProgress(parseFloat(e.target.value));
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div className="relative group bg-black rounded-xl overflow-hidden w-full aspect-video flex items-center justify-center">
      <video
        ref={videoRef}
        src={url}
        poster={poster}
        // 👇 YEH SABSE ZAROORI HAI: Yeh video ko foran play karega
        preload="metadata" 
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onClick={togglePlay}
      />

      {/* Center Play Button (Agar video pause ho) */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/60 transition cursor-pointer z-10"
        >
          <div className="w-20 h-20 rounded-full bg-yellow-500 flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.5)]">
            <Play size={40} className="text-black fill-black ml-2" />
          </div>
        </button>
      )}

      {/* Custom Controls (YouTube Style) */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-20">
        
        {/* Progress Bar */}
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={handleSeek}
          className="w-full h-1.5 bg-zinc-600 rounded-lg appearance-none cursor-pointer accent-yellow-500 mb-4"
        />

        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <button onClick={togglePlay} className="hover:text-yellow-500 transition">
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            <button onClick={toggleMute} className="hover:text-yellow-500 transition">
              {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>
          </div>
          
          <button onClick={handleFullscreen} className="hover:text-yellow-500 transition">
            <Maximize size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}