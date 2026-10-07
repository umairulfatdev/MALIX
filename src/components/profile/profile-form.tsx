"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Save, Loader2 } from "lucide-react";
import {
  updateProfileAction,
  ProfileFormState,
} from "@/server/actions/profile";

interface ProfileFormProps {
  initialData: {
    name: string;
    avatarUrl: string | null;
    bio: string | null;
    country: string | null;
  };
}

const initialState: ProfileFormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-cosmic flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl disabled:opacity-50"
    >
      {pending ? (
        <>
          <Loader2 size={14} className="animate-spin" />
          Saving...
        </>
      ) : (
        <>
          <Save size={14} />
          Save Changes
        </>
      )}
    </button>
  );
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [state, formAction] = useActionState(updateProfileAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <div className="bg-red-500/10 border border-red-500/40 text-red-400 text-sm rounded-xl p-3">
          {state.error}
        </div>
      )}

      {state?.success && (
        <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-sm rounded-xl p-3">
          Profile updated successfully!
        </div>
      )}

      <div>
        <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 block">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          name="name"
          defaultValue={initialData.name}
          required
          minLength={2}
          maxLength={80}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500/50"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 block">
          Avatar URL
        </label>
        <input
          name="avatarUrl"
          type="url"
          defaultValue={initialData.avatarUrl || ""}
          placeholder="https://..."
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500/50"
        />
        <p className="text-xs text-zinc-500 mt-1">
          Paste a link to your profile image
        </p>
      </div>

      <div>
        <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 block">
          Country
        </label>
        <input
          name="country"
          defaultValue={initialData.country || ""}
          placeholder="e.g., Pakistan"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500/50"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 block">
          Bio
        </label>
        <textarea
          name="bio"
          defaultValue={initialData.bio || ""}
          rows={3}
          maxLength={300}
          placeholder="Tell us about yourself..."
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500/50 resize-none"
        />
      </div>

      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}