export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white">
      <div className="relative w-32 h-32 mb-8">
        <div className="absolute inset-0 rounded-full border-2 border-yellow-500/20 animate-orbit-slow" />

        <div
          className="absolute inset-4 rounded-full border-2 border-yellow-400/40 animate-orbit-slow"
          style={{ animationDirection: "reverse", animationDuration: "3s" }}
        />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-300 to-amber-600 shadow-[0_0_30px_rgba(251,191,36,0.8)] animate-pulse" />
        </div>

        <div className="absolute inset-0 animate-orbit-slow">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(251,191,36,1)]" />
        </div>
      </div>

      <div className="text-xl font-black tracking-cinematic">
        <span
          style={{
            background:
              "linear-gradient(135deg, #fde68a 0%, #fbbf24 50%, #f59e0b 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          MALIX
        </span>
      </div>

      <p className="text-xs text-zinc-500 tracking-widest uppercase mt-3">
        Loading...
      </p>
    </div>
  );
}