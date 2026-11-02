import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Play, Download } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function EpisodePlayerPage({ 
  params 
}: { 
  params: Promise<{ slug: string; episodeId: string }> 
}) {
  const { slug, episodeId } = await params;

  const episode = await prisma.episode.findUnique({
    where: { id: episodeId },
    include: {
      season: {
        include: {
          series: {
            include: { content: true }
          }
        }
      }
    }
  });

  if (!episode || episode.season.series.content.slug !== slug) notFound();

  const videoUrl = episode.videoUrl;
  
  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };
  const ytId = videoUrl ? getYoutubeId(videoUrl) : null;

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        <Link href={`/watch/${slug}`} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition">
          <ArrowLeft size={20} /> Back to Episodes
        </Link>

        <div className="w-full aspect-video bg-zinc-900 rounded-xl overflow-hidden shadow-2xl relative mb-8">
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
              <p>No video available for this episode.</p>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              E{episode.episodeNum}: {episode.title}
            </h1>
            <p className="text-zinc-400 mt-2">{episode.description}</p>
          </div>
          
          {videoUrl && (
            <a 
              href={videoUrl} 
              download 
              target="_blank"
              className="btn-cosmic flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold flex-shrink-0"
            >
              <Download size={18} />
              Download Episode
            </a>
          )}
        </div>
      </div>
    </div>
  );
}