import Link from "next/link";
import { Play, Plus, Search } from "lucide-react";
import { getAdminSeries } from "@/server/actions/admin/series";
import { SeriesTable } from "@/components/admin/series-table";

export const metadata = { title: "Series" };

interface Props {
  searchParams: Promise<{
    search?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function AdminSeriesPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const search = params.search || "";
  const status = params.status || "ALL";

  const result = await getAdminSeries({
    search,
    status,
    page,
    perPage: 20,
  });

  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Play size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white">
              Series
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              {result.total} {result.total === 1 ? "series" : "series"} total
            </p>
          </div>
        </div>

        <Link
          href="/admin/series/new"
          className="btn-cosmic flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold rounded-xl"
        >
          <Plus size={16} />
          Add New Series
        </Link>
      </div>

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
              defaultValue={search}
              placeholder="Search series..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500/50"
            />
          </div>

          <select
            name="status"
            defaultValue={status}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500/50 cursor-pointer"
          >
            <option value="ALL" className="bg-zinc-900">All Status</option>
            <option value="PUBLISHED" className="bg-zinc-900">Published</option>
            <option value="DRAFT" className="bg-zinc-900">Draft</option>
            <option value="ARCHIVED" className="bg-zinc-900">Archived</option>
          </select>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-white transition"
          >
            Filter
          </button>
        </form>
      </div>

      <SeriesTable series={result.series} />

      {result.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: result.totalPages }, (_, i) => i + 1).map(
            (p) => {
              const qs = new URLSearchParams();
              if (search) qs.set("search", search);
              if (status && status !== "ALL") qs.set("status", status);
              if (p > 1) qs.set("page", String(p));
              const href = `/admin/series${qs.toString() ? `?${qs}` : ""}`;

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