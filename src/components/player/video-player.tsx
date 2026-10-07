"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  RotateCcw, Settings, Loader2,
} from "lucide-react";

interface VideoPlayerProps {
  _title?: string;
  _contentId?: string;
  _episodeId?: string;
  src: string;
  _autoPlay?: boolean;
  poster?: string;
  onEnded?: () => void;
  onProgressUpdate?: (position: number, duration: number) => void;
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function VideoPlayer({
  src,
  poster,
  title,
  contentId,
  episodeId,
  initialPosition = 0,
  autoPlay = false,
  onEnded,
  onProgressUpdate,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showResumeBanner, setShowResumeBanner] = useState(false);

  // ============ VIDEO EVENTS ============
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
      if (initialPosition > 0 && initialPosition < video.duration - 10) {
        video.currentTime = initialPosition;
        setShowResumeBanner(true);
        setTimeout(() => setShowResumeBanner(false), 5000);
      }
    };

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleEnded = () => {
      setIsPlaying(false);
      if (onEnded) onEnded();
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("ended", handleEnded);
    };
  }, [initialPosition, onEnded]);

  // ============ PROGRESS SAVE ============
  useEffect(() => {
    if (!isPlaying || !onProgressUpdate) return;

    progressIntervalRef.current = setInterval(() => {
      const video = videoRef.current;
      if (video && !video.paused) {
        onProgressUpdate(video.currentTime, video.duration);
      }
    }, 5000);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPlaying, onProgressUpdate]);

  // ============ AUTO-HIDE CONTROLS ============
  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  }, [isPlaying]);

  // ============ FULLSCREEN CHANGE ============
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // ============ ACTIONS ============
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const v = parseFloat(e.target.value);
    video.volume = v;
    setVolume(v);
    if (v > 0) {
      video.muted = false;
      setIsMuted(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const t = parseFloat(e.target.value);
    video.currentTime = t;
    setCurrentTime(t);
  };

  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.currentTime + seconds, video.duration));
  };

  const changeSpeed = (speed: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = speed;
    setPlaybackRate(speed);
    setShowSettings(false);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "0:00";
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // ============ NO SOURCE ============
  if (!src) {
    return (
      <div className="relative aspect-video bg-black rounded-2xl overflow-hidden flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
            <Play size={32} className="text-yellow-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Video not available</h3>
          <p className="text-zinc-500 text-sm">This content doesn't have a video source yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative aspect-video bg-black rounded-2xl overflow-hidden group shadow-2xl"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster || undefined}
        className="w-full h-full"
        onClick={togglePlay}
        playsInline
        preload="metadata"
      />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
          <Loader2 size={48} className="text-yellow-500 animate-spin" />
        </div>
      )}

      {showResumeBanner && initialPosition > 0 && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 glass-cosmic rounded-xl px-6 py-4 flex items-center gap-4 animate-fade-in z-20">
          <p className="text-sm text-white font-medium">
            Resume from {formatTime(initialPosition)}?
          </p>
          <button
            onClick={() => {
              const v = videoRef.current;
              if (v && initialPosition) {
                v.currentTime = initialPosition;
                setShowResumeBanner(false);
                v.play().catch(() => {});
              }
            }}
            className="bg-yellow-500 text-black font-bold text-sm px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors"
          >
            Resume
          </button>
          <button
            onClick={() => {
              const v = videoRef.current;
              if (v) {
                v.currentTime = 0;
                setShowResumeBanner(false);
              }
            }}
            className="text-white/80 hover:text-white text-sm"
          >
            Start over
          </button>
        </div>
      )}

      {!isPlaying && !isLoading && (
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          onClick={togglePlay}
        >
          <div className="w-20 h-20 rounded-full bg-yellow-500 hover:bg-yellow-400 flex items-center justify-center transition-all shadow-2xl shadow-yellow-500/50 hover:scale-110">
            <Play size={32} className="text-black fill-black ml-1" />
          </div>
        </div>
      )}

      <div
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent pt-20 pb-4 px-4 md:px-6 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Progress bar */}
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer mb-4"
          style={{
            background: `linear-gradient(to right, #fbbf24 0%, #fbbf24 ${progressPercent}%, rgba(255,255,255,0.2) ${progressPercent}%, rgba(255,255,255,0.2) 100%)`,
          }}
        />

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={togglePlay}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              {isPlaying ? (
                <Pause size={22} className="text-white fill-white" />
              ) : (
                <Play size={22} className="text-white fill-white" />
              )}
            </button>

            <button
              onClick={() => skip(-10)}
              className="hidden md:block p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <RotateCcw size={18} className="text-white" />
            </button>

            <button
              onClick={() => skip(10)}
              className="hidden md:block p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <RotateCcw size={18} className="text-white scale-x-[-1]" />
            </button>

            <div className="flex items-center gap-1 md:gap-2 group/volume">
              <button
                onClick={toggleMute}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX size={20} className="text-white" />
                ) : (
                  <Volume2 size={20} className="text-white" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-0 group-hover/volume:w-20 transition-all duration-300 h-1 bg-white/20 rounded-full appearance-none cursor-pointer"
              />
            </div>

            <span className="text-white/90 text-xs md:text-sm font-mono ml-2 hidden md:inline">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors flex items-center gap-1"
              >
                <Settings size={18} className="text-white" />
                <span className="text-white text-xs font-mono hidden md:inline">
                  {playbackRate}x
                </span>
              </button>

              {showSettings && (
                <div className="absolute bottom-full right-0 mb-2 glass-cosmic rounded-xl py-2 w-32 shadow-2xl animate-fade-in">
                  <p className="text-xs text-zinc-400 px-3 py-1 font-medium">Speed</p>
                  {SPEEDS.map((s) => (
                    <button
                      key={s}
                      onClick={() => changeSpeed(s)}
                      className={`w-full text-left px-3 py-1.5 text-sm transition-colors ${
                        playbackRate === s
                          ? "text-yellow-500 font-bold bg-yellow-500/10"
                          : "text-white hover:bg-white/10"
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              {isFullscreen ? (
                <Minimize size={18} className="text-white" />
              ) : (
                <Maximize size={18} className="text-white" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}