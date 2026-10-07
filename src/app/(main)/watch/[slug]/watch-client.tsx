"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { VideoPlayer } from "@/components/player/video-player";
import { saveWatchProgress } from "@/server/actions/watch";
import type { WatchContent } from "@/server/actions/watch";

interface WatchClientProps {
  content: WatchContent;
}

export function WatchClient({ content }: WatchClientProps) {
  const router = useRouter();

  const handleProgressUpdate = useCallback(
    async (position: number, duration: number) => {
      await saveWatchProgress(
        content.id,
        content.episodeId || null,
        position,
        duration
      );
    },
    [content.id, content.episodeId]
  );

  const handleEnded = useCallback(() => {
    // Auto-navigate to next episode if available
    if (content.nextEpisodeId) {
      router.push(`/watch/${content.slug}?episode=${content.nextEpisodeId}`);
    }
  }, [content.nextEpisodeId, content.slug, router]);

  return (
    <VideoPlayer
      src={content.videoUrl}
      poster={content.backdropUrl || content.posterUrl}
      title={content.title}
      contentId={content.id}
      episodeId={content.episodeId || null}
      initialPosition={content.initialProgress?.position || 0}
      autoPlay={false}
      onProgressUpdate={handleProgressUpdate}
      onEnded={handleEnded}
    />
  );
}