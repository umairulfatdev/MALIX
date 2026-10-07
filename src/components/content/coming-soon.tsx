import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";

interface ComingSoonProps {
  title: string;
  description?: string;
}

export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-20">
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-full bg-yellow-500/30 blur-3xl" />
        <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-600 flex items-center justify-center shadow-2xl shadow-yellow-500/50">
          <Sparkles size={36} className="text-black" />
        </div>
      </div>

      <h1 className="text-3xl md:text-5xl font-black tracking-tight text-center mb-4">
        <span
          style={{
            background:
              "linear-gradient(135deg, #fde68a 0%, #fbbf24 50%, #f59e0b 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {title}
        </span>
      </h1>

      <div className="h-0.5 w-24 my-4 bg-gradient-to-r from-transparent via-yellow-400 to-transparent rounded-full shadow-lg shadow-yellow-500/50" />

      <p className="text-zinc-400 text-base md:text-lg text-center max-w-md mb-10">
        {description || "Yeh section jald aa raha hai."}
      </p>

      <Link
        href="/"
        className="btn-cosmic flex items-center gap-2 px-6 py-3 text-base font-bold rounded-xl"
      >
        <ArrowLeft size={18} />
        Back to Home
      </Link>
    </div>
  );
}