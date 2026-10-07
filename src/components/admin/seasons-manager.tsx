"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  X,
  Trash2,
  Loader2,
  Layers,
  ChevronDown,
  ChevronRight,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import {
  createSeasonAction,
  deleteSeasonAction,
  createEpisodeAction,
  deleteEpisodeAction,
  SeasonFormState,
} from "@/server/actions/admin/series";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

interface Episode {
  id: string;
  episodeNum: number;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  duration: number | null;
  videoUrl: string | null;
  status: string;
}

interface Season {
  id: string;
  seasonNumber: number;
  title: string | null;
  description: string | null;
  posterUrl: string | null;
  releaseYear: number | null;
  episodes: Episode[];
}

interface SeasonsManagerProps {
  seriesContentId: string;
  seasons: Season[];
}

export function SeasonsManager({
  seriesContentId,
  seasons,
}: SeasonsManagerProps) {
  const [showAddSeason, setShowAddSeason] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-yellow-400 to-amber-600 rounded-full" />
          <h2 className="text-2xl font-bold text-white">Seasons & Episodes</h2>
          <span className="text-sm text-zinc-500">
            ({seasons.length} season{seasons.length === 1 ? "" : "s"})
          </span>
        </div>

        <button
          onClick={() => setShowAddSeason(!showAddSeason)}
          className="btn-cosmic flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl"
        >
          <Plus size={14} />
          Add Season
        </button>
      </div>

      {/* Add Season Form */}
      {showAddSeason && (
        <AddSeasonForm
          seriesId={seriesContentId}
          onSuccess={() => setShowAddSeason(false)}
        />
      )}

      {/* Seasons List */}
      {seasons.length === 0 ? (
        <div className="glass-cosmic rounded-2xl p-12 text-center">
          <Layers size={32} className="text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-400 text-sm">
            No seasons yet. Add your first season above.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {seasons.map((season) => (
            <SeasonCard key={season.id} season={season} />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// ADD SEASON FORM
// ============================================================

const seasonInitialState: SeasonFormState = {};

function SeasonSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-cosmic flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl disabled:opacity-50"
    >
      {pending ? (
        <>
          <Loader2 size={14} className="animate-spin" />
          Creating...
        </>
      ) : (
        <>
          <Plus size={14} />
          Create Season
        </>
      )}
    </button>
  );
}

function AddSeasonForm({
  seriesId,
  onSuccess,
}: {
  seriesId: string;
  onSuccess: () => void;
}) {
  const action = createSeasonAction.bind(null, seriesId);
  const [state, formAction] = useActionState(action, seasonInitialState);

  if (state?.success && onSuccess) {
    onSuccess();
  }

  return (
    <div className="glass-cosmic rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-yellow-400">
          New Season
        </h3>
      </div>

      {state?.error && (
        <div className="bg-red-500/10 border border-red-500/40 text-red-400 text-xs rounded-lg p-3 mb-3">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 block">
              Season Number <span className="text-red-500">*</span>
            </label>
            <input
              name="seasonNumber"
              type="number"
              min="1"
              max="100"
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500/50"
              placeholder="1"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 block">
              Title
            </label>
            <input
              name="title"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500/50"
              placeholder="Season 1: The Beginning"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 block">
            Description
          </label>
          <textarea
            name="description"
            rows={2}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500/50 resize-none"
            placeholder="Optional season description"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 block">
            Poster URL
          </label>
          <input
            name="posterUrl"
            type="url"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500/50"
            placeholder="https://..."
          />
        </div>

        <div className="flex justify-end">
          <SeasonSubmitButton />
        </div>
      </form>
    </div>
  );
}

// ============================================================
// SEASON CARD
// ============================================================

function SeasonCard({ season }: { season: Season }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [showAddEpisode, setShowAddEpisode] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm(`Delete Season ${season.seasonNumber}? This will also delete all episodes.`))
      return;

    startTransition(async () => {
      const result = await deleteSeasonAction(season.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Season deleted");
      router.refresh();
    });
  };

  return (
    <div className="glass-cosmic rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-5 flex items-center justify-between gap-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-3 flex-1 text-left group"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500/20 to-amber-600/10 border border-yellow-500/30 flex items-center justify-center flex-shrink-0">
            {expanded ? (
              <ChevronDown size={18} className="text-yellow-400" />
            ) : (
              <ChevronRight size={18} className="text-yellow-400" />
            )}
          </div>
          <div>
            <div className="text-base font-bold text-white group-hover:text-yellow-400 transition">
              Season {season.seasonNumber}
              {season.title && `: ${season.title}`}
            </div>
            <div className="text-xs text-zinc-500 mt-0.5">
              {season.episodes.length} episode
              {season.episodes.length === 1 ? "" : "s"}
              {season.releaseYear && ` • ${season.releaseYear}`}
            </div>
          </div>
        </button>

        <button
          onClick={handleDelete}
          disabled={isPending}
          className="w-9 h-9 rounded-lg hover:bg-red-500/10 flex items-center justify-center transition group disabled:opacity-50"
          title="Delete season"
        >
          {isPending ? (
            <Loader2 size={16} className="animate-spin text-yellow-500" />
          ) : (
            <Trash2
              size={16}
              className="text-zinc-500 group-hover:text-red-400"
            />
          )}
        </button>
      </div>

      {/* Episodes List */}
      {expanded && (
        <div className="border-t border-white/5 p-5 space-y-3">
          {season.description && (
            <p className="text-sm text-zinc-400 mb-3">{season.description}</p>
          )}

          {season.episodes.length === 0 ? (
            <div className="text-center py-6">
              <Video size={24} className="text-zinc-700 mx-auto mb-2" />
              <p className="text-sm text-zinc-500">No episodes yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {season.episodes.map((episode) => (
                <EpisodeRow key={episode.id} episode={episode} />
              ))}
            </div>
          )}

          {/* Add Episode */}
          {showAddEpisode ? (
            <AddEpisodeForm
              seasonId={season.id}
              nextEpisodeNum={season.episodes.length + 1}
              onSuccess={() => {
                setShowAddEpisode(false);
                router.refresh();
              }}
            />
          ) : (
            <button
              onClick={() => setShowAddEpisode(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 border-dashed border-white/10 hover:border-yellow-500/40 text-sm font-medium text-zinc-500 hover:text-yellow-400 transition"
            >
              <Plus size={14} />
              Add Episode
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// EPISODE ROW
// ============================================================

function EpisodeRow({ episode }: { episode: Episode }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm(`Delete episode ${episode.episodeNum}?`)) return;

    startTransition(async () => {
      const result = await deleteEpisodeAction(episode.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Episode deleted");
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5 hover:border-yellow-500/20 transition group">
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500/20 to-amber-600/10 border border-yellow-500/30 flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-black text-yellow-400">
          E{episode.episodeNum}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-white truncate">
          {episode.title}
        </div>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-500">
          {episode.duration && <span>{episode.duration} min</span>}
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
              episode.status === "PUBLISHED"
                ? "text-emerald-400 bg-emerald-500/10"
                : "text-zinc-400 bg-white/5"
            }`}
          >
            {episode.status}
          </span>
        </div>
      </div>

      <button
        onClick={handleDelete}
        disabled={isPending}
        className="w-8 h-8 rounded-lg hover:bg-red-500/10 flex items-center justify-center transition opacity-0 group-hover:opacity-100 disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 size={14} className="animate-spin text-yellow-500" />
        ) : (
          <Trash2
            size={14}
            className="text-zinc-500 group-hover:text-red-400"
          />
        )}
      </button>
    </div>
  );
}

// ============================================================
// ADD EPISODE FORM
// ============================================================

function AddEpisodeForm({
  seasonId,
  nextEpisodeNum,
  onSuccess,
}: {
  seasonId: string;
  nextEpisodeNum: number;
  onSuccess: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createEpisodeAction(seasonId, formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Episode added");
      onSuccess();
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/20 space-y-3"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-yellow-400">
          New Episode
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          name="episodeNum"
          type="number"
          min="1"
          defaultValue={nextEpisodeNum}
          required
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500/50"
          placeholder="Episode #"
        />
        <input
          name="title"
          required
          className="md:col-span-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500/50"
          placeholder="Episode title"
        />
      </div>

      <textarea
        name="description"
        rows={2}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500/50 resize-none"
        placeholder="Episode description (optional)"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          name="videoUrl"
          type="url"
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500/50"
          placeholder="Video URL (https://...)"
        />
        <input
          name="duration"
          type="number"
          min="1"
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500/50"
          placeholder="Duration (minutes)"
        />
      </div>

      <input
        name="thumbnailUrl"
        type="url"
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500/50"
        placeholder="Thumbnail URL (optional)"
      />

      <div className="flex items-center justify-between">
        <select
          name="status"
          defaultValue="DRAFT"
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500/50 cursor-pointer"
        >
          <option value="DRAFT" className="bg-zinc-900">Draft</option>
          <option value="PUBLISHED" className="bg-zinc-900">Published</option>
        </select>

        <button
          type="submit"
          disabled={isPending}
          className="btn-cosmic flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 size={12} className="animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <Plus size={12} />
              Add Episode
            </>
          )}
        </button>
      </div>
    </form>
  );
}