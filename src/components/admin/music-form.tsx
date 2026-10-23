"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Music, Video } from "lucide-react";
import type { ContentFormState } from "@/server/actions/admin/music";

interface Props {
  action: (prev: ContentFormState, formData: FormData) => Promise<ContentFormState>;
  defaultValues?: any;
}

const inputClass = "w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-white/10 text-white placeholder:text-zinc-500 focus:outline-none focus:border-yellow-500 text-sm";

export default function MusicForm({ action, defaultValues }: Props) {
  const router = useRouter();
  const [state, formAction] = useActionState(action, {});

  if (state?.success) {
    router.push("/admin/music");
  }

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && <div className="bg-red-500/10 border border-red-500/40 text-red-400 p-4 rounded-lg">{state.error}</div>}

      <div>
        <label className="block text-sm text-zinc-300 mb-2">Title *</label>
        <input name="title" required defaultValue={defaultValues?.title} className={inputClass} placeholder="Song name" />
      </div>

      <div>
        <label className="block text-sm text-zinc-300 mb-2">Description *</label>
        <textarea name="description" required defaultValue={defaultValues?.description} className={`${inputClass} resize-none`} rows={3} placeholder="Song description" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-zinc-300 mb-2">Artist</label>
          <input name="artist" defaultValue={defaultValues?.music?.artist} className={inputClass} placeholder="Singer name" />
        </div>
        <div>
          <label className="block text-sm text-zinc-300 mb-2">Album</label>
          <input name="album" defaultValue={defaultValues?.music?.album} className={inputClass} placeholder="Album name" />
        </div>
        <div>
          <label className="block text-sm text-zinc-300 mb-2">Release Year</label>
          <input name="releaseYear" type="number" defaultValue={defaultValues?.releaseYear} className={inputClass} placeholder="2024" />
        </div>
      </div>

      <div>
        <label className="block text-sm text-zinc-300 mb-2">Audio/Video URL *</label>
        <input name="videoUrl" type="url" required defaultValue={defaultValues?.videoUrl} className={inputClass} placeholder="https://..." />
      </div>

      <div>
        <label className="block text-sm text-zinc-300 mb-2">Poster URL</label>
        <input name="posterUrl" type="url" defaultValue={defaultValues?.posterUrl} className={inputClass} placeholder="https://..." />
      </div>

      <div>
        <label className="block text-sm text-zinc-300 mb-2">Status</label>
        <select name="status" defaultValue={defaultValues?.status || "DRAFT"} className={inputClass}>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
        </select>
      </div>

      <div className="flex gap-3">
        <Link href="/admin/music" className="px-6 py-3 rounded-xl border border-white/10 text-white">Cancel</Link>
        <button type="submit" className="flex items-center gap-2 px-6 py-3 bg-yellow-500 text-black font-bold rounded-xl">
          <Save size={18} /> Save
        </button>
      </div>
    </form>
  );
}