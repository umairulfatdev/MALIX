"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Video, Download } from "lucide-react";
import { toast } from "sonner";
import { createMusicAction, updateMusicAction, MusicFormState } from "@/server/actions/admin/music";

const initialState: MusicFormState = {};
const inputClass = "w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-white/10 text-white placeholder:text-zinc-500 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all text-sm";

function SubmitButton({ mode }: { mode: "create" | "edit" }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-cosmic flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-xl disabled:opacity-50">
      {pending ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> {mode === "create" ? "Save Music" : "Update Music"}</>}
    </button>
  );
}

export function MusicForm({ mode = "create", contentId, initialData }: { mode?: "create" | "edit", contentId?: string, initialData?: any }) {
  const router = useRouter();
  const action = mode === "edit" && contentId ? updateMusicAction.bind(null, contentId) : createMusicAction;
  const [state, formAction] = useActionState(action, initialState);

  useEffect(() => {
    if (state?.success) {
      toast.success("Music saved!");
      router.push("/admin/music");
      router.refresh();
    }
    if (state?.error) toast.error(state.error);
  }, [state, router]);

  // Edit ke waqt purana download link nikalne ke liye
  const defaultDownloadUrl = initialData?.downloadOptions?.[0]?.fileUrl || "";

  return (
    <form action={formAction} className="space-y-6 max-w-4xl">
      {state?.error && <div className="bg-red-500/10 border border-red-500/40 text-red-400 text-sm rounded-xl p-4">{state.error}</div>}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/music" className="w-10 h-10 rounded-lg glass-cosmic flex items-center justify-center hover:border-yellow-500/40 transition"><ArrowLeft size={18} className="text-zinc-300" /></Link>
          <div><h1 className="text-2xl font-bold text-white">{mode === "create" ? "Add New Music" : "Edit Music"}</h1></div>
        </div>
        <SubmitButton mode={mode} />
      </div>

      <div className="glass-cosmic rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-white/5">
          <div className="w-1 h-5 rounded-full bg-gradient-to-b from-yellow-400 to-amber-600" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">Music Details</h2>
        </div>
        
        <div>
          <label className="block mb-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">Song Title <span className="text-red-500">*</span></label>
          <input name="title" defaultValue={initialData?.title} required className={inputClass} placeholder="e.g., Shape of You" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">Artist Name</label>
            <input name="artist" defaultValue={initialData?.music?.artist} className={inputClass} placeholder="e.g., Ed Sheeran" />
          </div>
          <div>
            <label className="block mb-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">Album</label>
            <input name="album" defaultValue={initialData?.music?.album} className={inputClass} placeholder="e.g., Divide" />
          </div>
        </div>

        <div>
          <label className="block mb-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">Poster URL (Image)</label>
          <input name="posterUrl" defaultValue={initialData?.posterUrl} type="url" className={inputClass} placeholder="https://..." />
        </div>
      </div>

      <div className="glass-cosmic rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-white/5">
          <div className="w-1 h-5 rounded-full bg-gradient-to-b from-yellow-400 to-amber-600" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">Media & Download</h2>
        </div>
        
        <div>
          <label className="block mb-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">Streaming URL (For Player) <span className="text-red-500">*</span></label>
          <div className="relative"><Video size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-500 z-10" /><input name="videoUrl" defaultValue={initialData?.videoUrl} type="url" required className={`${inputClass} pl-12`} placeholder="https://..." /></div>
        </div>

        {/* 👇 NAYA DOWNLOAD URL BOX 👇 */}
        <div>
          <label className="block mb-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">Download URL (Optional)</label>
          <div className="relative"><Download size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 z-10" /><input name="downloadUrl" defaultValue={defaultDownloadUrl} type="url" className={`${inputClass} pl-12`} placeholder="https://..." /></div>
        </div>
      </div>

      <div className="glass-cosmic rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-white/5">
          <div className="w-1 h-5 rounded-full bg-gradient-to-b from-yellow-400 to-amber-600" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">Settings</h2>
        </div>
        <div>
          <label className="block mb-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">Status</label>
          <select name="status" defaultValue={initialData?.status || "PUBLISHED"} className={`${inputClass} cursor-pointer`}>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
        <Link href="/admin/music" className="px-6 py-3 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white hover:bg-white/5 transition">Cancel</Link>
        <SubmitButton mode={mode} />
      </div>
    </form>
  );
}