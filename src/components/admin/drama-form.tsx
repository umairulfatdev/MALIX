"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Video, HardDrive, Download } from "lucide-react";
import { toast } from "sonner";
import {
  createDramaAction,
  updateDramaAction,
  ContentFormState,
} from "@/server/actions/admin/dramas";

interface Genre { id: string; name: string; }
interface DriveOption { id: string; name: string; }

interface DramaData {
  id?: string;
  title?: string;
  description?: string;
  shortDesc?: string | null;
  releaseYear?: number | null;
  duration?: number | null;
  language?: string | null;
  country?: string | null;
  quality?: string | null;
  posterUrl?: string | null;
  backdropUrl?: string | null;
  trailerUrl?: string | null;
  videoUrl?: string | null;
  download480p?: string | null;
  download720p?: string | null;
  download1080p?: string | null;
  status?: string;
  isFeatured?: boolean;
  genres?: { id: string }[];
  driveId?: string | null;
}

interface DramaFormProps {
  mode: "create" | "edit";
  dramaId?: string;
  initialData?: DramaData;
  genres: Genre[];
  drives?: DriveOption[];
}

const initialState: ContentFormState = {};
const inputClass = "w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-white/10 text-white placeholder:text-zinc-500 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all text-sm";

function SubmitButton({ mode }: { mode: "create" | "edit" }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-cosmic flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-xl disabled:opacity-50">
      {pending ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> {mode === "create" ? "Create Drama" : "Save Changes"}</>}
    </button>
  );
}

export function DramaForm({ mode, dramaId, initialData, genres, drives = [] }: DramaFormProps) {
  const router = useRouter();
  const action = mode === "edit" && dramaId ? updateDramaAction.bind(null, dramaId) : createDramaAction;
  const [state, formAction] = useActionState(action, initialState);

  useEffect(() => {
    if (state?.success) {
      toast.success("Drama saved successfully!");
      router.push("/admin/dramas");
      router.refresh();
    }
    if (state?.error) toast.error(state.error);
  }, [state, router]);

  const selectedGenres = initialData?.genres?.map((g) => g.id) || [];

  return (
    <form action={formAction} className="space-y-6 max-w-4xl">
      {state?.error && <div className="bg-red-500/10 border border-red-500/40 text-red-400 text-sm rounded-xl p-4">{state.error}</div>}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/dramas" className="w-10 h-10 rounded-lg glass-cosmic flex items-center justify-center hover:border-yellow-500/40 transition"><ArrowLeft size={18} className="text-zinc-300" /></Link>
          <div><h1 className="text-2xl font-bold text-white">{mode === "create" ? "Add New Drama" : "Edit Drama"}</h1></div>
        </div>
        <SubmitButton mode={mode} />
      </div>

      <Section title="Basic Information">
        <Field label="Title" required><input name="title" defaultValue={initialData?.title || ""} required minLength={2} className={inputClass} placeholder="e.g., Breaking Bad" /></Field>
        <Field label="Short Description"><input name="shortDesc" defaultValue={initialData?.shortDesc || ""} maxLength={200} className={inputClass} placeholder="One-line summary" /></Field>
        <Field label="Full Description" required><textarea name="description" defaultValue={initialData?.description || ""} required minLength={10} rows={5} className={`${inputClass} resize-none`} placeholder="Full description..." /></Field>
      </Section>

      <Section title="Details">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Field label="Release Year"><input name="releaseYear" type="number" min="1900" max="2100" defaultValue={initialData?.releaseYear || ""} className={inputClass} placeholder="2024" /></Field>
          <Field label="Duration (minutes)"><input name="duration" type="number" min="1" max="600" defaultValue={initialData?.duration || ""} className={inputClass} placeholder="120" /></Field>
          <Field label="Language"><input name="language" defaultValue={initialData?.language || ""} className={inputClass} placeholder="English" /></Field>
          <Field label="Quality">
            <select name="quality" defaultValue={initialData?.quality || "HD"} className={`${inputClass} cursor-pointer`}>
              <option value="HD">HD</option><option value="480p">480p</option><option value="720p">720p</option><option value="1080p">1080p</option><option value="4K">4K</option>
            </select>
          </Field>
        </div>
        <Field label="Country"><input name="country" defaultValue={initialData?.country || ""} className={inputClass} placeholder="USA" /></Field>
      </Section>

      <Section title="🎬 Video Sources">
        <Field label="Video URL (Streaming)" required>
          <div className="relative"><Video size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-500 z-10" /><input name="videoUrl" type="url" defaultValue={initialData?.videoUrl || ""} required className={`${inputClass} pl-12`} placeholder="https://..." /></div>
        </Field>
      </Section>

      <Section title="⬇️ Download Links (Optional)">
        <Field label="Download URL (480p)"><div className="relative"><Download size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 z-10" /><input name="download480p" type="url" defaultValue={initialData?.download480p || ""} className={`${inputClass} pl-12`} placeholder="https://..." /></div></Field>
        <Field label="Download URL (720p)"><div className="relative"><Download size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 z-10" /><input name="download720p" type="url" defaultValue={initialData?.download720p || ""} className={`${inputClass} pl-12`} placeholder="https://..." /></div></Field>
        <Field label="Download URL (1080p)"><div className="relative"><Download size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 z-10" /><input name="download1080p" type="url" defaultValue={initialData?.download1080p || ""} className={`${inputClass} pl-12`} placeholder="https://..." /></div></Field>
      </Section>

      <Section title="Media URLs">
        <Field label="Poster URL"><input name="posterUrl" type="url" defaultValue={initialData?.posterUrl || ""} className={inputClass} placeholder="https://..." /></Field>
        <Field label="Backdrop URL"><input name="backdropUrl" type="url" defaultValue={initialData?.backdropUrl || ""} className={inputClass} placeholder="https://..." /></Field>
        <Field label="Trailer URL"><input name="trailerUrl" type="url" defaultValue={initialData?.trailerUrl || ""} className={inputClass} placeholder="https://..." /></Field>
      </Section>

      <Section title="Genres">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {genres.map((genre) => (
            <label key={genre.id} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 hover:border-yellow-500/40 hover:bg-white/5 cursor-pointer transition">
              <input type="checkbox" name="genres" value={genre.id} defaultChecked={selectedGenres.includes(genre.id)} className="w-4 h-4 accent-yellow-500" />
              <span className="text-sm text-zinc-300">{genre.name}</span>
            </label>
          ))}
        </div>
      </Section>

      <Section title="Settings">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Status"><select name="status" defaultValue={initialData?.status || "DRAFT"} className={`${inputClass} cursor-pointer`}><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option><option value="ARCHIVED">Archived</option></select></Field>
          <Field label="Featured"><label className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 hover:border-yellow-500/40 cursor-pointer transition h-[46px]"><input type="checkbox" name="isFeatured" defaultChecked={initialData?.isFeatured || false} className="w-4 h-4 accent-yellow-500" /><span className="text-sm text-zinc-300">Show on homepage hero</span></label></Field>
        </div>
      </Section>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
        <Link href="/admin/dramas" className="px-6 py-3 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white hover:bg-white/5 transition">Cancel</Link>
        <SubmitButton mode={mode} />
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-cosmic rounded-2xl p-6 space-y-5">
      <div className="flex items-center gap-3 pb-3 border-b border-white/5"><div className="w-1 h-5 rounded-full bg-gradient-to-b from-yellow-400 to-amber-600" /><h2 className="text-sm font-bold uppercase tracking-wider text-white">{title}</h2></div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block mb-2"><span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">{label}{required && <span className="text-red-500 ml-1">*</span>}</span>{hint && <span className="text-xs text-zinc-500 block mt-0.5">{hint}</span>}</label>
      {children}
    </div>
  );
}