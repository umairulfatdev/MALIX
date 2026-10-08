"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  Flag,
  Trash2,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import {
  deleteOwnReviewAction,
  reportReviewAction,
} from "@/server/actions/reviews";

interface Review {
  id: string;
  title: string | null;
  body: string;
  createdAt: Date;
  isReported: boolean;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

interface ReviewsListProps {
  reviews: Review[];
  currentUserId?: string;
}

export function ReviewsList({ reviews, currentUserId }: ReviewsListProps) {
  if (reviews.length === 0) {
    return (
      <div className="glass-cosmic rounded-2xl p-12 text-center">
        <MessageSquare size={32} className="text-zinc-700 mx-auto mb-3" />
        <p className="text-zinc-400 text-sm">
          No reviews yet. Be the first to review!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewItem
          key={review.id}
          review={review}
          isOwn={review.user.id === currentUserId}
        />
      ))}
    </div>
  );
}

function ReviewItem({
  review,
  isOwn,
}: {
  review: Review;
  isOwn: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showReport, setShowReport] = useState(false);

  const initials = review.user.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleDelete = () => {
    if (!confirm("Delete your review? This cannot be undone.")) return;

    startTransition(async () => {
      const result = await deleteOwnReviewAction(review.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Review deleted");
      router.refresh();
    });
  };

  const handleReport = () => {
    startTransition(async () => {
      const result = await reportReviewAction(review.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Review reported. Thank you.");
      setShowReport(false);
      router.refresh();
    });
  };

  return (
    <div className="glass-cosmic rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
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
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white flex items-center gap-2">
              {review.user.name}
              {isOwn && (
                <span className="text-[10px] text-yellow-500 px-1.5 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/20 uppercase tracking-wider font-bold">
                  You
                </span>
              )}
            </div>
            <div className="text-xs text-zinc-500">
              {new Date(review.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {isOwn ? (
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="w-8 h-8 rounded-lg hover:bg-red-500/10 flex items-center justify-center transition group"
              title="Delete your review"
            >
              {isPending ? (
                <Loader2 size={14} className="animate-spin text-yellow-500" />
              ) : (
                <Trash2
                  size={14}
                  className="text-zinc-500 group-hover:text-red-400"
                />
              )}
            </button>
          ) : (
            <button
              onClick={() => setShowReport(!showReport)}
              className="w-8 h-8 rounded-lg hover:bg-orange-500/10 flex items-center justify-center transition group"
              title="Report review"
            >
              <Flag
                size={14}
                className="text-zinc-500 group-hover:text-orange-400"
              />
            </button>
          )}
        </div>
      </div>

      {showReport && (
        <div className="mb-3 p-3 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-start gap-2">
          <AlertTriangle
            size={14}
            className="text-orange-400 flex-shrink-0 mt-0.5"
          />
          <div className="flex-1 text-xs text-orange-200">
            Report this review as inappropriate?
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={handleReport}
                disabled={isPending}
                className="px-3 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-[11px] transition disabled:opacity-50"
              >
                {isPending ? "Reporting..." : "Yes, Report"}
              </button>
              <button
                onClick={() => setShowReport(false)}
                className="px-3 py-1 rounded-lg text-orange-300 hover:text-white font-medium text-[11px] transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {review.title && (
        <div className="text-sm font-bold text-white mb-1.5">
          {review.title}
        </div>
      )}
      <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
        {review.body}
      </p>
    </div>
  );
}