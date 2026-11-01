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
      {/* 3D Intro Container */}
      <div className="relative flex-shrink-0 flex items-center justify-center intro-container-3d">
        
        {/* Barcode Lights (Peeche ki lines) */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="light-strip strip-red" />
          <div className="light-strip strip-blue" />
          <div className="light-strip strip-yellow" />
          <div className="light-strip strip-purple" />
          <div className="light-strip strip-orange" />
        </div>

        {/* Golden Glow Behind Logo */}
        <div className="absolute inset-0 bg-yellow-500 blur-2xl opacity-40 animate-pulse rounded-full" />

        {/* Aapka Main Logo */}
        <img
          src="/logo.png"
          alt="MALIX"
          className="relative w-auto object-contain logo-zoom-3d z-10"
          style={{ height: `${s.height}px` }}
        />
      </div>

      {/* MALIX Text */}
      {showText && (
        <span className={cn(s.text, "font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-500 to-yellow-200 bg-[length:200%_auto] animate-text-shimmer ml-2")}>
          MALIX
        </span>
      )}
    </Link>
  );
}