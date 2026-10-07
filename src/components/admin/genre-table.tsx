"use client";

import { useState } from "react";
import { Edit3, X, Sparkles } from "lucide-react";
import { DeleteConfirm } from "./delete-confirm";
import { GenreForm } from "./genre-form";
import { deleteGenreAction } from "@/server/actions/admin/genres";

interface Genre {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: Date;
  _count: { contents: number };
}

export function GenreTable({ genres }: { genres: Genre[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);

  if (genres.length === 0) {
    return (
      <div className="glass-cosmic rounded-2xl p-12 text-center">
        <p className="text-zinc-400 text-sm">No genres yet</p>
      </div>
    );
  }

  return (
    <div className="glass-cosmic rounded-2xl overflow-hidden">
      <div className="divide-y divide-white/5">
        {genres.map((genre) => (
          <div key={genre.id} className="p-4">
            {editingId === genre.id ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-yellow-500 font-bold uppercase tracking-wider">
                    Editing: {genre.name}
                  </span>
                  <button
                    onClick={() => setEditingId(null)}
                    className="w-6 h-6 rounded hover:bg-white/5 flex items-center justify-center"
                  >
                    <X size={14} className="text-zinc-400" />
                  </button>
                </div>
                <GenreForm
                  mode="edit"
                  genreId={genre.id}
                  initialData={{
                    name: genre.name,
                    description: genre.description,
                  }}
                  onSuccess={() => setEditingId(null)}
                />
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500/20 to-amber-600/10 border border-yellow-500/30 flex items-center justify-center flex-shrink-0">
                    <Sparkles size={16} className="text-yellow-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-white truncate">
                      {genre.name}
                    </div>
                    <div className="text-xs text-zinc-500 truncate">
                      <span className="font-mono text-[10px]">{genre.slug}</span>
                      {genre.description && (
                        <span className="ml-2">— {genre.description}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-zinc-500 flex-shrink-0 px-2 py-1 rounded-md bg-white/5 border border-white/10">
                    {genre._count.contents} items
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingId(genre.id)}
                    className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center transition group"
                    title="Edit"
                  >
                    <Edit3
                      size={14}
                      className="text-zinc-500 group-hover:text-yellow-400"
                    />
                  </button>
                  <DeleteConfirm
                    itemId={genre.id}
                    itemTitle={genre.name}
                    deleteAction={deleteGenreAction}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}