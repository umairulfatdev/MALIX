"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import {
  createDramaAction,
  updateDramaAction,
  DramaFormState,
} from "@/server/actions/admin/dramas";

interface Genre {
  id: string;
  name: string;
}

interface DramaData {
  id?: string;
  title?: string;
  description?: string;
  shortDesc?: string | null;
  releaseYear?: number | null;
  duration?: number | null;
  language?: string | null;
  country?: string | null;
  posterUrl?: string | null;
  backdropUrl?: string | null;
  trailerUrl?: string | null;
  status?: string;
  isFeatured?: boolean;
  genres?: { id: string }[];
  drama?: { totalEps: number } | null;
}

interface DramaFormProps {
  mode: "create" | "edit";
  dramaId?: string;
  initialData?: DramaData;
  genres: Genre[];
}

const initialState: DramaFormState = {};

function SubmitButton({ mode }: { mode: "create" | "edit" }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-cosmic flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-xl disabled:opacity-50"
    >
      {pending ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          Saving...
        </>
      ) : (
        <>
          <Save size={16} />
          {mode === "create" ? "Create Drama" : "Save Changes"}
        </>
      )}
    </button>
  );
}

export function DramaForm({
  mode,
  dramaId,
  initialData,
  genres,
}: DramaFormProps) {
  const action =
    mode === "edit" && dramaId
      ? updateDramaAction.bind(null, dramaId)
      : createDramaAction;

  const [state, formAction] = useActionState(action, initialState);
  const selectedGenres = initialData?.genres?.map((g) => g.id) || [];

  return (
    <form action={formAction} className="space-y-6 max-w-4xl">
      {state?.error && (
        <div className="bg-red-500/10 border border-red-500/40 text-red-400 text-sm rounded-xl p-4">
          {state.error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/dramas"
            className="w-10 h-10 rounded-lg glass-cosmic flex items-center justify-center hover:border-yellow-500/40 transition"
          >
            <ArrowLeft size={18} className="text-zinc-300" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {mode === "create" ? "Add New Drama" : "Edit Drama"}
            </h1>
            <p className="text-sm text-zinc-500">
              {mode === "create"
                ? "Fill in the details to add a drama"
                : "Update the drama details below"}
            </p>
          </div>
        </div>
        <SubmitButton mode={mode} />
      </div>

      {/* Basic Info */}
      <Section title="Basic Information">
        <Field label="Title" required>
          <input
            name="title"
            defaultValue={initialData?.title || ""}
            required
            minLength={2}
            className="form-input"
            placeholder="e.g., Fading Petals"
          />
        </Field>
        <Field label="Short Description">
          <input
            name="shortDesc"
            defaultValue={initialData?.shortDesc || ""}
            maxLength={200}
            className="form-input"
            placeholder="One-line summary"
          />
        </Field>
        <Field label="Full Description" required>
          <textarea
            name="description"
            defaultValue={initialData?.description || ""}
            required
            minLength={10}
            rows={5}
            className="form-input resize-none"
            placeholder="Full description..."
          />
        </Field>
      </Section>

      {/* Details */}
      <Section title="Details">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Field label="Release Year">
            <input
              name="releaseYear"
              type="number"
              min="1900"
              max="2100"
              defaultValue={initialData?.releaseYear || ""}
              className="form-input"
              placeholder="2024"
            />
          </Field>
          <Field label="Duration (min)">
            <input
              name="duration"
              type="number"
              min="1"
              max="600"
              defaultValue={initialData?.duration || ""}
              className="form-input"
              placeholder="45"
            />
          </Field>
          <Field label="Total Episodes">
            <input
              name="totalEps"
              type="number"
              min="1"
              max="500"
              defaultValue={initialData?.drama?.totalEps || ""}
              className="form-input"
              placeholder="20"
            />
          </Field>
          <Field label="Language">
            <input
              name="language"
              defaultValue={initialData?.language || ""}
              className="form-input"
              placeholder="Urdu"
            />
          </Field>
        </div>
        <Field label="Country">
          <input
            name="country"
            defaultValue={initialData?.country || ""}
            className="form-input"
            placeholder="Pakistan"
          />
        </Field>
      </Section>

      {/* Media */}
      <Section title="Media URLs">
        <Field label="Poster URL" hint="Vertical (2:3)">
          <input
            name="posterUrl"
            type="url"
            defaultValue={initialData?.posterUrl || ""}
            className="form-input"
            placeholder="https://..."
          />
        </Field>
        <Field label="Backdrop URL" hint="Horizontal (16:9)">
          <input
            name="backdropUrl"
            type="url"
            defaultValue={initialData?.backdropUrl || ""}
            className="form-input"
            placeholder="https://..."
          />
        </Field>
        <Field label="Trailer URL">
          <input
            name="trailerUrl"
            type="url"
            defaultValue={initialData?.trailerUrl || ""}
            className="form-input"
            placeholder="https://..."
          />
        </Field>
      </Section>

      {/* Genres */}
      <Section title="Genres">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {genres.map((genre) => (
            <label
              key={genre.id}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 hover:border-yellow-500/40 hover:bg-white/5 cursor-pointer transition"
            >
              <input
                type="checkbox"
                name="genres"
                value={genre.id}
                defaultChecked={selectedGenres.includes(genre.id)}
                className="w-4 h-4 accent-yellow-500"
              />
              <span className="text-sm text-zinc-300">{genre.name}</span>
            </label>
          ))}
        </div>
      </Section>

      {/* Settings */}
      <Section title="Settings">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Status">
            <select
              name="status"
              defaultValue={initialData?.status || "DRAFT"}
              className="form-input"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published (live)</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </Field>
          <Field label="Featured">
            <label className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 hover:border-yellow-500/40 cursor-pointer transition h-[46px]">
              <input
                type="checkbox"
                name="isFeatured"
                defaultChecked={initialData?.isFeatured || false}
                className="w-4 h-4 accent-yellow-500"
              />
              <span className="text-sm text-zinc-300">Show on homepage</span>
            </label>
          </Field>
        </div>
      </Section>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
        <Link
          href="/admin/dramas"
          className="px-6 py-3 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white hover:bg-white/5 transition"
        >
          Cancel
        </Link>
        <SubmitButton mode={mode} />
      </div>

      <style jsx global>{`
        .form-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 12px 16px;
          color: white;
          font-size: 14px;
          transition: all 0.2s;
        }
        .form-input:focus {
          outline: none;
          border-color: rgba(251, 191, 36, 0.5);
          background: rgba(255, 255, 255, 0.05);
        }
        .form-input::placeholder {
          color: #52525b;
        }
      `}</style>
    </form>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-cosmic rounded-2xl p-6 space-y-5">
      <div className="flex items-center gap-3 pb-3 border-b border-white/5">
        <div className="w-1 h-5 rounded-full bg-gradient-to-b from-yellow-400 to-amber-600" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-white">
          {title}
        </h2>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block mb-2">
        <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </span>
        {hint && (
          <span className="text-xs text-zinc-500 block mt-0.5">{hint}</span>
        )}
      </label>
      {children}
    </div>
  );
}