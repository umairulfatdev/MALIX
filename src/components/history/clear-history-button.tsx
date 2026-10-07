"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, AlertTriangle, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { clearAllHistoryAction } from "@/server/actions/history";

export function ClearHistoryButton() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleClear = () => {
    startTransition(async () => {
      const result = await clearAllHistoryAction();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Watch history cleared");
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/30 transition"
      >
        <Trash2 size={14} />
        Clear History
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
            onClick={() => !isPending && setOpen(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[101] glass-cosmic rounded-2xl p-6 animate-fade-in mx-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={22} className="text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1">
                  Clear Watch History
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  This will permanently delete your entire watch history. This
                  action cannot be undone.
                </p>
              </div>
              <button
                onClick={() => !isPending && setOpen(false)}
                className="p-1 rounded-lg hover:bg-white/5"
                disabled={isPending}
              >
                <X size={18} className="text-zinc-400" />
              </button>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-zinc-400 hover:text-white hover:bg-white/5 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleClear}
                disabled={isPending}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold bg-red-600 hover:bg-red-700 text-white transition disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Clearing...
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    Clear All
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}