"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Lock, Loader2 } from "lucide-react";
import {
  changePasswordAction,
  ProfileFormState,
} from "@/server/actions/profile";

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
          Updating...
        </>
      ) : (
        <>
          <Lock size={14} />
          Change Password
        </>
      )}
    </button>
  );
}

export function PasswordForm() {
  const [state, formAction] = useActionState(changePasswordAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <div className="bg-red-500/10 border border-red-500/40 text-red-400 text-sm rounded-xl p-3">
          {state.error}
        </div>
      )}

      {state?.success && (
        <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-sm rounded-xl p-3">
          Password changed successfully!
        </div>
      )}

      <div>
        <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 block">
          Current Password <span className="text-red-500">*</span>
        </label>
        <input
          name="currentPassword"
          type="password"
          required
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500/50"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 block">
          New Password <span className="text-red-500">*</span>
        </label>
        <input
          name="newPassword"
          type="password"
          required
          minLength={8}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500/50"
        />
        <p className="text-xs text-zinc-500 mt-1">Minimum 8 characters</p>
      </div>

      <div>
        <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 block">
          Confirm New Password <span className="text-red-500">*</span>
        </label>
        <input
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500/50"
        />
      </div>

      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}