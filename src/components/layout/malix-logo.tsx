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
      {/* ✅ Logo Image */}
      <div className="relative flex-shrink-0">
        <img
          src="/logo.png" // 👈 NAYA: sahi path daala hai
          alt="MALIX"
          className="relative w-auto object-contain transition-all group-hover:scale-105"
          style={{ height: `${s.height}px` }}
          onError={(e) => (e.currentTarget.style.display = 'none')}
        />
      </div>

      {/* ✅ MALIX Text */}
      {showText && (
        <span className={cn(s.text, "font-black text-yellow-500 tracking-widest")}>
          MALIX
        </span>
      )}
    </Link>
  );
}