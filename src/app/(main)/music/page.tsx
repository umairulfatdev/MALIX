import Link from "next/link";
import { Music, Play } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Music | MALIX",
  description: "Listen to the best music tracks on MALIX",
};

export default async function MusicPage() {
  const songs = await prisma.content.findMany({
    where: { 
      type: "MUSIC", 
      status: "PUBLISHED" 
    },
    include: { 
      music: true,
      genres: true 
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Music size={32} className="text-yellow-500" />
        <h1 className="text-3xl md:text-4xl font-black text-white">Music</h1>
      </div>

      {songs.length === 0 ? (
        <div className="text-center p-12 bg-white/5 rounded-2xl border border-white/10">
          <p className="text-zinc-400">No music added yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {songs.map((song) => (
            <Link key={song.id} href={`/content/${song.slug}`} className="group">
              <div className="aspect-square rounded-xl overflow-hidden relative bg-zinc-900 border border-white/10 group-hover:border-yellow-500/50 transition-all">
                {song.posterUrl ? (
                   <img src={song.posterUrl} alt={song.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                   <div className="w-full h-full flex items-center justify-center text-zinc-600"><Music size={40} /></div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Play size={40} className="text-yellow-500 fill-yellow-500" />
                </div>
              </div>
              <h3 className="text-white font-bold mt-3 truncate">{song.title}</h3>
              <p className="text-zinc-400 text-sm truncate">{song.music?.artist || "Unknown Artist"}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}