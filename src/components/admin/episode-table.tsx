"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Edit3,
  Eye,
  EyeOff,
  Loader2,
  Video,
  Clock,
  ExternalLink,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { DeleteConfirm } from "./delete-confirm";
import {
  deleteEpisodeAdminAction,
  toggleEpisodePublishAction,
  updateEpisodeAction,
} from "@/server/actions/admin/episodes";

interface Episode {
  id: string;
  episodeNum: number;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  duration: number | null;
  videoUrl: string | null;
  status: string;
  season: {
    id: string;
    seasonNumber: number;
    series: {
      id: string;
      content: {
        id: string;
        title: string;
        slug: string;
        posterUrl: string | null;
      };
    };
  } | null;
}

export function EpisodeTable({ episodes }: { episodes: Episode[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleTogglePublish = (id: string) => {
    setPendingId(id);
    startTransition(async () => {
      const result = await toggleEpisodePublishAction(id);
      setPendingId(null);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(
        result.status === "PUBLISHED" ? "Published" : "Moved to draft"
      );
      router.refresh();
    });
  };

  if (episodes.length === 0) {
    return (
      <div className="glass-cosmic rounded-2xl p-12 text-center">
        <Video size={32} className="text-zinc-700 mx-auto mb-3" />
        <p className="text-zinc-400 text-sm">
          No episodes found. Add episodes from a series edit page.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-cosmic rounded-2xl overflow-hidden">
      <div className="divide-y divide-white/5">
        {episodes.map((episode) =>
          editingId === episode.id ? (
            <EditEpisodeRow
              key={episode.id}
              episode={episode}
              onCancel={() => setEditingId(null)}
              onSuccess={() => {
                setEditingId(null);
                router.refresh();
              }}
            />
          ) : (
            <div
              key={episode.id}
              className="p-4 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                {/* Series Poster */}
                <div className="w-10 h-14 rounded-lg bg-zinc-900 overflow-hidden flex-shrink-0 ring-1 ring-white/10">
                  {episode.season?.series.content.posterUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={episode.season.series.content.posterUrl}
                      alt={episode.season.series.content.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[8px] text-zinc-700 font-bold">
                      MALIX
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-1.5 py-0.5 rounded">
                      S{episode.season?.seasonNumber} • E{episode.episodeNum}
                    </span>
                    <span className="text-xs text-zinc-500 truncate">
                      {episode.season?.series.content.title || "Unknown"}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-white truncate">
                    {episode.title}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                    {episode.duration && (
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {episode.duration}m
                      </span>
                    )}
                    {episode.videoUrl ? (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Video size={10} />
                        Video linked
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-orange-400">
                        <Video size={10} />
                        No video
                      </span>
                    )}
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        episode.status === "PUBLISHED"
                          ? "text-emerald-400 bg-emerald-500/10"
                          : "text-zinc-400 bg-white/5"
                      }`}
                    >
                      {episode.status === "PUBLISHED" ? "Live" : episode.status}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleTogglePublish(episode.id)}
                    disabled={pendingId === episode.id}
                    className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center transition group"
                    title={
                      episode.status === "PUBLISHED" ? "Unpublish" : "Publish"
                    }
                  >
                    {pendingId === episode.id ? (
                      <Loader2
                        size={14}
                        className="animate-spin text-yellow-500"
                      />
                    ) : episode.status === "PUBLISHED" ? (
                      <EyeOff
                        size={14}
                        className="text-zinc-500 group-hover:text-yellow-400"
                      />
                    ) : (
                      <Eye
                        size={14}
                        className="text-zinc-500 group-hover:text-emerald-400"
                      />
                    )}
                  </button>

                  <button
                    onClick={() => setEditingId(episode.id)}
                    className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center transition group"
                    title="Edit"
                  >
                    <Edit3
                      size={14}
                      className="text-zinc-500 group-hover:text-yellow-400"
                    />
                  </button>

                  {episode.season && (
                    <Link
                      href={`/admin/series/${episode.season.series.content.id}/edit`}
                      className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center transition group"
                      title="Go to series"
                    >
                      <ExternalLink
                        size={14}
                        className="text-zinc-500 group-hover:text-yellow-400"
                      />
                    </Link>
                  )}

                  <DeleteConfirm
                    itemId={episode.id}
                    itemTitle={episode.title}
                    deleteAction={deleteEpisodeAdminAction}
                  />
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

// ============================================================
// INLINE EDIT ROW
// ============================================================

function EditEpisodeRow({
  episode,
  onCancel,
  onSuccess,
}: {
  episode: Episode;
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateEpisodeAction(episode.id, formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Episode updated");
      onSuccess();
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-yellow-500/5 border-l-2 border-yellow-500 space-y-3"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-yellow-400">
          Editing Episode
        </span>
        <button
          type="button"
          onClick={onCancel}
          className="w-6 h-6 rounded hover:bg-white/5 flex items-center justify-center"
        >
          <X size={14} className="text-zinc-400" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          name="episodeNum"
          type="number"
          min="1"
          defaultValue={episode.episodeNum}
          required
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500/50"
          placeholder="Episode #"
        />
        <input
          name="title"
          defaultValue={episode.title}
          required
          className="md:col-span-3 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500/50"
          placeholder="Title"
        />
      </div>

      <textarea
        name="description"
        rows={2}
        defaultValue={episode.description || ""}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500/50 resize-none"
        placeholder="Description"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          name="videoUrl"
          type="url"
          defaultValue={episode.videoUrl || ""}
          className="md:col-span-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500/50"
          placeholder="Video URL"
        />
        <input
          name="duration"
          type="number"
          min="1"
          defaultValue={episode.duration || ""}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500/50"
          placeholder="Duration (min)"
        />
      </div>

      <input
        name="thumbnailUrl"
        type="url"
        defaultValue={episode.thumbnailUrl || ""}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500/50"
        placeholder="Thumbnail URL"
      />

      <div className="flex items-center justify-between">
        <select
          name="status"
          defaultValue={episode.status}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500/50 cursor-pointer"
        >
          <option value="DRAFT" className="bg-zinc-900">Draft</option>
          <option value="PUBLISHED" className="bg-zinc-900">Published</option>
          <option value="ARCHIVED" className="bg-zinc-900">Archived</option>
        </select>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="px-3 py-2 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/5 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="btn-cosmic flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check size={12} />
                Save
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}