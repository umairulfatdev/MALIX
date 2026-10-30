import Link from "next/link";
import { Calendar, Plus, Search } from "lucide-react";
import { getAdminComingSoon } from "@/server/actions/admin/coming-soon";

export const metadata = { title: "Coming Soon" };

interface Props {
  searchParams: Promise<{
    search?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function AdminComingSoonPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const search = params.search || "";
  const status = params.status || "ALL";

  const result = await getAdminComingSoon({
    search,
    status,
    page,
    perPage: 20,
  });

  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Calendar size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white">
              Coming Soon
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              {result.total} {result.total === 1 ? "item" : "items"} total
            </p>
          </div>
        </div>

        <Link
          href="/admin/coming-soon/new"
          className="btn-cosmic flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold rounded-xl"
        >
          <Plus size={16} />
          Add New Coming Soon
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
              placeholder="Search coming soon..."
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

      {/* Abhi ke liye list placeholder hai, taake error na aaye */}
      {result.items.length === 0 ? (
         <div className="text-center p-12 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-zinc-400">No Coming Soon items found. Click "Add New" to create one.</p>
         </div>
      ) : (
         <div className="bg-[#1a1a1a] rounded-2xl border border-white/5 overflow-hidden">
            <table className="w-full text-left text-sm text-zinc-300">
               <thead className="text-xs uppercase bg-black/50 text-zinc-400 border-b border-white/5">
                  <tr>
                     <th className="px-6 py-4">Title</th>
                     <th className="px-6 py-4">Type</th>
                     <th className="px-6 py-4">Release Date</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {result.items.map((item) => (
                     <tr key={item.id}>
                        <td className="px-6 py-4 text-white">{item.title}</td>
                        <td className="px-6 py-4">{item.type}</td>
                        <td className="px-6 py-4">{item.comingSoonDate ? new Date(item.comingSoonDate).toLocaleDateString() : "TBA"}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      )}
    </div>
  );
}