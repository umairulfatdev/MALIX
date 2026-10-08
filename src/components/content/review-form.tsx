"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useState } from "react";
import { Send, Loader2, X, Edit3 } from "lucide-react";
import {
  submitReviewAction,
  ReviewFormState,
} from "@/server/actions/reviews";

interface ReviewFormProps {
  contentId: string;
  existingReview?: {
    id: string;
    title: string | null;
    body: string;
  } | null;
}

const initialState: ReviewFormState = {};

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-cosmic flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl disabled:opacity-50"
    >
      {pending ? (
        <>
          <Loader2 size={14} className="animate-spin" />
          Posting...
        </>
      ) : (
        <>
          <Send size={14} />
          {isEdit ? "Update Review" : "Post Review"}
        </>
      )}
    </button>
  );
}

export function ReviewForm({ contentId, existingReview }: ReviewFormProps) {
  const [state, formAction] = useActionState(submitReviewAction, initialState);
  const [editing, setEditing] = useState(false);

  const isEdit = !!existingReview;

  if (isEdit && !editing) {
    return (
      <div className="glass-cosmic rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-wider">
            Your Review
          </h3>
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-xs text-yellow-500 hover:text-yellow-400 font-medium"
          >
            <Edit3 size={12} />
            Edit
          </button>
        </div>
        {existingReview.title && (
          <div className="text-sm font-bold text-white mb-1.5">
            {existingReview.title}
          </div>
        )}
        <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
          {existingReview.body}
        </p>
      </div>
    );
  }

  return (
    <div className="glass-cosmic rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-wider">
          {isEdit ? "Edit Your Review" : "Write a Review"}
        </h3>
        {isEdit && editing && (
          <button
            onClick={() => setEditing(false)}
            className="w-7 h-7 rounded-lg hover:bg-white/5 flex items-center justify-center"
          >
            <X size={14} className="text-zinc-400" />
          </button>
        )}
      </div>

      {state?.error && (
        <div className="bg-red-500/10 border border-red-500/40 text-red-400 text-xs rounded-lg p-3 mb-3">
          {state.error}
        </div>
      )}

      {state?.success && (
        <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xs rounded-lg p-3 mb-3">
          {isEdit ? "Review updated!" : "Review posted!"}
        </div>
      )}

      <form action={formAction} className="space-y-3">
        <input type="hidden" name="contentId" value={contentId} />

        <input
          name="title"
          defaultValue={existingReview?.title || ""}
          placeholder="Review title (optional)"
          maxLength={120}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500/50"
        />

        <textarea
          name="body"
          defaultValue={existingReview?.body || ""}
          required
          minLength={10}
          maxLength={5000}
          rows={4}
          placeholder="Share your thoughts about this content..."
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500/50 resize-none"
        />

        <div className="flex items-center justify-end">
          <SubmitButton isEdit={isEdit} />
        </div>
      </form>
    </div>
  );
}