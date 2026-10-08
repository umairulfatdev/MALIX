"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
}

const sizes = {
  sm: { icon: 14, gap: "gap-0.5" },
  md: { icon: 20, gap: "gap-1" },
  lg: { icon: 28, gap: "gap-1.5" },
};

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
  showValue = false,
}: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const displayValue = hovered ?? value;
  const s = sizes[size];

  return (
    <div className="inline-flex items-center gap-2">
      <div
        className={cn("inline-flex", s.gap)}
        onMouseLeave={() => !readonly && setHovered(null)}
        role={readonly ? "img" : "radiogroup"}
        aria-label={`Rating: ${value} out of 5`}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= displayValue;

          return (
            <button
              key={star}
              type="button"
              disabled={readonly}
              onClick={() => onChange?.(star)}
              onMouseEnter={() => !readonly && setHovered(star)}
              className={cn(
                "transition-all duration-150",
                !readonly && "hover:scale-110 cursor-pointer",
                readonly && "cursor-default"
              )}
              aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
            >
              <Star
                size={s.icon}
                className={cn(
                  "transition-colors",
                  filled
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-transparent text-zinc-600"
                )}
              />
            </button>
          );
        })}
      </div>

      {showValue && (
        <span className="text-sm font-bold text-yellow-400">
          {value > 0 ? value.toFixed(1) : "—"}
        </span>
      )}
    </div>
  );
}