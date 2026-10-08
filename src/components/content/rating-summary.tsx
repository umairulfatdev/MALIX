"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { StarRating } from "./star-rating";
import {
  submitRatingAction,
  removeRatingAction,
} from "@/server/actions/ratings";

interface RatingSummaryProps {
  contentId: string;
  stats: {
    average: number;
    total: number;
    distribution: { score: number; count: number; percentage: number }[];
  };
  userRating: number | null;
  isLoggedIn: boolean;
}

export function RatingSummary({
  contentId,
  stats,
  userRating,
  isLoggedIn,
}: RatingSummaryProps) {
  const router = useRouter();
  const [rating, setRating] = useState<number>(userRating || 0);
  const [isPending, startTransition] = useTransition();

  const handleRate = (score: number) => {
    if (!isLoggedIn) {
      toast.error("Please sign in to rate");
      router.push("/login");
      return;
    }

    setRating(score);

    startTransition(async () => {
      const result = await submitRatingAction(contentId, score);
      if (result.error) {
        toast.error(result.error);
        setRating(userRating || 0);
        return;
      }
      toast.success(`You rated ${score} star${score > 1 ? "s" : ""}!`);
      router.refresh();
    });
  };

  const handleRemove = () => {
    if (!isLoggedIn) return;

    startTransition(async () => {
      const result = await removeRatingAction(contentId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setRating(0);
      toast.success("Rating removed");
      router.refresh();
    });
  };

  return (
    <div className="glass-cosmic rounded-2xl p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Big Average */}
        <div className="flex flex-col items-center justify-center text-center md:border-r md:border-white/10">
          <div className="text-5xl md:text-6xl font-black text-yellow-400 mb-2">
            {stats.average > 0 ? stats.average.toFixed(1) : "—"}
          </div>
          <StarRating value={stats.average} readonly size="md" />
          <div className="text-sm text-zinc-500 mt-3">
            {stats.total} rating{stats.total === 1 ? "" : "s"}
          </div>
        </div>

        {/* Right: Distribution */}
        <div className="space-y-2">
          {stats.distribution.map((item) => (
            <div key={item.score} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-12 flex-shrink-0">
                <span className="text-xs font-semibold text-white">
                  {item.score}★
                </span>
              </div>
              <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 to-amber-600 transition-all duration-500"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
              <span className="text-xs text-zinc-500 w-10 text-right flex-shrink-0">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* User Rating Section */}
      <div className="mt-6 pt-6 border-t border-white/10">
        {isLoggedIn ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <div className="text-sm font-semibold text-white mb-1">
                {rating > 0 ? "Your Rating" : "Rate this content"}
              </div>
              <div className="text-xs text-zinc-500">
                {rating > 0 ? "Click to change" : "Click a star to rate"}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <StarRating value={rating} onChange={handleRate} size="lg" />
              {isPending && (
                <Loader2 size={18} className="animate-spin text-yellow-500" />
              )}
              {rating > 0 && !isPending && (
                <button
                  onClick={handleRemove}
                  className="w-8 h-8 rounded-lg hover:bg-red-500/10 flex items-center justify-center transition group"
                  title="Remove rating"
                >
                  <Trash2
                    size={14}
                    className="text-zinc-500 group-hover:text-red-400"
                  />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-sm text-zinc-400 mb-2">
              Sign in to rate this content
            </div>
            <button
              onClick={() => router.push("/login")}
              className="btn-cosmic px-5 py-2 text-sm font-bold rounded-lg"
            >
              Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}