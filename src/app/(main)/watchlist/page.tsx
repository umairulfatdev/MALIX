import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart, Film, Compass } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getUserWatchlist } from "@/server/actions/watchlist";
import { WatchlistCard } from "@/components/content/watchlist-card";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Watchlist",
  description: "Your saved content on MALIX",
};

export default async function WatchlistPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const watchlist = await getUserWatchlist();

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-12">
      <div className="mb-10">
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
              My Watchlist
            </span>
          </h1>
          <Heart className="text-yellow-500/50" size={28} />
        </div>
        <p className="text-zinc-400 ml-4">
          {watchlist.length === 0
            ? "Your saved content will appear here"
            : `${watchlist.length} item${watchlist.length === 1 ? "" : "s"} saved`}
        </p>
      </div>

      {watchlist.length === 0 ? (
        <EmptyWatchlist />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
          {watchlist.map((item) => (
            <WatchlistCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyWatchlist() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-yellow-500/20 blur-2xl" />
        <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-yellow-300/20 via-yellow-500/20 to-amber-600/20 border border-yellow-500/30 flex items-center justify-center backdrop-blur">
          <Heart size={40} className="text-yellow-500/70" />
        </div>
      </div>

      <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
        Your watchlist is empty
      </h3>
      <p className="text-zinc-400 text-sm md:text-base max-w-md mb-8">
        Start saving movies, dramas, and series to watch later.
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