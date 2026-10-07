import Link from "next/link";
import {
  Users,
  Film,
  Tv,
  Play,
  ListVideo,
  Sparkles,
  Download,
  MessageSquare,
  Heart,
  Eye,
  ArrowUpRight,
  Star,
} from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";
import {
  getDashboardStats,
  getRecentUsers,
  getRecentContent,
  getMostViewedContent,
} from "@/lib/data/admin-stats";

export const metadata = {
  title: "Dashboard",
};

export default async function AdminDashboardPage() {
  const [stats, recentUsers, recentContent, mostViewed] = await Promise.all([
    getDashboardStats(),
    getRecentUsers(5),
    getRecentContent(5),
    getMostViewedContent(5),
  ]);

  return (
    <div className="space-y-8 max-w-[1600px]">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
          <span
            style={{
              background:
                "linear-gradient(135deg, #fde68a 0%, #fbbf24 50%, #f59e0b 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Dashboard
          </span>
        </h1>
        <p className="text-zinc-400 text-sm">
          Overview of your MALIX platform
        </p>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Users"
          value={stats.totalUsers}
          icon={Users}
          color="blue"
          href="/admin/users"
        />
        <StatCard
          label="Total Movies"
          value={stats.totalMovies}
          icon={Film}
          color="gold"
          href="/admin/movies"
        />
        <StatCard
          label="Total Dramas"
          value={stats.totalDramas}
          icon={Tv}
          color="purple"
          href="/admin/dramas"
        />
        <StatCard
          label="Total Series"
          value={stats.totalSeries}
          icon={Play}
          color="green"
          href="/admin/series"
        />
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          label="Episodes"
          value={stats.totalEpisodes}
          icon={ListVideo}
          color="blue"
        />
        <StatCard
          label="Seasons"
          value={stats.totalSeasons}
          icon={Play}
          color="purple"
        />
        <StatCard
          label="Genres"
          value={stats.totalGenres}
          icon={Sparkles}
          color="gold"
          href="/admin/genres"
        />
        <StatCard
          label="Downloads"
          value={stats.totalDownloads}
          icon={Download}
          color="red"
        />
        <StatCard
          label="Watch Sessions"
          value={stats.totalWatchSessions}
          icon={Eye}
          color="green"
        />
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Content */}
        <div className="glass-cosmic rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Film size={18} className="text-yellow-500" />
              <h2 className="font-bold text-white">Recent Content</h2>
            </div>
            <Link
              href="/admin/movies"
              className="text-xs text-yellow-500 hover:text-yellow-400 font-medium flex items-center gap-1"
            >
              View all <ArrowUpRight size={12} />
            </Link>
          </div>

          <div className="divide-y divide-white/5">
            {recentContent.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-sm">
                No content yet
              </div>
            ) : (
              recentContent.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-4 hover:bg-white/5 transition-colors"
                >
                  <div className="w-10 h-14 rounded-lg bg-zinc-900 overflow-hidden flex-shrink-0">
                    {item.posterUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.posterUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[8px] text-zinc-700 font-bold">
                        MALIX
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">
                      {item.title}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-500">
                      <span className="px-1.5 py-0.5 rounded bg-white/5 text-[10px]">
                        {item.type}
                      </span>
                      {item.releaseYear && <span>{item.releaseYear}</span>}
                    </div>
                  </div>
                  {item.status === "PUBLISHED" ? (
                    <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      LIVE
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-zinc-400 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                      {item.status}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="glass-cosmic rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-blue-400" />
              <h2 className="font-bold text-white">Recent Users</h2>
            </div>
            <Link
              href="/admin/users"
              className="text-xs text-yellow-500 hover:text-yellow-400 font-medium flex items-center gap-1"
            >
              View all <ArrowUpRight size={12} />
            </Link>
          </div>

          <div className="divide-y divide-white/5">
            {recentUsers.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-sm">
                No users yet
              </div>
            ) : (
              recentUsers.map((u) => {
                const initials = u.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();

                return (
                  <div
                    key={u.id}
                    className="flex items-center gap-3 p-4 hover:bg-white/5 transition-colors"
                  >
                    {u.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={u.avatarUrl}
                        alt={u.name}
                        className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-600 flex items-center justify-center text-xs font-black text-black flex-shrink-0">
                        {initials}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white truncate">
                        {u.name}
                      </div>
                      <div className="text-xs text-zinc-500 truncate">
                        {u.email}
                      </div>
                    </div>
                    {u.role === "ADMIN" ? (
                      <span className="text-[10px] font-bold text-yellow-400 px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                        ADMIN
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-zinc-400 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                        USER
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Most Viewed */}
      <div className="glass-cosmic rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Eye size={18} className="text-emerald-400" />
            <h2 className="font-bold text-white">Most Viewed Content</h2>
          </div>
        </div>

        <div className="divide-y divide-white/5">
          {mostViewed.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-sm">
              No views recorded yet
            </div>
          ) : (
            mostViewed.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-4 hover:bg-white/5 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500/20 to-amber-600/10 border border-yellow-500/30 flex items-center justify-center text-xs font-black text-yellow-400 flex-shrink-0">
                  #{idx + 1}
                </div>
                <div className="w-10 h-14 rounded-lg bg-zinc-900 overflow-hidden flex-shrink-0">
                  {item.posterUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.posterUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[8px] text-zinc-700 font-bold">
                      MALIX
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">
                    {item.title}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-zinc-500">
                    <span className="px-1.5 py-0.5 rounded bg-white/5 text-[10px]">
                      {item.type}
                    </span>
                    {item.avgRating && item.avgRating > 0 && (
                      <span className="flex items-center gap-1">
                        <Star
                          size={10}
                          className="fill-yellow-400 text-yellow-400"
                        />
                        {item.avgRating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold text-emerald-400">
                    {item.totalViews.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider">
                    views
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          label="Total Reviews"
          value={stats.totalReviews}
          icon={MessageSquare}
          color="purple"
          href="/admin/reviews"
        />
        <StatCard
          label="Watchlist Items"
          value={stats.totalWatchlistItems}
          icon={Heart}
          color="red"
        />
      </div>
    </div>
  );
}