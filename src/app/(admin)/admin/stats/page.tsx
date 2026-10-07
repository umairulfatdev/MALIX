import Link from "next/link";
import {
  BarChart3,
  Users,
  Film,
  Play,
  Eye,
  Download,
  Star,
  MessageSquare,
  Heart,
  Sparkles,
  TrendingUp,
  Tv,
} from "lucide-react";
import {
  getStatsOverview,
  getContentTypeBreakdown,
  getTopRatedContent,
  getMostViewedContentStats,
  getRecentActivity,
} from "@/server/actions/admin/stats";
import { StatCard } from "@/components/admin/stat-card";

export const metadata = { title: "Statistics" };

export default async function AdminStatsPage() {
  const [overview, breakdown, topRated, mostViewed, activity] =
    await Promise.all([
      getStatsOverview(),
      getContentTypeBreakdown(),
      getTopRatedContent(5),
      getMostViewedContentStats(5),
      getRecentActivity(8),
    ]);

  if (!overview) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-400">Failed to load statistics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px]">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
          <BarChart3 size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white">
            Statistics
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Platform-wide analytics and insights
          </p>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Users"
          value={overview.totalUsers}
          icon={Users}
          color="blue"
          href="/admin/users"
        />
        <StatCard
          label="Total Content"
          value={overview.totalContent}
          icon={Film}
          color="gold"
        />
        <StatCard
          label="Total Views"
          value={overview.totalViews}
          icon={Eye}
          color="green"
        />
        <StatCard
          label="Total Downloads"
          value={overview.totalDownloads}
          icon={Download}
          color="red"
          href="/admin/downloads"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Movies" value={overview.totalMovies} icon={Film} color="gold" />
        <StatCard label="Dramas" value={overview.totalDramas} icon={Tv} color="purple" />
        <StatCard label="Series" value={overview.totalSeries} icon={Play} color="green" />
        <StatCard label="Anime" value={overview.totalAnime} icon={Sparkles} color="blue" />
        <StatCard label="Episodes" value={overview.totalEpisodes} icon={Play} color="purple" />
        <StatCard label="Reviews" value={overview.totalReviews} icon={MessageSquare} color="gold" />
      </div>

      {/* Content Breakdown + Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Type Breakdown */}
        <div className="glass-cosmic rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5 pb-3 border-b border-white/5">
            <TrendingUp size={16} className="text-yellow-500" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Content by Type
            </h2>
          </div>

          <div className="space-y-4">
            {breakdown.map((item) => {
              const percentage =
                overview.totalContent > 0
                  ? (item.count / overview.totalContent) * 100
                  : 0;

              const colorMap: Record<string, string> = {
                MOVIE: "from-yellow-400 to-amber-600",
                DRAMA: "from-purple-400 to-purple-600",
                SERIES: "from-emerald-400 to-emerald-600",
                ANIME: "from-cyan-400 to-blue-600",
                DOCUMENTARY: "from-blue-400 to-blue-600",
                SHORT_FILM: "from-pink-400 to-pink-600",
                TRAILER: "from-zinc-400 to-zinc-600",
              };

              return (
                <div key={item.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold text-white capitalize">
                      {item.name.toLowerCase()}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {item.count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${
                        colorMap[item.name] || "from-yellow-400 to-amber-600"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Rated */}
        <div className="glass-cosmic rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5 pb-3 border-b border-white/5">
            <Star size={16} className="text-yellow-500" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Top Rated Content
            </h2>
          </div>

          {topRated.length === 0 ? (
            <p className="text-zinc-500 text-sm text-center py-6">
              No ratings yet
            </p>
          ) : (
            <div className="space-y-2">
              {topRated.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition"
                >
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-yellow-500/20 to-amber-600/10 border border-yellow-500/30 flex items-center justify-center text-[10px] font-black text-yellow-400">
                    #{idx + 1}
                  </div>
                  <div className="w-8 h-12 rounded-lg bg-zinc-900 overflow-hidden flex-shrink-0">
                    {item.posterUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.posterUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[6px] text-zinc-700 font-bold">
                        MALIX
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">
                      {item.title}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-zinc-500">
                      {item.type}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-1 text-sm font-bold text-yellow-400">
                      <Star size={11} className="fill-yellow-400" />
                      {item.avgRating?.toFixed(1)}
                    </div>
                    <div className="text-[10px] text-zinc-500">
                      {item.totalRatings} ratings
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Most Viewed + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Viewed */}
        <div className="glass-cosmic rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5 pb-3 border-b border-white/5">
            <Eye size={16} className="text-emerald-500" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Most Viewed Content
            </h2>
          </div>

          {mostViewed.length === 0 ? (
            <p className="text-zinc-500 text-sm text-center py-6">
              No views yet
            </p>
          ) : (
            <div className="space-y-2">
              {mostViewed.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition"
                >
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-600/10 border border-emerald-500/30 flex items-center justify-center text-[10px] font-black text-emerald-400">
                    #{idx + 1}
                  </div>
                  <div className="w-8 h-12 rounded-lg bg-zinc-900 overflow-hidden flex-shrink-0">
                    {item.posterUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.posterUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[6px] text-zinc-700 font-bold">
                        MALIX
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">
                      {item.title}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-zinc-500">
                      {item.type}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-bold text-emerald-400">
                      {item.totalViews.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-zinc-500">views</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="glass-cosmic rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5 pb-3 border-b border-white/5">
            <Sparkles size={16} className="text-purple-500" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Recent Activity
            </h2>
          </div>

          {activity.length === 0 ? (
            <p className="text-zinc-500 text-sm text-center py-6">
              No activity yet
            </p>
          ) : (
            <div className="space-y-3">
              {activity.map((a, idx) => {
                const initials = a.user
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();

                return (
                  <div key={idx} className="flex items-center gap-3">
                    {a.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={a.avatarUrl}
                        alt={a.user}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-600 flex items-center justify-center text-[10px] font-black text-black flex-shrink-0">
                        {initials}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-zinc-400 truncate">
                        <span className="text-white font-semibold">
                          {a.user}
                        </span>{" "}
                        {a.detail}
                      </div>
                      <div className="text-[10px] text-zinc-600 mt-0.5">
                        {new Date(a.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Engagement Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Ratings"
          value={overview.totalRatings}
          icon={Star}
          color="gold"
        />
        <StatCard
          label="Total Reviews"
          value={overview.totalReviews}
          icon={MessageSquare}
          color="purple"
        />
        <StatCard
          label="Watchlist Items"
          value={overview.totalWatchlist}
          icon={Heart}
          color="red"
        />
        <StatCard
          label="Downloads"
          value={overview.totalDownloads}
          icon={Download}
          color="green"
        />
      </div>
    </div>
  );
}