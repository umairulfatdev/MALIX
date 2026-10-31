import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Play } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function WatchPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const content = await prisma.content.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: { videoSources: true },
  });

  if (!content) notFound();

  // Video URL nikaalein
  let videoUrl = content.videoSources.find((v) => v.isDefault)?.url || content.trailerUrl;

  // YouTube ID nikaalne ka function
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
            <video
              src={videoUrl}
              controls
              autoPlay
              className="w-full h-full object-contain"
            />
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