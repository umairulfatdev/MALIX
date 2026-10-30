"use client";

import Link from "next/link";
import { Edit, Eye, EyeOff, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DeleteConfirm } from "./delete-confirm";
import {
  deleteMovieAction,
  toggleMoviePublishAction, // 👈 Yahan naam change kar diya hai
} from "@/server/actions/admin/content";

interface Movie {
  id: string;
  title: string;
  slug: string;
  posterUrl: string | null;
  releaseYear: number | null;
  status: string;
  type: string;
  totalViews: number;
}

export function MovieTable({ movies }: { movies: Movie[] }) {
  if (movies.length === 0) {
    return (
      <div className="text-center p-12 bg-white/5 rounded-2xl border border-white/10">
        <p className="text-zinc-400 text-sm">No movies found</p>
      </div>
    );
  }

  const handleDelete = async (id: string) => {
    const res = await deleteMovieAction(id);
    if (res?.success) toast.success("Movie deleted");
    else if (res?.error) toast.error(res.error);
  };

  const handleToggle = async (id: string) => {
    const res = await toggleMoviePublishAction(id); // 👈 Yeh bhi change kar diya
    if (res?.success) toast.success("Status updated");
    else if (res?.error) toast.error(res.error);
  };

  return (
    <div className="bg-[#1a1a1a] rounded-2xl border border-white/5 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-zinc-300">
          <thead className="text-xs uppercase bg-black/50 text-zinc-400 border-b border-white/5">
            <tr>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Year</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {movies.map((movie) => (
              <tr key={movie.id} className="hover:bg-white/5 transition">
                <td className="px-6 py-4 font-medium text-white">{movie.title}</td>
                <td className="px-6 py-4">{movie.releaseYear || "-"}</td>
                <td className="px-6 py-4">{movie.type}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      movie.status === "PUBLISHED"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-zinc-500/20 text-zinc-400"
                    }`}
                  >
                    {movie.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleToggle(movie.id)}
                      className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10"
                      title="Toggle Status"
                    >
                      {movie.status === "PUBLISHED" ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <Link
                      href={`/admin/movies/${movie.id}/edit`}
                      className="p-2 text-zinc-400 hover:text-yellow-500 rounded-lg hover:bg-white/10"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </Link>
                    <DeleteConfirm onConfirm={() => handleDelete(movie.id)}>
                      <button className="p-2 text-zinc-400 hover:text-red-500 rounded-lg hover:bg-white/10" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </DeleteConfirm>
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