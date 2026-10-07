import Link from "next/link";
import { Video, Search, Eye, EyeOff, ListVideo } from "lucide-react";
import {
  getAdminEpisodes,
  getAllSeriesForEpisodeFilter,
  getEpisodeStats,
} from "@/server/actions/admin/episodes";
import { EpisodeTable } from "@/components/admin/episode-table";
import { StatCard } from "@/components/admin/stat-card";

export const metadata = { title: "Episodes" };

interface Props {
  searchParams: Promise<{
    search?: string;
    seriesId?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function AdminEpisodesPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));

  const [result, seriesList, stats] = await Promise.all([
    getAdminEpisodes({
      search: params.search,
      seriesId: params.seriesId,
      status: params.status,
      page,
      perPage: 30,
    }),
    getAllSeriesForEpisodeFilter(),
    getEpisodeStats(),
  ]);

  return (
    <div className="space-y-6 max-w-[1600px]">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
          <ListVideo size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white">
            All Episodes
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            {result.total} {result.total === 1 ? "episode" : "episodes"} across all series
          </p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            label="Total Episodes"
            value={stats.total}
            icon={Video}
            color="blue"
          />
          <StatCard
            label="Published"
            value={stats.published}
            icon={Eye}
            color="green"
          />
          <StatCard
            label="Drafts"
            value={stats.draft}
            icon={EyeOff}
            color="gold"
          />
        </div>
      )}

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
              placeholder="Search episodes..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500/50"
            />
          </div>

          <select
            name="seriesId"
            defaultValue={params.seriesId || "ALL"}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500/50 cursor-pointer max-w-xs"
          >
            <option value="ALL" className="bg-zinc-900">
              All Series
            </option>
            {seriesList.map((s) => (
              <option key={s.id} value={s.id} className="bg-zinc-900">
                {s.title}
              </option>
            ))}
          </select>

          <select
            name="status"
            defaultValue={params.status || "ALL"}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500/50 cursor-pointer"
          >
            <option value="ALL" className="bg-zinc-900">
              All Status
            </option>
            <option value="PUBLISHED" className="bg-zinc-900">
              Published
            </option>
            <option value="DRAFT" className="bg-zinc-900">
              Draft
            </option>
            <option value="ARCHIVED" className="bg-zinc-900">
              Archived
            </option>
          </select>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-white transition"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Table */}
      <EpisodeTable episodes={result.episodes} />

      {/* Pagination */}
      {result.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: result.totalPages }, (_, i) => i + 1).map(
            (p) => {
              const qs = new URLSearchParams();
              if (params.search) qs.set("search", params.search);
              if (params.seriesId && params.seriesId !== "ALL")
                qs.set("seriesId", params.seriesId);
              if (params.status && params.status !== "ALL")
                qs.set("status", params.status);
              if (p > 1) qs.set("page", String(p));
              const href = `/admin/episodes${qs.toString() ? `?${qs}` : ""}`;

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