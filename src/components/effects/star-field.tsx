"use client";

import { useEffect, useState } from "react";

// ============ TYPES ============
interface Star {
  id: number;
  left: number;
  top: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  color: string;
}

interface ShootingStar {
  id: number;
  top: number;
  left: number;
  duration: number;
  delay: number;
  angle: number;
}

interface Nebula {
  id: number;
  left: string;
  top: string;
  size: number;
  color: string;
  duration: number;
  delay: number;
}

export function StarField() {
  const [mounted, setMounted] = useState(false);
  const [distantStars, setDistantStars] = useState<Star[]>([]);
  const [midStars, setMidStars] = useState<Star[]>([]);
  const [nearStars, setNearStars] = useState<Star[]>([]);
  const [shootingStars, setShootingStars] = useState<ShootingStar[]>([]);

  useEffect(() => {
    setMounted(true);

    // ===== DISTANT STARS =====
    setDistantStars(
      Array.from({ length: 120 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 1 + 0.5,
        opacity: Math.random() * 0.4 + 0.2,
        duration: Math.random() * 4 + 3,
        delay: Math.random() * 5,
        color: "rgba(255, 255, 255, 1)",
      }))
    );

    // ===== MID STARS =====
    setMidStars(
      Array.from({ length: 60 }, (_, i) => ({
        id: i + 1000,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 1.5 + 1,
        opacity: Math.random() * 0.5 + 0.4,
        duration: Math.random() * 3 + 2,
        delay: Math.random() * 3,
        color:
          Math.random() > 0.6
            ? "rgba(251, 191, 36, 1)"
            : Math.random() > 0.3
              ? "rgba(253, 230, 138, 1)"
              : "rgba(255, 255, 255, 1)",
      }))
    );

    // ===== NEAR STARS =====
    setNearStars(
      Array.from({ length: 25 }, (_, i) => ({
        id: i + 2000,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 2 + 2,
        opacity: Math.random() * 0.6 + 0.4,
        duration: Math.random() * 2.5 + 1.5,
        delay: Math.random() * 2,
        color: [
          "rgba(217, 119, 6, 1)",
          "rgba(251, 191, 36, 1)",
          "rgba(253, 230, 138, 1)",
          "rgba(255, 255, 255, 1)",
        ][Math.floor(Math.random() * 4)],
      }))
    );

    // ===== SHOOTING STARS =====
    setShootingStars(
      Array.from({ length: 4 }, (_, i) => ({
        id: i,
        top: Math.random() * 60,
        left: Math.random() * 40 + 20,
        duration: Math.random() * 2 + 2,
        delay: Math.random() * 15 + 5,
        angle: 35 + Math.random() * 20,
      }))
    );
  }, []);

  // ===== NEBULAS (static — no random) =====
  const nebulae: Nebula[] = [
    {
      id: 1,
      left: "-10%",
      top: "-15%",
      size: 800,
      color: "rgba(217, 119, 6, 0.35)",
      duration: 25,
      delay: 0,
    },
    {
      id: 2,
      left: "70%",
      top: "10%",
      size: 700,
      color: "rgba(251, 191, 36, 0.3)",
      duration: 30,
      delay: 3,
    },
    {
      id: 3,
      left: "20%",
      top: "60%",
      size: 900,
      color: "rgba(245, 158, 11, 0.28)",
      duration: 28,
      delay: 6,
    },
    {
      id: 4,
      left: "60%",
      top: "70%",
      size: 600,
      color: "rgba(153, 87, 27, 0.3)",
      duration: 32,
      delay: 9,
    },
    {
      id: 5,
      left: "40%",
      top: "20%",
      size: 500,
      color: "rgba(253, 230, 138, 0.22)",
      duration: 26,
      delay: 12,
    },
  ];

  // Server pe kuch render na karein — sirf client pe
  if (!mounted) {
    return <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" />;
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* ============ NEBULA LAYER ============ */}
      <div className="absolute inset-0">
        {nebulae.map((neb) => (
          <div
            key={neb.id}
            className="absolute rounded-full animate-drift-nebula"
            style={{
              left: neb.left,
              top: neb.top,
              width: `${neb.size}px`,
              height: `${neb.size}px`,
              background: `radial-gradient(circle, ${neb.color} 0%, transparent 70%)`,
              filter: "blur(60px)",
              animationDuration: `${neb.duration}s`,
              animationDelay: `${neb.delay}s`,
            }}
          />
        ))}
      </div>

      {/* ============ DISTANT STARS ============ */}
      {distantStars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full animate-twinkle-slow"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            background: star.color,
            boxShadow: `0 0 ${star.size * 3}px ${star.color}`,
            opacity: star.opacity,
            animationDuration: `${star.duration}s`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}

      {/* ============ MID STARS ============ */}
      {midStars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full animate-twinkle"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            background: star.color,
            boxShadow: `0 0 ${star.size * 4}px ${star.color}`,
            opacity: star.opacity,
            animationDuration: `${star.duration}s`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}

      {/* ============ NEAR STARS ============ */}
      {nearStars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full animate-pulse-fast"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            background: star.color,
            boxShadow: `0 0 ${star.size * 6}px ${star.color}`,
            opacity: star.opacity,
            animationDuration: `${star.duration}s`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}

      {/* ============ SHOOTING STARS ============ */}
      {shootingStars.map((star) => (
        <div
          key={star.id}
          className="absolute animate-shoot"
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            animationDuration: `${star.duration}s`,
            animationDelay: `${star.delay}s`,
            ["--angle" as string]: `${star.angle}deg`,
          }}
        >
          <div className="relative">
            <div className="w-[150px] h-[2px] bg-gradient-to-r from-transparent via-yellow-400 to-white" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_15px_5px_rgba(251,191,36,0.9)]" />
          </div>
        </div>
      ))}

      {/* ============ VIGNETTE ============ */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(5,5,5,0.4)_60%,rgba(5,5,5,0.9)_100%)]" />
    </div>
  );
}