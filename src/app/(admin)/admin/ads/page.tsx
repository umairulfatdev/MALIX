import Link from "next/link";
import { getAdminAds, deleteAdAction } from "@/server/actions/admin/ads";
import { Megaphone, Plus, Trash2, Edit } from "lucide-react";

export default async function AdminAdsPage() {
  const ads = await getAdminAds();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Ads Management</h1>
          <p className="text-sm text-zinc-500">Manage website advertisements</p>
        </div>
        <Link href="/admin/ads/new" className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black font-bold rounded-lg">
          <Plus size={18} /> Add Ad
        </Link>
      </div>

      <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="p-4 text-left text-zinc-400 text-sm">Title</th>
              <th className="p-4 text-left text-zinc-400 text-sm">Type</th>
              <th className="p-4 text-left text-zinc-400 text-sm">Position</th>
              <th className="p-4 text-left text-zinc-400 text-sm">Status</th>
              <th className="p-4 text-right text-zinc-400 text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {ads.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-zinc-500">No ads yet</td></tr>
            )}
            {ads.map((ad) => (
              <tr key={ad.id} className="border-t border-white/5">
                <td className="p-4 text-white">{ad.title}</td>
                <td className="p-4 text-zinc-300 capitalize">{ad.type}</td>
                <td className="p-4 text-zinc-300 capitalize">{ad.position}</td>
                <td className="p-4">
                  <span className={ad.isActive ? "text-green-500" : "text-red-500"}>
                    {ad.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <Link href={`/admin/ads/${ad.id}/edit`} className="text-blue-500 hover:underline text-sm">Edit</Link>
                  <form action={async () => { "use server"; await deleteAdAction(ad.id); }} className="inline">
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