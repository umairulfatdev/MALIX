"use client";

import { useRouter } from "next/navigation";
import { VideoPlayer } from "@/components/player/video-player";
import type { WatchContent } from "@/server/actions/watch";

interface WatchClientProps {
  content: WatchContent;
}

export function WatchClient({ content }: WatchClientProps) {
  return (
    <VideoPlayer
      url={content.videoUrl || ""}
      poster={content.backdropUrl || content.posterUrl}
      title={content.title}
      downloadUrl={content.downloadUrl || null}
    />
  );
}