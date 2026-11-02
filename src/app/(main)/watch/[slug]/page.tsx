import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Play, Video, Download } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function WatchPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const content = await prisma.content.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: { 
      videoSources: true,
      series: {
        include: {
          seasons: {
            orderBy: { seasonNumber: "asc" },
            include: {
              episodes: {
                orderBy: { episodeNum: "asc" }
              }
            }
          }
        }
      }
    },
  });

  if (!content) notFound();

  // Agar SERIES hai, toh Seasons aur Episodes ki list dikhao
  if (content.type === "SERIES" && content.series) {
    return (
      <div className="min-h-screen bg-black text-white pt-20 pb-12">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          <Link href={`/content/${content.slug}`} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition">
            <ArrowLeft size={20} /> Back to Details
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold">{content.title}</h1>
            <p className="text-zinc-400 mt-2">{content.description}</p>
          </div>

          <div className="space-y-6">
            {content.series.seasons.length === 0 ? (
              <div className="text-center py-12 bg-zinc-900/50 rounded-xl border border-white/10">
                <Video size={40} className="mx-auto text-zinc-600 mb-3" />
                <p className="text-zinc-400">No episodes available yet.</p>
              </div>
            ) : (
              content.series.seasons.map((season) => (
                <div key={season.id} className="bg-zinc-900/50 rounded-xl border border-white/10 overflow-hidden">
                  <div className="p-4 border-b border-white/10 bg-white/5">
                    <h2 className="text-xl font-bold text-yellow-400">
                      Season {season.seasonNumber} {season.title && `: ${season.title}`}
                    </h2>
                  </div>
                  <div className="divide-y divide-white/5">
                    {season.episodes.length === 0 ? (
                      <div className="p-4 text-zinc-500 text-sm">No episodes in this season.</div>
                    ) : (
                      season.episodes.map((episode) => (
                        <div key={episode.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition group">
                          <Link 
                            href={`/watch/${content.slug}/episode/${episode.id}`}
                            className="flex items-center gap-4 flex-1"
                          >
                            <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0 group-hover:bg-yellow-500/20 transition">
                              <Play size={20} className="text-zinc-400 group-hover:text-yellow-400 transition" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-white group-hover:text-yellow-400 transition">
                                E{episode.episodeNum}: {episode.title}
                              </h3>
                              {episode.description && (
                                <p className="text-sm text-zinc-500 truncate">{episode.description}</p>
                              )}
                            </div>
                            {episode.duration && (
                              <span className="text-sm text-zinc-500 font-mono mr-4">{episode.duration} min</span>
                            )}
                          </Link>
                          
                          {/* 👈 Download Button */}
                          {episode.videoUrl && (
                            <a 
                              href={episode.videoUrl}
                              download
                              target="_blank"
                              className="p-2 rounded-lg bg-white/5 hover:bg-yellow-500/20 text-zinc-400 hover:text-yellow-400 transition"
                              title="Download Episode"
                            >
                              <Download size={18} />
                            </a>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // Agar MOVIE hai, toh seedha Video Player dikhao
  let videoUrl = content.videoSources.find((v) => v.isDefault)?.url || content.trailerUrl;
  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };
  const ytId = videoUrl ? getYoutubeId(videoUrl) : null;

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        <Link href={`/content/${content.slug}`} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition">
          <ArrowLeft size={20} /> Back to Details
        </Link>

        <div className="w-full aspect-video bg-zinc-900 rounded-xl overflow-hidden shadow-2xl relative">
          {ytId ? (
            <iframe
              src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
              className="w-full h-full absolute inset-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : videoUrl ? (
            <video src={videoUrl} controls autoPlay className="w-full h-full object-contain" />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500">
              <Play size={60} className="mb-4 opacity-50" />
              <p>No video available for this content.</p>
            </div>
          )}
        </div>

        <div className="mt-8">
          <h1 className="text-3xl font-bold">{content.title}</h1>
          <p className="text-zinc-400 mt-2">{content.description}</p>
        </div>
      </div>
    </div>
  );
}