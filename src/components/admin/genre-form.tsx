"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Plus, Loader2, Save } from "lucide-react";
import {
  createGenreAction,
  updateGenreAction,
  GenreFormState,
} from "@/server/actions/admin/genres";

interface GenreFormProps {
  mode: "create" | "edit";
  genreId?: string;
  initialData?: {
    name: string;
    description?: string | null;
  };
  onSuccess?: () => void;
}

const initialState: GenreFormState = {};

function SubmitButton({ mode }: { mode: "create" | "edit" }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-cosmic flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl disabled:opacity-50"
    >
      {pending ? (
        <>
          <Loader2 size={14} className="animate-spin" />
          Saving...
        </>
      ) : (
        <>
          {mode === "create" ? <Plus size={14} /> : <Save size={14} />}
          {mode === "create" ? "Add Genre" : "Save"}
        </>
      )}
    </button>
  );
}

export function GenreForm({
  mode,
  genreId,
  initialData,
  onSuccess,
}: GenreFormProps) {
  const action =
    mode === "edit" && genreId
      ? updateGenreAction.bind(null, genreId)
      : createGenreAction;

  const [state, formAction] = useActionState(action, initialState);

  // Auto-reset form on success
  if (state?.success && onSuccess && mode === "create") {
    onSuccess();
  }

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="bg-red-500/10 border border-red-500/40 text-red-400 text-xs rounded-lg p-3">
          {state.error}
        </div>
      )}

      {state?.success && (
        <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xs rounded-lg p-3">
          {mode === "create" ? "Genre created!" : "Genre updated!"}
        </div>
      )}

      <div>
        <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 block">
          Genre Name <span className="text-red-500">*</span>
        </label>
        <input
          name="name"
          defaultValue={initialData?.name || ""}
          required
          minLength={2}
          maxLength={50}
          placeholder="e.g., Action"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500/50"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 block">
          Description
        </label>
        <textarea
          name="description"
          defaultValue={initialData?.description || ""}
          rows={2}
          maxLength={200}
          placeholder="Optional description"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500/50 resize-none"
        />
      </div>

      <div className="flex justify-end">
        <SubmitButton mode={mode} />
      </div>
    </form>
  );
}