import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import MusicForm from "@/components/admin/music-form";
import { updateMusicAction } from "@/server/actions/admin/music";

export default async function EditMusicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const content = await prisma.content.findUnique({
    where: { id, type: "MUSIC" },
    include: { music: true, videoSources: true },
  });

  if (!content) notFound();

  const videoUrl = content.videoSources.find((v) => v.isDefault)?.url || null;

  const action = async (prev: any, formData: FormData) => {
    "use server";
    return updateMusicAction(id, prev, formData);
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-white mb-6">Edit Music</h1>
      <MusicForm action={action} defaultValues={{ ...content, videoUrl }} />
    </div>
  );
}