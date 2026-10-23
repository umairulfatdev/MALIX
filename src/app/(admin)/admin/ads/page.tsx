import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdsPage() {
  const ads = await prisma.ad.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Ads Management</h1>
        <Link href="/admin/ads/new" className="px-4 py-2 bg-yellow-500 text-black rounded-lg font-bold">
          + Add Ad
        </Link>
      </div>
      <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="p-3 text-left text-zinc-400">Title</th>
              <th className="p-3 text-left text-zinc-400">Type</th>
              <th className="p-3 text-left text-zinc-400">Position</th>
              <th className="p-3 text-left text-zinc-400">Status</th>
            </tr>
          </thead>
          <tbody>
            {ads.map((ad) => (
              <tr key={ad.id} className="border-t border-white/5">
                <td className="p-3 text-white">{ad.title}</td>
                <td className="p-3 text-zinc-300">{ad.type}</td>
                <td className="p-3 text-zinc-300">{ad.position}</td>
                <td className="p-3">
                  <span className={ad.isActive ? "text-green-500" : "text-red-500"}>
                    {ad.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}