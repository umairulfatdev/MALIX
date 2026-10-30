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
      {/* Logo Image with Float Animation */}
      <div className="relative flex-shrink-0">
        <div className="absolute inset-0 bg-yellow-500 blur-md opacity-20 group-hover:opacity-60 transition-opacity duration-500 rounded-full" />
        <img
          src="/logo.png"
          alt="MALIX"
          className="relative w-auto object-contain transition-all duration-300 group-hover:scale-110 animate-logo-float"
          style={{ height: `${s.height}px` }}
        />
      </div>

      {/* MALIX Text with Shimmer Animation */}
      {showText && (
        <span className={cn(s.text, "font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-500 to-yellow-200 bg-[length:200%_auto] animate-text-shimmer")}>
          MALIX
        </span>
      )}
    </Link>
  );
}