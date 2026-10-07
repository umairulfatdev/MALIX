"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, MessageSquare, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  toggleReviewVisibilityAction,
  deleteReviewAction,
} from "@/server/actions/admin/reviews";
import { DeleteConfirm } from "./delete-confirm";

interface Review {
  id: string;
  title: string | null;
  body: string;
  isHidden: boolean;
  isReported: boolean;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
  content: {
    id: string;
    title: string;
    slug: string;
    posterUrl: string | null;
  };
}

export function ReviewTable({ reviews }: { reviews: Review[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleToggleVisibility = (id: string) => {
    setPendingId(id);
    startTransition(async () => {
      const result = await toggleReviewVisibilityAction(id);
      setPendingId(null);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(result.isHidden ? "Review hidden" : "Review visible");
      router.refresh();
    });
  };

  if (reviews.length === 0) {
    return (
      <div className="glass-cosmic rounded-2xl p-12 text-center">
        <MessageSquare size={32} className="text-zinc-700 mx-auto mb-3" />
        <p className="text-zinc-400 text-sm">No reviews yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => {
        const initials = review.user.name
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase();

        return (
          <div
            key={review.id}
            className="glass-cosmic rounded-2xl p-5 space-y-4"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {review.user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={review.user.avatarUrl}
                    alt={review.user.name}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-600 flex items-center justify-center text-xs font-black text-black flex-shrink-0">
                    {initials}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-white">
                      {review.user.name}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {new Date(review.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    {review.isHidden && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20">
                        Hidden
                      </span>
                    )}
                    {review.isReported && (
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-orange-400 px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20">
                        <AlertTriangle size={9} />
                        Reported
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-zinc-500 truncate">
                    {review.user.email}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleToggleVisibility(review.id)}
                  disabled={pendingId === review.id}
                  className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center transition group"
                  title={review.isHidden ? "Show" : "Hide"}
                >
                  {pendingId === review.id ? (
                    <Loader2
                      size={14}
                      className="animate-spin text-yellow-500"
                    />
                  ) : review.isHidden ? (
                    <Eye
                      size={14}
                      className="text-zinc-500 group-hover:text-emerald-400"
                    />
                  ) : (
                    <EyeOff
                      size={14}
                      className="text-zinc-500 group-hover:text-red-400"
                    />
                  )}
                </button>
                <DeleteConfirm
                  itemId={review.id}
                  itemTitle={review.title || "Review"}
                  deleteAction={deleteReviewAction}
                />
              </div>
            </div>

            {/* Content link */}
            <Link
              href={`/content/${review.content.slug}`}
              target="_blank"
              className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition group"
            >
              <div className="w-8 h-12 rounded bg-zinc-900 overflow-hidden flex-shrink-0">
                {review.content.posterUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={review.content.posterUrl}
                    alt={review.content.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[8px] text-zinc-700 font-bold">
                    MALIX
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-0.5">
                  Review on
                </div>
                <div className="text-sm font-semibold text-white group-hover:text-yellow-400 transition truncate">
                  {review.content.title}
                </div>
              </div>
            </Link>

            {/* Review body */}
            <div>
              {review.title && (
                <div className="text-sm font-bold text-white mb-1">
                  {review.title}
                </div>
              )}
              <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                {review.body}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}