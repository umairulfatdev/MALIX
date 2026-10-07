import Link from "next/link";
import { Users, Search } from "lucide-react";
import { getAdminUsers, getAdminUserStats } from "@/server/actions/admin/users";
import { UserTable } from "@/components/admin/user-table";
import { StatCard } from "@/components/admin/stat-card";
import { UserCheck, UserX, Crown, Sparkles } from "lucide-react";

export const metadata = { title: "Users" };

interface Props {
  searchParams: Promise<{
    search?: string;
    role?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function AdminUsersPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));

  const [result, stats] = await Promise.all([
    getAdminUsers({
      search: params.search,
      role: params.role,
      status: params.status,
      page,
      perPage: 20,
    }),
    getAdminUserStats(),
  ]);

  return (
    <div className="space-y-6 max-w-[1600px]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Users size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white">
              Users
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              {result.total} {result.total === 1 ? "user" : "users"} total
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Users" value={stats.total} icon={Users} color="blue" />
          <StatCard label="Admins" value={stats.admins} icon={Crown} color="gold" />
          <StatCard label="Active" value={stats.active} icon={UserCheck} color="green" />
          <StatCard label="New This Week" value={stats.recent} icon={Sparkles} color="purple" />
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
              placeholder="Search by name or email..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500/50"
            />
          </div>

          <select
            name="role"
            defaultValue={params.role || "ALL"}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500/50 cursor-pointer"
          >
            <option value="ALL" className="bg-zinc-900">All Roles</option>
            <option value="ADMIN" className="bg-zinc-900">Admins</option>
            <option value="USER" className="bg-zinc-900">Users</option>
          </select>

          <select
            name="status"
            defaultValue={params.status || "ALL"}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500/50 cursor-pointer"
          >
            <option value="ALL" className="bg-zinc-900">All Status</option>
            <option value="ACTIVE" className="bg-zinc-900">Active</option>
            <option value="INACTIVE" className="bg-zinc-900">Inactive</option>
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
      <UserTable users={result.users} />

      {/* Pagination */}
      {result.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: result.totalPages }, (_, i) => i + 1).map((p) => {
            const qs = new URLSearchParams();
            if (params.search) qs.set("search", params.search);
            if (params.role && params.role !== "ALL") qs.set("role", params.role);
            if (params.status && params.status !== "ALL") qs.set("status", params.status);
            if (p > 1) qs.set("page", String(p));
            const href = `/admin/users${qs.toString() ? `?${qs}` : ""}`;

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