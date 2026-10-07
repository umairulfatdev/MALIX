import Link from "next/link";
import { cn } from "@/lib/utils";

interface MalixLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  href?: string;
  showText?: boolean;
}

export function MalixLogo({
  size = "md",
  className,
  href = "/",
  showText = true,
}: MalixLogoProps) {
  const sizes = {
    sm: { height: 32, text: "text-xl" },
    md: { height: 44, text: "text-2xl" },
    lg: { height: 56, text: "text-3xl" },
    xl: { height: 80, text: "text-5xl" },
  };

  const s = sizes[size];

  return (
    <Link
      href={href}
      className={cn("flex items-center gap-2 group", className)}
      aria-label="MALIX Home"
    >
      {/* ✅ Animated Golden M Logo */}
      <div className="relative flex-shrink-0">
        {/* Outer glow — pulsing */}
        <div
          className="absolute -inset-3 rounded-full opacity-40 group-hover:opacity-80 transition-opacity blur-xl animate-icon-pulse"
          style={{
            background:
              "radial-gradient(circle, rgba(251, 191, 36, 0.7) 0%, transparent 70%)",
          }}
        />

        {/* Logo image — floating + shimmer */}
        <div className="relative animate-logo-float">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/malix-logo.png"
            alt="MALIX"
            height={s.height}
            className="relative w-auto object-contain drop-shadow-[0_0_12px_rgba(251,191,36,0.5)] group-hover:drop-shadow-[0_0_20px_rgba(251,191,36,0.9)] transition-all animate-logo-glow"
            style={{ height: `${s.height}px` }}
          />

          {/* Shimmer sweep — light crosses the logo */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 animate-logo-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full" />
          </div>
        </div>
      </div>

      {/* MALIX text (optional) — animated */}
      {showText && (
        <div className="hidden sm:block relative">
          <div className="relative flex">
            {"MALIX".split("").map((letter, i) => (
              <span
                key={i}
                className={cn(
                  s.text,
                  "font-black tracking-cinematic leading-none inline-block animate-letter-wave"
                )}
                style={{
                  background:
                    "linear-gradient(135deg, #fde68a 0%, #fbbf24 50%, #f59e0b 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 0 12px rgba(251, 191, 36, 0.5))",
                  animationDelay: `${i * 0.15}s`,
                }}
              >
                {letter}
              </span>
            ))}

            {/* Text shimmer */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute inset-0 animate-text-shimmer bg-gradient-to-r from-transparent via-white/80 to-transparent -translate-x-full" />
            </div>
          </div>

          {/* Golden underline with sparkle */}
          <div className="relative h-0.5 mt-1 rounded-full overflow-hidden">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, transparent, #fbbf24, #fde68a, #fbbf24, transparent)",
                boxShadow: "0 0 10px rgba(251, 191, 36, 0.8)",
              }}
            />
            <div className="absolute inset-0">
              <div className="absolute top-0 bottom-0 w-8 animate-sparkle-slide bg-gradient-to-r from-transparent via-white to-transparent blur-[1px]" />
            </div>
          </div>
        </div>
      )}
    </Link>
  );
}