"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  addToWatchlist,
  removeFromWatchlist,
} from "@/server/actions/watchlist";

interface WatchlistButtonProps {
  contentId: string;
  initialInWatchlist: boolean;
  variant?: "icon" | "full" | "hero";
  className?: string;
}

export function WatchlistButton({
  contentId,
  initialInWatchlist,
  variant = "icon",
  className = "",
}: WatchlistButtonProps) {
  const router = useRouter();
  const [inWatchlist, setInWatchlist] = useState(initialInWatchlist);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    if (isPending) return;

    startTransition(async () => {
      try {
        if (inWatchlist) {
          const result = await removeFromWatchlist(contentId);
          if (result?.error) {
            toast.error(result.error);
            if (result.error.toLowerCase().includes("sign in")) {
              router.push("/login");
            }
            return;
          }
          setInWatchlist(false);
          toast.success("Removed from watchlist");
        } else {
          const result = await addToWatchlist(contentId);
          if (result?.error) {
            toast.error(result.error);
            if (result.error.toLowerCase().includes("sign in")) {
              router.push("/login");
            }
            return;
          }
          setInWatchlist(true);
          toast.success("Added to watchlist ❤️");
        }
        router.refresh();
      } catch (err) {
        console.error("Watchlist error:", err);
        toast.error("Something went wrong. Please try again.");
      }
    });
  };

  // ===== VARIANT: ICON =====
  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        aria-label={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
        className={`
          group/btn relative w-11 h-11 rounded-full flex items-center justify-center
          transition-all duration-300 disabled:opacity-50 cursor-pointer
          ${
            inWatchlist
              ? "bg-yellow-500/20 border border-yellow-500/60"
              : "bg-white/5 hover:bg-white/10 border border-white/10 hover:border-yellow-500/40"
          }
          ${className}
        `}
      >
        {isPending ? (
          <Loader2 size={18} className="animate-spin text-yellow-500" />
        ) : inWatchlist ? (
          <Check size={20} className="text-yellow-400" />
        ) : (
          <Heart
            size={18}
            className="text-white group-hover/btn:text-yellow-400 transition-colors"
          />
        )}
        {inWatchlist && (
          <div className="absolute inset-0 rounded-full bg-yellow-500/20 blur-lg -z-10" />
        )}
      </button>
    );
  }

  // ===== VARIANT: HERO =====
  if (variant === "hero") {
    return (
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        className={`
          flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm
          transition-all duration-300 disabled:opacity-50 cursor-pointer
          ${
            inWatchlist
              ? "bg-yellow-500/20 border border-yellow-500/60 text-yellow-400"
              : "bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur"
          }
          ${className}
        `}
      >
        {isPending ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Loading...
          </>
        ) : inWatchlist ? (
          <>
            <Check size={18} />
            In Watchlist
          </>
        ) : (
          <>
            <Heart size={18} />
            Add to Watchlist
          </>
        )}
      </button>
    );
  }

  // ===== VARIANT: FULL =====
  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      className={`
        flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm w-full
        transition-all duration-300 disabled:opacity-50 cursor-pointer
        ${
          inWatchlist
            ? "bg-yellow-500/10 border border-yellow-500/40 text-yellow-400"
            : "bg-white/5 hover:bg-white/10 border border-white/10 text-white"
        }
        ${className}
      `}
    >
      {isPending ? (
        <>
          <Loader2 size={18} className="animate-spin" />
          Loading...
        </>
      ) : inWatchlist ? (
        <>
          <Check size={18} />
          In Watchlist
        </>
      ) : (
        <>
          <Heart size={18} />
          Add to Watchlist
        </>
      )}
    </button>
  );
}