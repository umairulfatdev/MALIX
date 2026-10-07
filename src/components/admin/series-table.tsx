"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Edit3,
  Eye,
  EyeOff,
  Star,
  Calendar,
  Loader2,
  Play,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { DeleteConfirm } from "./delete-confirm";
import {
  deleteSeriesAction,
  toggleSeriesPublishAction,
} from "@/server/actions/admin/series";

interface Series {
  id: string;
  title: string;
  slug: string;
  posterUrl: string | null;
  releaseYear: number | null;
  avgRating: number | null;
  status: string;
  isFeatured: boolean;
  totalViews: number;
  createdAt: Date;
  genres: { id: string; name: string }[];
  series: { _count: { seasons: number } } | null;
}

export function SeriesTable({ series }: { series: Series[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleTogglePublish = (id: string) => {
    setPendingId(id);
    startTransition(async () => {
      const result = await toggleSeriesPublishAction(id);
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

  if (series.length === 0) {
    return (
      <div className="glass-cosmic rounded-2xl p-12 text-center">
        <Play size={32} className="text-zinc-700 mx-auto mb-3" />
        <p className="text-zinc-400 text-sm">No series found</p>
      </div>
    );
  }

  return (
    <div className="glass-cosmic rounded-2xl overflow-hidden">
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-white/5">
            <tr className="text-left">
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Series
              </th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Year
              </th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Seasons
              </th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Rating
              </th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Status
              </th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {series.map((s) => (
              <tr key={s.id} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-14 rounded-lg bg-zinc-900 overflow-hidden flex-shrink-0 ring-1 ring-white/10">
                      {s.posterUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={s.posterUrl}
                          alt={s.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[8px] text-zinc-700 font-bold">
                          MALIX
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white truncate max-w-xs">
                        {s.title}
                      </div>
                      {s.isFeatured && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-yellow-400 mt-0.5">
                          <Star size={9} className="fill-yellow-400" />
                          Featured
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-zinc-400 flex items-center gap-1">
                    {s.releaseYear ? (
                      <>
                        <Calendar size={12} />
                        {s.releaseYear}
                      </>
                    ) : (
                      "—"
                    )}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1.5 text-sm text-zinc-300">
                    <Layers size={12} className="text-purple-400" />
                    {s.series?._count.seasons || 0}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {s.avgRating && s.avgRating > 0 ? (
                    <span className="flex items-center gap-1 text-sm text-yellow-400 font-semibold">
                      <Star size={12} className="fill-yellow-400" />
                      {s.avgRating.toFixed(1)}
                    </span>
                  ) : (
                    <span className="text-xs text-zinc-600">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${
                      s.status === "PUBLISHED"
                        ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                        : s.status === "DRAFT"
                          ? "text-zinc-400 bg-white/5 border-white/10"
                          : "text-zinc-500 bg-white/5 border-white/10"
                    }`}
                  >
                    {s.status === "PUBLISHED" ? "Live" : s.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleTogglePublish(s.id)}
                      disabled={pendingId === s.id}
                      className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center transition group"
                      title={s.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                    >
                      {pendingId === s.id ? (
                        <Loader2
                          size={14}
                          className="animate-spin text-yellow-500"
                        />
                      ) : s.status === "PUBLISHED" ? (
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

                    <Link
                      href={`/admin/series/${s.id}/edit`}
                      className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center transition group"
                      title="Edit"
                    >
                      <Edit3
                        size={14}
                        className="text-zinc-500 group-hover:text-yellow-400"
                      />
                    </Link>

                    <DeleteConfirm
                      itemId={s.id}
                      itemTitle={s.title}
                      deleteAction={deleteSeriesAction}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="md:hidden divide-y divide-white/5">
        {series.map((s) => (
          <div key={s.id} className="p-4">
            <div className="flex gap-3">
              <div className="w-14 h-20 rounded-lg bg-zinc-900 overflow-hidden flex-shrink-0">
                {s.posterUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={s.posterUrl}
                    alt={s.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[8px] text-zinc-700 font-bold">
                    MALIX
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white text-sm truncate">
                  {s.title}
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                  {s.releaseYear && <span>{s.releaseYear}</span>}
                  {s.series && (
                    <span className="flex items-center gap-1">
                      <Layers size={10} />
                      {s.series._count.seasons}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t border-white/5">
              <button
                onClick={() => handleTogglePublish(s.id)}
                disabled={pendingId === s.id}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-yellow-400 hover:bg-white/5 transition"
              >
                {s.status === "PUBLISHED" ? "Unpublish" : "Publish"}
              </button>
              <Link
                href={`/admin/series/${s.id}/edit`}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-yellow-400 hover:bg-white/5 transition"
              >
                Edit
              </Link>
              <DeleteConfirm
                itemId={s.id}
                itemTitle={s.title}
                deleteAction={deleteSeriesAction}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}