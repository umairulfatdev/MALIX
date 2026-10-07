"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { registerAction, AuthActionState } from "@/server/actions/auth";

const initial: AuthActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
    >
      {pending ? "Creating account..." : "Create Account"}
    </button>
  );
}

export default function RegisterPage() {
  const [state, action] = useActionState(registerAction, initial);

  return (
    <div className="bg-zinc-900/80 backdrop-blur border border-zinc-800 rounded-2xl p-8 shadow-2xl">
      <Link
        href="/"
        className="block text-3xl font-black text-red-600 mb-6 text-center tracking-widest"
      >
        MALIX
      </Link>
      <h1 className="text-2xl font-bold text-white mb-2">
        Create your account
      </h1>
      <p className="text-zinc-400 text-sm mb-6">
        Start watching movies, dramas and series.
      </p>

      {state?.error && (
        <div className="bg-red-500/10 border border-red-500/40 text-red-400 text-sm rounded-lg p-3 mb-4">
          {state.error}
        </div>
      )}

      <form action={action} className="space-y-4">
        <div>
          <label className="text-sm text-zinc-300 block mb-1">
            Full Name
          </label>
          <input
            name="name"
            required
            minLength={2}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-red-600"
          />
        </div>
        <div>
          <label className="text-sm text-zinc-300 block mb-1">Email</label>
          <input
            name="email"
            type="email"
            required
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-red-600"
          />
        </div>
        <div>
          <label className="text-sm text-zinc-300 block mb-1">
            Password
          </label>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-red-600"
          />
        </div>
        <div>
          <label className="text-sm text-zinc-300 block mb-1">
            Confirm Password
          </label>
          <input
            name="confirmPassword"
            type="password"
            required
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-red-600"
          />
        </div>
        <SubmitButton />
      </form>

      <p className="text-zinc-400 text-sm mt-6 text-center">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-red-500 hover:underline font-medium"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}