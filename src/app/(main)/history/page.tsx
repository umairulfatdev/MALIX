import Link from "next/link";
import { redirect } from "next/navigation";
import { History, Film, Compass, CheckCircle2, Clock, Eye } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getWatchHistory, getHistoryStats } from "@/server/actions/history";
import { HistoryCard } from "@/components/history/history-card";
import { ClearHistoryButton } from "@/components/history/clear-history-button";

export const metadata = {
  title: "Watch History",
  description: "Your watch history on MALIX",
};

export default async function HistoryPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const [history, stats] = await Promise.all([
    getWatchHistory(),
    getHistoryStats(),
  ]);

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-1 h-8 bg-gradient-to-b from-yellow-400 to-amber-600 rounded-full shadow-lg shadow-yellow-500/50" />
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #fde68a 0%, #fbbf24 50%, #f59e0b 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Watch History
              </span>
            </h1>
            <History className="text-yellow-500/50" size={28} />
          </div>
          <p className="text-zinc-400 ml-4">
            {history.length === 0
              ? "Your watch history will appear here"
              : `${history.length} item${history.length === 1 ? "" : "s"} in your history`}
          </p>
        </div>

        {history.length > 0 && <ClearHistoryButton />}
      </div>

      {/* Stats */}
      {stats && history.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-10 max-w-2xl">
          <div className="glass-cosmic rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye size={14} className="text-blue-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Total Watched
              </span>
            </div>
            <div className="text-2xl font-black text-white">{stats.total}</div>
          </div>

          <div className="glass-cosmic rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={14} className="text-emerald-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Completed
              </span>
            </div>
            <div className="text-2xl font-black text-white">
              {stats.completed}
            </div>
          </div>

          <div className="glass-cosmic rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={14} className="text-yellow-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                In Progress
              </span>
            </div>
            <div className="text-2xl font-black text-white">
              {stats.inProgress}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {history.length === 0 ? (
        <EmptyHistory />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
          {history.map((item) => (
            <HistoryCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyHistory() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-yellow-500/20 blur-2xl" />
        <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-yellow-300/20 via-yellow-500/20 to-amber-600/20 border border-yellow-500/30 flex items-center justify-center backdrop-blur">
          <History size={40} className="text-yellow-500/70" />
        </div>
      </div>

      <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
        No watch history yet
      </h3>
      <p className="text-zinc-400 text-sm md:text-base max-w-md mb-8">
        Start watching movies, dramas, and series. Your history will appear
        here to help you pick up where you left off.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/movies"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 text-black font-bold rounded-xl hover:shadow-lg hover:shadow-yellow-500/50 transition-all"
        >
          <Film size={18} />
          Browse Movies
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition"
        >
          <Compass size={18} />
          Explore Homepage
        </Link>
      </div>
    </div>
  );
}