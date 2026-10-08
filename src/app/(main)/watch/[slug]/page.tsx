import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, Clock, Calendar, ArrowLeft } from "lucide-react";
import { getWatchContent } from "@/server/actions/watch";
import { EpisodeNav } from "@/components/player/episode-nav";
import { WatchClient } from "./watch-client";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ episode?: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const content = await getWatchContent(slug);
  if (!content) return { title: "Not Found" };
  return { title: `Watch ${content.title}` };
}

export default async function WatchPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { episode: episodeId } = await searchParams;

  const content = await getWatchContent(slug, episodeId);

  if (!content) notFound();

  const isSeries = content.type === "SERIES";

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-8">
      <Link
        href={`/content/${content.slug}`}
        className="inline-flex items-center gap-2 text-zinc-400 hover:text-yellow-500 transition-colors mb-4 text-sm"
      >
        <ArrowLeft size={16} />
        Back to Details
      </Link>

      <WatchClient content={content} />

      {isSeries && (
        <EpisodeNav
          slug={content.slug}
          prevEpisodeId={content.prevEpisodeId || null}
          nextEpisodeId={content.nextEpisodeId || null}
          currentSeason={content.seasonNumber}
          currentEpisode={content.episodeNumber}
        />
      )}

      <div className="mt-6 md:mt-8">
        <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white mb-3">
          {content.title}
          {isSeries && content.episodeTitle && (
            <span className="text-yellow-500">
              {" · "}
              {content.episodeTitle}
            </span>
          )}
        </h1>

        <div className="flex items-center flex-wrap gap-3 md:gap-4 mb-6 text-sm">
          {content.avgRating && content.avgRating > 0 && (
            <div className="flex items-center gap-1.5">
              <Star size={14} className="fill-yellow-400 text-yellow-400" />
              <span className="font-bold text-white">
                {content.avgRating.toFixed(1)}
              </span>
            </div>
          )}
          {content.releaseYear && (
            <span className="flex items-center gap-1.5 text-zinc-400">
              <Calendar size={14} /> {content.releaseYear}
            </span>
          )}
          {content.duration && (
            <span className="flex items-center gap-1.5 text-zinc-400">
              <Clock size={14} /> {content.duration} min
            </span>
          )}
          {isSeries && content.seasonNumber && content.episodeNumber && (
            <span className="px-2.5 py-1 rounded-md bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-xs font-bold">
              S{content.seasonNumber} · E{content.episodeNumber}
            </span>
          )}
        </div>

        {content.genres.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {content.genres.map((g) => (
              <span
                key={g.id}
                className="text-xs md:text-sm px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-zinc-300"
              >
                {g.name}
              </span>
            ))}
          </div>
        )}

        <p className="text-zinc-300 text-base leading-relaxed max-w-3xl">
          {isSeries && content.episodeDescription
            ? content.episodeDescription
            : content.description}
        </p>
      </div>
    </div>
  );
}