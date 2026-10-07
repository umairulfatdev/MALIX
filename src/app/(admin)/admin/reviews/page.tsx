import Link from "next/link";
import { MessageSquare, Search } from "lucide-react";
import { getAdminReviews, getReviewStats } from "@/server/actions/admin/reviews";
import { ReviewTable } from "@/components/admin/review-table";
import { StatCard } from "@/components/admin/stat-card";
import { Eye, EyeOff, AlertTriangle } from "lucide-react";

export const metadata = { title: "Reviews" };

interface Props {
  searchParams: Promise<{
    search?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function AdminReviewsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));

  const [result, stats] = await Promise.all([
    getAdminReviews({
      search: params.search,
      status: params.status,
      page,
      perPage: 20,
    }),
    getReviewStats(),
  ]);

  return (
    <div className="space-y-6 max-w-[1600px]">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
          <MessageSquare size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white">
            Reviews
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            {result.total} {result.total === 1 ? "review" : "reviews"} total
          </p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total" value={stats.total} icon={MessageSquare} color="purple" />
          <StatCard label="Visible" value={stats.visible} icon={Eye} color="green" />
          <StatCard label="Hidden" value={stats.hidden} icon={EyeOff} color="red" />
          <StatCard label="Reported" value={stats.reported} icon={AlertTriangle} color="gold" />
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
              placeholder="Search reviews..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500/50"
            />
          </div>

          <select
            name="status"
            defaultValue={params.status || "ALL"}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500/50 cursor-pointer"
          >
            <option value="ALL" className="bg-zinc-900">All</option>
            <option value="VISIBLE" className="bg-zinc-900">Visible</option>
            <option value="HIDDEN" className="bg-zinc-900">Hidden</option>
            <option value="REPORTED" className="bg-zinc-900">Reported</option>
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
      <ReviewTable reviews={result.reviews} />

      {/* Pagination */}
      {result.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: result.totalPages }, (_, i) => i + 1).map((p) => {
            const qs = new URLSearchParams();
            if (params.search) qs.set("search", params.search);
            if (params.status && params.status !== "ALL") qs.set("status", params.status);
            if (p > 1) qs.set("page", String(p));
            const href = `/admin/reviews${qs.toString() ? `?${qs}` : ""}`;

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
          })}
        </div>
      )}
    </div>
  );
}