"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save } from "lucide-react";
import type { AdFormState } from "@/server/actions/admin/ads";

interface Props {
  action: (prev: AdFormState, formData: FormData) => Promise<AdFormState>;
  defaultValues?: any;
}

const inputClass = "w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-white/10 text-white placeholder:text-zinc-500 focus:outline-none focus:border-yellow-500 text-sm";

export default function AdForm({ action, defaultValues }: Props) {
  const router = useRouter();
  const [state, formAction] = useActionState(action, {});

  if (state?.success) {
    router.push("/admin/ads");
  }

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && <div className="bg-red-500/10 border border-red-500/40 text-red-400 p-4 rounded-lg">{state.error}</div>}

      <div>
        <label className="block text-sm text-zinc-300 mb-2">Title *</label>
        <input name="title" required defaultValue={defaultValues?.title} className={inputClass} placeholder="Ad title" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-zinc-300 mb-2">Type</label>
          <select name="type" defaultValue={defaultValues?.type || "banner"} className={inputClass}>
            <option value="banner">Banner</option>
            <option value="pre-roll">Pre-roll Video</option>
            <option value="popup">Popup</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-zinc-300 mb-2">Position</label>
          <select name="position" defaultValue={defaultValues?.position || "homepage"} className={inputClass}>
            <option value="homepage">Homepage</option>
            <option value="watch">Watch Page</option>
            <option value="detail">Detail Page</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm text-zinc-300 mb-2">Image URL (Banner)</label>
        <input name="imageUrl" defaultValue={defaultValues?.imageUrl} className={inputClass} placeholder="https://..." />
      </div>

      <div>
        <label className="block text-sm text-zinc-300 mb-2">Video URL (Pre-roll)</label>
        <input name="videoUrl" defaultValue={defaultValues?.videoUrl} className={inputClass} placeholder="https://..." />
      </div>

      <div>
        <label className="block text-sm text-zinc-300 mb-2">Click URL</label>
        <input name="linkUrl" defaultValue={defaultValues?.linkUrl} className={inputClass} placeholder="https://..." />
      </div>

      <div>
        <label className="flex items-center gap-2 text-zinc-300">
          <input type="checkbox" name="isActive" defaultChecked={defaultValues?.isActive ?? true} className="w-4 h-4 accent-yellow-500" />
          Active
        </label>
      </div>

      <div className="flex gap-3">
        <Link href="/admin/ads" className="px-6 py-3 rounded-xl border border-white/10 text-white">Cancel</Link>
        <button type="submit" className="flex items-center gap-2 px-6 py-3 bg-yellow-500 text-black font-bold rounded-xl">
          <Save size={18} /> Save Ad
        </button>
      </div>
    </form>
  );
}