"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, AlertTriangle, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteConfirmProps {
  itemId: string;
  itemTitle: string;
  deleteAction: (id: string) => Promise<{ success?: boolean; error?: string }>;
  onSuccess?: () => void;
}

export function DeleteConfirm({
  itemId,
  itemTitle,
  deleteAction,
  onSuccess,
}: DeleteConfirmProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteAction(itemId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(`"${itemTitle}" deleted`);
      setOpen(false);
      router.refresh();
      onSuccess?.();
    });
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-8 h-8 rounded-lg hover:bg-red-500/20 flex items-center justify-center transition group"
        aria-label="Delete"
      >
        <Trash2
          size={14}
          className="text-zinc-500 group-hover:text-red-400"
        />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
            onClick={() => !isPending && setOpen(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[101] glass-cosmic rounded-2xl p-6 animate-fade-in">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={22} className="text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1">
                  Delete Confirmation
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Are you sure you want to delete{" "}
                  <span className="text-white font-semibold">
                    &ldquo;{itemTitle}&rdquo;
                  </span>
                  ? This action cannot be undone.
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
                onClick={handleDelete}
                disabled={isPending}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold bg-red-600 hover:bg-red-700 text-white transition disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    Delete
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