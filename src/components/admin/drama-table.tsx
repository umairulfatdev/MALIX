"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Edit3, Eye, EyeOff, Star, Calendar, Loader2, Tv } from "lucide-react";
import { toast } from "sonner";
import { DeleteConfirm } from "./delete-confirm";
import {
  deleteDramaAction,
  toggleDramaPublishAction,
} from "@/server/actions/admin/dramas";

interface Drama {
  id: string;
  title: string;
  slug: string;
  posterUrl: string | null;
  releaseYear: number | null;
  duration: number | null;
  avgRating: number | null;
  status: string;
  isFeatured: boolean;
  totalViews: number;
  createdAt: Date;
  genres: { id: string; name: string }[];
}

export function DramaTable({ dramas }: { dramas: Drama[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleTogglePublish = (id: string) => {
    setPendingId(id);
    startTransition(async () => {
      const result = await toggleDramaPublishAction(id);
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

  if (dramas.length === 0) {
    return (
      <div className="glass-cosmic rounded-2xl p-12 text-center">
        <Tv size={32} className="text-zinc-700 mx-auto mb-3" />
        <p className="text-zinc-400 text-sm">No dramas found</p>
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
                Drama
              </th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Year
              </th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Genres
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
            {dramas.map((drama) => (
              <tr key={drama.id} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-14 rounded-lg bg-zinc-900 overflow-hidden flex-shrink-0 ring-1 ring-white/10">
                      {drama.posterUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={drama.posterUrl}
                          alt={drama.title}
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
                        {drama.title}
                      </div>
                      {drama.isFeatured && (
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
                    {drama.releaseYear ? (
                      <>
                        <Calendar size={12} />
                        {drama.releaseYear}
                      </>
                    ) : (
                      "—"
                    )}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {drama.genres.slice(0, 2).map((g) => (
                      <span
                        key={g.id}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-zinc-400 border border-white/10"
                      >
                        {g.name}
                      </span>
                    ))}
                    {drama.genres.length > 2 && (
                      <span className="text-[10px] text-zinc-500">
                        +{drama.genres.length - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {drama.avgRating && drama.avgRating > 0 ? (
                    <span className="flex items-center gap-1 text-sm text-yellow-400 font-semibold">
                      <Star size={12} className="fill-yellow-400" />
                      {drama.avgRating.toFixed(1)}
                    </span>
                  ) : (
                    <span className="text-xs text-zinc-600">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${
                      drama.status === "PUBLISHED"
                        ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                        : drama.status === "DRAFT"
                          ? "text-zinc-400 bg-white/5 border-white/10"
                          : "text-zinc-500 bg-white/5 border-white/10"
                    }`}
                  >
                    {drama.status === "PUBLISHED" ? "Live" : drama.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleTogglePublish(drama.id)}
                      disabled={pendingId === drama.id}
                      className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center transition group"
                      title={drama.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                    >
                      {pendingId === drama.id ? (
                        <Loader2 size={14} className="animate-spin text-yellow-500" />
                      ) : drama.status === "PUBLISHED" ? (
                        <EyeOff size={14} className="text-zinc-500 group-hover:text-yellow-400" />
                      ) : (
                        <Eye size={14} className="text-zinc-500 group-hover:text-emerald-400" />
                      )}
                    </button>

                    <Link
                      href={`/admin/dramas/${drama.id}/edit`}
                      className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center transition group"
                      title="Edit"
                    >
                      <Edit3 size={14} className="text-zinc-500 group-hover:text-yellow-400" />
                    </Link>

                    <DeleteConfirm
                      itemId={drama.id}
                      itemTitle={drama.title}
                      deleteAction={deleteDramaAction}
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
        {dramas.map((drama) => (
          <div key={drama.id} className="p-4">
            <div className="flex gap-3">
              <div className="w-14 h-20 rounded-lg bg-zinc-900 overflow-hidden flex-shrink-0">
                {drama.posterUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={drama.posterUrl}
                    alt={drama.title}
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
                  {drama.title}
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                  {drama.releaseYear && <span>{drama.releaseYear}</span>}
                  {drama.avgRating && drama.avgRating > 0 && (
                    <span className="flex items-center gap-1 text-yellow-400">
                      <Star size={10} className="fill-yellow-400" />
                      {drama.avgRating.toFixed(1)}
                    </span>
                  )}
                </div>
                <div className="mt-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      drama.status === "PUBLISHED"
                        ? "text-emerald-400 bg-emerald-500/10"
                        : "text-zinc-400 bg-white/5"
                    }`}
                  >
                    {drama.status === "PUBLISHED" ? "Live" : drama.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t border-white/5">
              <button
                onClick={() => handleTogglePublish(drama.id)}
                disabled={pendingId === drama.id}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-yellow-400 hover:bg-white/5 transition"
              >
                {drama.status === "PUBLISHED" ? "Unpublish" : "Publish"}
              </button>
              <Link
                href={`/admin/dramas/${drama.id}/edit`}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-yellow-400 hover:bg-white/5 transition"
              >
                Edit
              </Link>
              <DeleteConfirm
                itemId={drama.id}
                itemTitle={drama.title}
                deleteAction={deleteDramaAction}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}