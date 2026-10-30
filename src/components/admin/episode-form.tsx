"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Video, ListVideo } from "lucide-react";
import { toast } from "sonner";
import { createEpisodeAction, EpisodeFormState } from "@/server/actions/admin/episodes";

interface SeriesOption {
  id: string;
  content: { title: string };
  seasons: { id: string; seasonNumber: number; title: string | null }[];
}

interface EpisodeFormProps {
  series: SeriesOption[];
}

const initialState: EpisodeFormState = {};
const inputClass = "w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-white/10 text-white placeholder:text-zinc-500 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all text-sm";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-cosmic flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-xl disabled:opacity-50">
      {pending ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> Create Episode</>}
    </button>
  );
}

export function EpisodeForm({ series }: EpisodeFormProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(createEpisodeAction, initialState);

  useEffect(() => {
    if (state?.success) {
      toast.success("Episode created successfully!");
      router.push("/admin/episodes");
      router.refresh();
    }
    if (state?.error) toast.error(state.error);
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-6 max-w-4xl">
      {state?.error && <div className="bg-red-500/10 border border-red-500/40 text-red-400 text-sm rounded-xl p-4">{state.error}</div>}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/episodes" className="w-10 h-10 rounded-lg glass-cosmic flex items-center justify-center hover:border-yellow-500/40 transition"><ArrowLeft size={18} className="text-zinc-300" /></Link>
          <div><h1 className="text-2xl font-bold text-white">Add New Episode</h1></div>
        </div>
        <SubmitButton />
      </div>

      <div className="glass-cosmic rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-white/5">
          <div className="w-1 h-5 rounded-full bg-gradient-to-b from-yellow-400 to-amber-600" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">Episode Details</h2>
        </div>
        
        <div>
          <label className="block mb-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">Select Series & Season <span className="text-red-500">*</span></label>
          <select name="seasonId" required className={`${inputClass} cursor-pointer`}>
            <option value="">-- Choose Series / Season --</option>
            {series.map((s) => (
              <optgroup key={s.id} label={s.content.title}>
                {s.seasons.map((season) => (
                  <option key={season.id} value={season.id}>
                    {season.title || `Season ${season.seasonNumber}`}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">Episode Number <span className="text-red-500">*</span></label>
            <input name="episodeNum" type="number" min="1" required className={inputClass} placeholder="1" />
          </div>
          <div>
            <label className="block mb-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">Duration (minutes)</label>
            <input name="duration" type="number" min="1" className={inputClass} placeholder="45" />
          </div>
        </div>

        <div>
          <label className="block mb-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">Episode Title <span className="text-red-500">*</span></label>
          <input name="title" required className={inputClass} placeholder="e.g., The Beginning" />
        </div>

        <div>
          <label className="block mb-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">Description</label>
          <textarea name="description" rows={3} className={`${inputClass} resize-none`} placeholder="Episode description..." />
        </div>
      </div>

      <div className="glass-cosmic rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-white/5">
          <div className="w-1 h-5 rounded-full bg-gradient-to-b from-yellow-400 to-amber-600" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">Video & Media</h2>
        </div>
        
        <div>
          <label className="block mb-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">Video URL (Streaming)</label>
          <div className="relative"><Video size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-500 z-10" /><input name="videoUrl" type="url" className={`${inputClass} pl-12`} placeholder="https://..." /></div>
        </div>

        <div>
          <label className="block mb-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">Thumbnail URL</label>
          <input name="thumbnailUrl" type="url" className={inputClass} placeholder="https://..." />
        </div>
      </div>

      <div className="glass-cosmic rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-white/5">
          <div className="w-1 h-5 rounded-full bg-gradient-to-b from-yellow-400 to-amber-600" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">Settings</h2>
        </div>
        <div>
          <label className="block mb-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">Status</label>
          <select name="status" defaultValue="PUBLISHED" className={`${inputClass} cursor-pointer`}>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
        <Link href="/admin/episodes" className="px-6 py-3 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white hover:bg-white/5 transition">Cancel</Link>
        <SubmitButton />
      </div>
    </form>
  );
}