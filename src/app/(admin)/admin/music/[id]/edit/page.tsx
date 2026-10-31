import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MusicForm } from "@/components/admin/music-form";

export default async function EditMusicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const content = await prisma.content.findUnique({
    where: { id, type: "MUSIC" },
    include: { music: true, videoSources: true },
  });

  if (!content) notFound();

  const videoUrl = content.videoSources.find((v) => v.isDefault)?.url || "";

  return (
    <div className="max-w-[1600px]">
      <MusicForm 
        mode="edit" 
        contentId={content.id} 
        initialData={{ ...content, videoUrl }} 
      />
    </div>
  );
}