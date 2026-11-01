"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Youtube, Video } from "lucide-react";
import { toast } from "sonner";
import {
  createComingSoonAction,
  updateComingSoonAction,
  ComingSoonFormState,
} from "@/server/actions/admin/coming-soon";

interface Genre { id: string; name: string; }

interface ComingSoonData {
  id?: string;
  title?: string;
  description?: string;
  shortDesc?: string | null;
  type?: string;
  releaseYear?: number | null;
  comingSoonDate?: Date | string | null;
  language?: string | null;
  country?: string | null;
  posterUrl?: string | null;
  backdropUrl?: string | null;
  trailerUrl?: string | null;
  status?: string;
  isFeatured?: boolean;
  printType?: string | null;
  genres?: { id: string }[];
}

interface ComingSoonFormProps {
  mode: "create" | "edit";
  contentId?: string;
  initialData?: ComingSoonData;
  genres: Genre[];
}

const initialState: ComingSoonFormState = {};
const inputClass = "w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-white/10 text-white placeholder:text-zinc-500 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all text-sm";

function SubmitButton({ mode }: { mode: "create" | "edit" }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-cosmic flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-xl disabled:opacity-50">
      {pending ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> {mode === "create" ? "Create Coming Soon" : "Save Changes"}</>}
    </button>
  );
}

export function ComingSoonForm({ mode, contentId, initialData, genres }: ComingSoonFormProps) {
  const router = useRouter();
  const action = mode === "edit" && contentId ? updateComingSoonAction.bind(null, contentId) : createComingSoonAction;
  const [state, formAction] = useActionState(action, initialState);

  useEffect(() => {
    if (state?.success) {
      toast.success("Coming Soon saved!");
      router.push("/admin/coming-soon");
      router.refresh();
    }
    if (state?.error) toast.error(state.error);
  }, [state, router]);

  const selectedGenres = initialData?.genres?.map((g) => g.id) || [];
  const dateValue = initialData?.comingSoonDate
    ? new Date(initialData.comingSoonDate).toISOString().split("T")[0]
    : "";

  return (
    <form action={formAction} className="space-y-6 max-w-4xl">
      {state?.error && <div className="bg-red-500/10 border border-red-500/40 text-red-400 text-sm rounded-xl p-4">{state.error}</div>}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/coming-soon" className="w-10 h-10 rounded-lg glass-cosmic flex items-center justify-center hover:border-yellow-500/40 transition"><ArrowLeft size={18} className="text-zinc-300" /></Link>
          <div><h1 className="text-2xl font-bold text-white">{mode === "create" ? "Add Coming Soon" : "Edit Coming Soon"}</h1></div>
        </div>
        <SubmitButton mode={mode} />
      </div>

      <div className="glass-cosmic rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-white/5">
          <div className="w-1 h-5 rounded-full bg-gradient-to-b from-yellow-400 to-amber-600" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">Basic Information</h2>
        </div>
        
        <div>
          <label className="block mb-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">Title <span className="text-red-500">*</span></label>
          <input name="title" defaultValue={initialData?.title || ""} required minLength={2} className={inputClass} placeholder="e.g., Avatar 3" />
        </div>
        <div>
          <label className="block mb-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">Short Description</label>
          <input name="shortDesc" defaultValue={initialData?.shortDesc || ""} maxLength={200} className={inputClass} placeholder="One-line summary" />
        </div>
        <div>
          <label className="block mb-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">Full Description</label>
          <textarea name="description" defaultValue={initialData?.description || ""} rows={4} className={`${inputClass} resize-none`} placeholder="Full description..." />
        </div>
      </div>

      <div className="glass-cosmic rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-white/5">
          <div className="w-1 h-5 rounded-full bg-gradient-to-b from-yellow-400 to-amber-600" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">Details & Print Type</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block mb-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">Type</label>
            <select name="type" defaultValue={initialData?.type || "MOVIE"} className={`${inputClass} cursor-pointer`}>
              <option value="MOVIE">Movie</option>
              <option value="SERIES">Series</option>
              <option value="ANIME">Anime</option>
            </select>
          </div>
          <div>
            <label className="block mb-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">Release Year</label>
            <input name="releaseYear" type="number" min="1900" max="2100" defaultValue={initialData?.releaseYear || ""} className={inputClass} placeholder="2026" />
          </div>
          <div>
            <label className="block mb-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">Release Date</label>
            <input name="comingSoonDate" type="date" defaultValue={dateValue} className={inputClass} />
          </div>
        </div>

        {/* 👇 NAYA: PRINT TYPE DROPDOWN */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block mb-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">Print Quality</label>
            <select name="printType" defaultValue={initialData?.printType || "CAM"} className={`${inputClass} cursor-pointer text-yellow-500 font-bold`}>
              <option value="CAM">CAM (Cinema Print)</option>
              <option value="HD">HD (Web-DL / BluRay)</option>
              <option value="UPCOMING">Unreleased (Coming Soon)</option>
            </select>
          </div>
          <div>
            <label className="block mb-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">Language</label>
            <input name="language" defaultValue={initialData?.language || ""} className={inputClass} placeholder="English" />
          </div>
          <div>
            <label className="block mb-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">Country</label>
            <input name="country" defaultValue={initialData?.country || ""} className={inputClass} placeholder="USA" />
          </div>
        </div>
      </div>

      <div className="glass-cosmic rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-white/5">
          <div className="w-1 h-5 rounded-full bg-gradient-to-b from-yellow-400 to-amber-600" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">Media URLs</h2>
        </div>
        
        <div>
          <label className="block mb-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">Trailer URL (YouTube)</label>
          <div className="relative">
            <Youtube size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500 z-10" />
            <input name="trailerUrl" type="url" defaultValue={initialData?.trailerUrl || ""} className={`${inputClass} pl-12`} placeholder="https://youtube.com/watch?v=..." />
          </div>
        </div>

        <div>
          <label className="block mb-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">Streaming / Download URL</label>
          <div className="relative">
            <Video size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-500 z-10" />
            <input name="videoUrl" type="url" className={`${inputClass} pl-12`} placeholder="https://... (Optional)" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">Poster URL</label>
            <input name="posterUrl" type="url" defaultValue={initialData?.posterUrl || ""} className={inputClass} placeholder="https://..." />
          </div>
          <div>
            <label className="block mb-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">Backdrop URL</label>
            <input name="backdropUrl" type="url" defaultValue={initialData?.backdropUrl || ""} className={inputClass} placeholder="https://..." />
          </div>
        </div>
      </div>

      <div className="glass-cosmic rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-white/5">
          <div className="w-1 h-5 rounded-full bg-gradient-to-b from-yellow-400 to-amber-600" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">Settings</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">Status</label>
            <select name="status" defaultValue={initialData?.status || "DRAFT"} className={`${inputClass} cursor-pointer`}>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          <div>
            <label className="block mb-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">Featured</label>
            <label className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 hover:border-yellow-500/40 cursor-pointer transition h-[46px]">
              <input type="checkbox" name="isFeatured" defaultChecked={initialData?.isFeatured || false} className="w-4 h-4 accent-yellow-500" />
              <span className="text-sm text-zinc-300">Show on homepage</span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
        <Link href="/admin/coming-soon" className="px-6 py-3 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white hover:bg-white/5 transition">Cancel</Link>
        <SubmitButton mode={mode} />
      </div>
    </form>
  );
}