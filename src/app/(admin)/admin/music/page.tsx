import Link from "next/link";
import { Music, Plus, Trash2, Edit } from "lucide-react"; // 👈 Edit import kiya
import { getAdminMusic, deleteMusicAction } from "@/server/actions/admin/music";

export const metadata = { title: "Music | Admin" };

export default async function AdminMusicPage() {
  const songs = await getAdminMusic();

  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
            <Music size={20} className="text-pink-500" />
          </div>
          <h1 className="text-2xl font-bold text-white">Music</h1>
        </div>
        <Link href="/admin/music/new" className="btn-cosmic flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl">
          <Plus size={16} /> Add New Music
        </Link>
      </div>

      <div className="bg-[#1a1a1a] rounded-2xl border border-white/5 overflow-hidden">
        <table className="w-full text-left text-sm text-zinc-300">
          <thead className="bg-black/50 text-zinc-400 border-b border-white/5">
            <tr>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Artist</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {songs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">No music found.</td>
              </tr>
            ) : (
              songs.map((song) => (
                <tr key={song.id} className="hover:bg-white/5 transition">
                  <td className="px-6 py-4 text-white font-medium">{song.title}</td>
                  <td className="px-6 py-4">{song.music?.artist || "-"}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${song.status === "PUBLISHED" ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-500/20 text-zinc-400"}`}>
                      {song.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {/* 👇 NAYA EDIT BUTTON ADD KIYA HAI 👇 */}
                      <Link href={`/admin/music/${song.id}/edit`} className="p-2 text-zinc-400 hover:text-yellow-500 rounded-lg hover:bg-white/10 transition">
                        <Edit size={16} />
                      </Link>
                      <form action={async () => { "use server"; await deleteMusicAction(song.id); }}>
                        <button type="submit" className="p-2 text-zinc-400 hover:text-red-500 rounded-lg hover:bg-white/10 transition">
                          <Trash2 size={16} />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}