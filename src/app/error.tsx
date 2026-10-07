"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-zinc-950 text-white">
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-full bg-red-500/20 blur-3xl" />
        <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-red-500/20 to-orange-600/10 border border-red-500/30 flex items-center justify-center">
          <AlertTriangle size={44} className="text-red-400" />
        </div>
      </div>

      <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 text-center">
        <span
          style={{
            background:
              "linear-gradient(135deg, #f87171 0%, #ef4444 50%, #dc2626 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Something went wrong
        </span>
      </h1>

      <div className="h-0.5 w-24 my-4 bg-gradient-to-r from-transparent via-red-500 to-transparent rounded-full" />

      <p className="text-zinc-400 text-base md:text-lg text-center max-w-md mb-10">
        An unexpected error occurred. Please try again or go back to the
        homepage.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 text-black font-bold rounded-xl hover:shadow-lg hover:shadow-yellow-500/50 transition-all"
        >
          <RefreshCw size={18} />
          Try Again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition"
        >
          <Home size={18} />
          Go Home
        </Link>
      </div>

      {process.env.NODE_ENV === "development" && error.message && (
        <div className="mt-10 max-w-2xl w-full">
          <div className="glass-cosmic rounded-xl p-4 border border-red-500/20">
            <p className="text-xs text-red-400 uppercase tracking-wider font-bold mb-2">
              Development Error Info
            </p>
            <pre className="text-xs text-red-300 whitespace-pre-wrap break-words">
              {error.message}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}