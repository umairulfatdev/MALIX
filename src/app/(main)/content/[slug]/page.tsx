import { notFound } from "next/navigation";
import Link from "next/link";
import { Star, Clock, Calendar, Play, Download, Heart } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function ContentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const content = await prisma.content.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      genres: true,
      videoSources: { where: { isDefault: true }, take: 1 },
      downloadOptions: true, // 👈 NAYA: Download options fetch
    },
  });

  if (!content) notFound();

  // 👇 NAYA: Check karo ke downloadOptions hain ya nahi
  const hasDownloads = content.downloadOptions && content.downloadOptions.length > 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="relative w-full h-[50vh] md:h-[70vh]">
        {content.backdropUrl ? (
          <img src={content.backdropUrl} alt={content.title} className="w-full h-full object-cover opacity-40" />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-zinc-900 to-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent" />
      </div>

      <div className="max-w-[1200px] mx-auto px-4 md:px-8 -mt-32 md:-mt-48 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          
          <div className="w-full md:w-72 flex-shrink-0">
            <div className="aspect-[2/3] rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-zinc-900">
              {content.posterUrl ? (
                <img src={content.posterUrl} alt={content.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-600">No Poster</div>
              )}
            </div>
          </div>

          <div className="flex-1 pt-4 md:pt-16">
            <h1 className="text-3xl md:text-5xl font-black mb-4">{content.title}</h1>

            <div className="flex items-center flex-wrap gap-4 mb-6 text-sm text-zinc-300">
              {content.avgRating > 0 && (
                <div className="flex items-center gap-1">
                  <Star size={16} className="fill-yellow-500 text-yellow-500" />
                  <span className="font-bold text-white">{content.avgRating.toFixed(1)}</span>
                </div>
              )}
              {content.releaseYear && (
                <span className="flex items-center gap-1"><Calendar size={16} /> {content.releaseYear}</span>
              )}
              {content.duration && (
                <span className="flex items-center gap-1"><Clock size={16} /> {content.duration} min</span>
              )}
              {content.quality && (
                <span className="px-2 py-0.5 rounded border border-yellow-500/30 bg-yellow-500/10 text-yellow-500 text-xs font-bold">
                  {content.quality}
                </span>
              )}
            </div>

            {content.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {content.genres.map((g) => (
                  <span key={g.id} className="px-3 py-1 rounded-md bg-white/10 text-xs font-medium">{g.name}</span>
                ))}
              </div>
            )}

            <p className="text-zinc-300 leading-relaxed mb-8 max-w-3xl">{content.description}</p>

            <div className="flex flex-wrap items-center gap-4">
              <Link href={`/watch/${content.slug}`} className="flex items-center gap-2 px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition">
                <Play size={20} className="fill-black" /> Watch Now
              </Link>

              {/* 👇 DOWNLOAD BUTTON LOGIC */}
              {hasDownloads ? (
                <div className="relative group">
                  <button className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl transition font-semibold">
                    <Download size={18} /> Download
                  </button>
                  <div className="absolute top-full left-0 mt-2 w-48 bg-zinc-900 border border-white/10 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    {content.downloadOptions.map((opt) => (
                      <a key={opt.id} href={opt.fileUrl} target="_blank" rel="noopener noreferrer" className="block px-4 py-3 text-sm hover:bg-white/5 border-b border-white/5 last:border-0 font-medium">
                        {opt.quality} ({opt.format})
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <button disabled className="flex items-center gap-2 px-6 py-3 bg-white/5 text-zinc-500 border border-white/5 rounded-xl cursor-not-allowed">
                  <Download size={18} /> Downloads not enabled
                </button>
              )}

              <button className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl transition font-semibold">
                <Heart size={18} /> Add to Watchlist
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}