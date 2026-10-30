"use client";

import { Trash2, Play } from "lucide-react";
import { toast } from "sonner";
import { deleteEpisodeAction } from "@/server/actions/admin/episodes";
import { useTransition } from "react";

interface Episode {
  id: string;
  title: string;
  episodeNum: number;
  duration: number | null;
  status: string;
  season: {
    seasonNumber: number;
    series: {
      content: {
        title: string;
      }
    }
  }
}

export function EpisodeTable({ episodes }: { episodes: Episode[] }) {
  const [isPending, startTransition] = useTransition();

  if (episodes.length === 0) {
    return (
      <div className="text-center p-12 bg-white/5 rounded-2xl border border-white/10">
        <p className="text-zinc-400 text-sm">No episodes found. Click "Add New Episode" to create one.</p>
      </div>
    );
  }

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this episode?")) return;
    
    startTransition(async () => {
      const res = await deleteEpisodeAction(id);
      if (res?.success) toast.success("Episode deleted");
      else if (res?.error) toast.error(res.error);
    });
  };

  return (
    <div className="bg-[#1a1a1a] rounded-2xl border border-white/5 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-zinc-300">
          <thead className="text-xs uppercase bg-black/50 text-zinc-400 border-b border-white/5">
            <tr>
              <th className="px-6 py-4">Series</th>
              <th className="px-6 py-4">Season</th>
              <th className="px-6 py-4">Ep #</th>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {episodes.map((ep) => (
              <tr key={ep.id} className="hover:bg-white/5 transition">
                <td className="px-6 py-4 font-medium text-white">{ep.season.series.content.title}</td>
                <td className="px-6 py-4">S{ep.season.seasonNumber}</td>
                <td className="px-6 py-4">E{ep.episodeNum}</td>
                <td className="px-6 py-4">{ep.title}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      ep.status === "PUBLISHED"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-zinc-500/20 text-zinc-400"
                    }`}
                  >
                    {ep.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleDelete(ep.id)}
                      disabled={isPending}
                      className="p-2 text-zinc-400 hover:text-red-500 rounded-lg hover:bg-white/10 disabled:opacity-50"
                      title="Delete Episode"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}