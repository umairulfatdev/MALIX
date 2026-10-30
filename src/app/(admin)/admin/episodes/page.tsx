import Link from "next/link";
import { Video, Plus, ListVideo } from "lucide-react";
import { getEpisodes, deleteEpisodeAction } from "@/server/actions/admin/episodes";
import { EpisodeTable } from "@/components/admin/episode-table";

export const metadata = { title: "Episodes | Admin" };

export default async function AdminEpisodesPage() {
  const episodes = await getEpisodes();

  return (
    <div className="space-y-6 max-w-[1600px]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <ListVideo size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white">
              All Episodes
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              {episodes.length} {episodes.length === 1 ? "episode" : "episodes"} total
            </p>
          </div>
        </div>

        {/* Add New Button */}
        <Link
          href="/admin/episodes/new"
          className="btn-cosmic flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold rounded-xl"
        >
          <Plus size={16} />
          Add New Episode
        </Link>
      </div>

      {/* Table */}
      <EpisodeTable episodes={episodes} />

    </div>
  );
}