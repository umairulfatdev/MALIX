"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Play, Music, Search } from "lucide-react";

export default function MusicPage() {
  const [songs, setSongs] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/music")
      .then((res) => res.json())
      .then((data) => {
        setSongs(data);
        setLoading(false);
      });
  }, []);

  const filtered = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(search.toLowerCase()) ||
      (song.music?.artist || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Music className="text-yellow-500" size={32} />
          <h1 className="text-3xl font-bold text-white">Music</h1>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
          <input
            type="text"
            placeholder="Search songs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#151515] border border-white/10 rounded-lg text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:border-yellow-500"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-zinc-400">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-zinc-500">No songs found.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filtered.map((song) => (
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
      )}
    </div>
  );
}