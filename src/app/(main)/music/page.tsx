import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Play, Music } from "lucide-react";

export default async function MusicPage() {
  const songs = await prisma.content.findMany({
    where: { type: "MUSIC", status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    include: { music: true },
  });

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Music className="text-yellow-500" size={32} />
        <h1 className="text-3xl font-bold text-white">Music</h1>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {songs.map((song) => (
          <Link key={song.id} href={`/content/${song.slug}`} className="group">
            <div className="aspect-square rounded-xl overflow-hidden bg-zinc-900 relative">
              {song.posterUrl ? (
                <img src={song.posterUrl} alt={song.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music className="text-zinc-600" size={48} />
                </div>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center">
                  <Play size={20} className="fill-black text-black ml-1" />
                </div>
              </div>
            </div>
            <p className="mt-2 text-sm font-bold text-white truncate">{song.title}</p>
            <p className="text-xs text-zinc-500">{song.music?.artist}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}