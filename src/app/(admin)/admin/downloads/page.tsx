import Link from "next/link";
import {
  Download,
  Search,
  TrendingUp,
  Calendar,
  Clock,
  Film,
  Star,
} from "lucide-react";
import {
  getDownloadStats,
  getAdminDownloads,
  getMostDownloadedContent,
  getDownloadsByQuality,
} from "@/server/actions/admin/downloads";
import { StatCard } from "@/components/admin/stat-card";

export const metadata = { title: "Downloads" };

interface Props {
  searchParams: Promise<{
    search?: string;
    quality?: string;
    page?: string;
  }>;
}

export default async function AdminDownloadsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));

  const [stats, result, mostDownloaded, byQuality] = await Promise.all([
    getDownloadStats(),
    getAdminDownloads({
      search: params.search,
      quality: params.quality,
      page,
      perPage: 20,
    }),
    getMostDownloadedContent(5),
    getDownloadsByQuality(),
  ]);

  return (
    <div className="space-y-6 max-w-[1600px]">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
          <Download size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white">
            Downloads
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            {result.total} total downloads
          </p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Downloads"
            value={stats.total}
            icon={Download}
            color="green"
          />
          <StatCard
            label="Today"
            value={stats.today}
            icon={Calendar}
            color="gold"
          />
          <StatCard
            label="This Week"
            value={stats.week}
            icon={TrendingUp}
            color="blue"
          />
          <StatCard
            label="This Month"
            value={stats.month}
            icon={Clock}
            color="purple"
          />
        </div>
      )}

      {/* Quality Breakdown + Most Downloaded */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quality */}
        <div className="glass-cosmic rounded-2xl p-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4 pb-3 border-b border-white/5">
            Downloads by Quality
          </h3>
          {byQuality.length === 0 ? (
            <p className="text-zinc-500 text-sm text-center py-6">
              No data yet
            </p>
          ) : (
            <div className="space-y-3">
              {byQuality.map((item) => {
                const percentage =
                  stats && stats.total > 0
                    ? (item.count / stats.total) * 100
                    : 0;
                return (
                  <div key={item.quality}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-semibold text-white">
                        {item.quality}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {item.count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-400 to-amber-600"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Most Downloaded */}
        <div className="glass-cosmic rounded-2xl p-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4 pb-3 border-b border-white/5">
            Most Downloaded Content
          </h3>
          {mostDownloaded.length === 0 ? (
            <p className="text-zinc-500 text-sm text-center py-6">
              No data yet
            </p>
          ) : (
            <div className="space-y-2">
              {mostDownloaded.map((item, idx) => (
                <div
                  key={item.content!.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition"
                >
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-yellow-500/20 to-amber-600/10 border border-yellow-500/30 flex items-center justify-center text-[10px] font-black text-yellow-400">
                    #{idx + 1}
                  </div>
                  <div className="w-8 h-12 rounded-lg bg-zinc-900 overflow-hidden flex-shrink-0">
                    {item.content!.posterUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.content!.posterUrl}
                        alt={item.content!.title}
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
                      {item.content!.title}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] uppercase tracking-wider text-zinc-500">
                        {item.content!.type}
                      </span>
                      {item.content!.avgRating && item.content!.avgRating > 0 && (
                        <span className="flex items-center gap-1 text-[10px] text-yellow-400">
                          <Star size={9} className="fill-yellow-400" />
                          {item.content!.avgRating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-bold text-emerald-400">
                      {item.downloadCount}
                    </div>
                    <div className="text-[9px] uppercase tracking-wider text-zinc-500">
                      downloads
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="glass-cosmic rounded-2xl p-4">
        <form className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              type="search"
              name="search"
              defaultValue={params.search || ""}
              placeholder="Search by user or content..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500/50"
            />
          </div>

          <select
            name="quality"
            defaultValue={params.quality || "ALL"}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500/50 cursor-pointer"
          >
            <option value="ALL" className="bg-zinc-900">All Qualities</option>
            <option value="480p" className="bg-zinc-900">480p</option>
            <option value="720p" className="bg-zinc-900">720p</option>
            <option value="1080p" className="bg-zinc-900">1080p</option>
          </select>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-white transition"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Downloads Table */}
      <div className="glass-cosmic rounded-2xl overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/5">
              <tr className="text-left">
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  User
                </th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Content
                </th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Quality
                </th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Status
                </th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500 text-right">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {result.downloads.map((d) => {
                const initials = d.user.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();

                return (
                  <tr key={d.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {d.user.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={d.user.avatarUrl}
                            alt={d.user.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-600 flex items-center justify-center text-[10px] font-black text-black">
                            {initials}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-white truncate">
                            {d.user.name}
                          </div>
                          <div className="text-xs text-zinc-500 truncate">
                            {d.user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/content/${d.content.slug}`}
                        className="flex items-center gap-2 hover:text-yellow-400 transition group"
                      >
                        <div className="w-8 h-12 rounded bg-zinc-900 overflow-hidden flex-shrink-0">
                          {d.content.posterUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={d.content.posterUrl}
                              alt={d.content.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[6px] text-zinc-700 font-bold">
                              MALIX
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-white truncate max-w-xs group-hover:text-yellow-400 transition">
                            {d.content.title}
                          </div>
                          <div className="text-[10px] uppercase tracking-wider text-zinc-500">
                            {d.content.type}
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-1 rounded-md text-xs font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                        {d.quality}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {d.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-xs text-zinc-400">
                        {new Date(d.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="md:hidden divide-y divide-white/5">
          {result.downloads.map((d) => (
            <div key={d.id} className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                {d.user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={d.user.avatarUrl}
                    alt={d.user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-300 to-amber-600 flex items-center justify-center text-[10px] font-black text-black">
                    {d.user.name[0].toUpperCase()}
                  </div>
                )}
                <div className="text-sm font-semibold text-white">
                  {d.user.name}
                </div>
              </div>
              <div className="text-xs text-zinc-400">
                Downloaded <span className="text-white">{d.content.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                  {d.quality}
                </span>
                <span className="text-[10px] text-zinc-500">
                  {new Date(d.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {result.downloads.length === 0 && (
          <div className="p-12 text-center">
            <Download size={32} className="text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">No downloads yet</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {result.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: result.totalPages }, (_, i) => i + 1).map(
            (p) => {
              const qs = new URLSearchParams();
              if (params.search) qs.set("search", params.search);
              if (params.quality && params.quality !== "ALL")
                qs.set("quality", params.quality);
              if (p > 1) qs.set("page", String(p));
              const href = `/admin/downloads${qs.toString() ? `?${qs}` : ""}`;

              return (
                <Link
                  key={p}
                  href={href}
                  className={`min-w-[36px] h-9 flex items-center justify-center rounded-lg text-sm font-medium transition ${
                    p === result.page
                      ? "bg-gradient-to-br from-yellow-400 to-amber-600 text-black"
                      : "bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10"
                  }`}
                >
                  {p}
                </Link>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}