import Link from "next/link";
import { getAdminMusic, deleteMusicAction } from "@/server/actions/admin/music";
import { Music, Plus } from "lucide-react";

export default async function AdminMusicPage() {
  let music: any[] = [];
  try {
    music = await getAdminMusic();
  } catch (e) {
    console.error("Failed to load music:", e);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Music</h1>
          <p className="text-sm text-zinc-500">Manage songs and albums</p>
        </div>
        <Link href="/admin/music/new" className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black font-bold rounded-lg">
          <Plus size={18} /> Add Music
        </Link>
      </div>

      <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="p-4 text-left text-zinc-400 text-sm">Title</th>
              <th className="p-4 text-left text-zinc-400 text-sm">Artist</th>
              <th className="p-4 text-left text-zinc-400 text-sm">Status</th>
              <th className="p-4 text-right text-zinc-400 text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(!music || music.length === 0) && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-zinc-500">
                  No music yet. Click "Add Music" to create one.
                </td>
              </tr>
            )}
            {music?.map((item) => (
              <tr key={item.id} className="border-t border-white/5">
                <td className="p-4 text-white">{item.title}</td>
                <td className="p-4 text-zinc-300">{item.music?.artist || "—"}</td>
                <td className="p-4">
                  <span className={item.status === "PUBLISHED" ? "text-green-500" : "text-yellow-500"}>
                    {item.status}
                  </span>
                </td>
                <td className="p-4 text-right space-x-3">
                  <Link href={`/admin/music/${item.id}/edit`} className="text-blue-500 hover:underline text-sm">
                    Edit
                  </Link>
                  <form action={async () => { "use server"; await deleteMusicAction(item.id); }} className="inline">
                    <button type="submit" className="text-red-500 hover:underline text-sm">Delete</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}