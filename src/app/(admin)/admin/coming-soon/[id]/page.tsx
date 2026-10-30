import { notFound } from "next/navigation";
import { ComingSoonForm } from "@/components/admin/coming-soon-form";
import { getAllGenresForComingSoonAdmin, getComingSoonForEdit } from "@/server/actions/admin/coming-soon";

export const metadata = { title: "Edit Coming Soon" };

export default async function EditComingSoonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [genres, content] = await Promise.all([
    getAllGenresForComingSoonAdmin(),
    getComingSoonForEdit(id),
  ]);

  if (!content) notFound();

  return (
    <div className="max-w-[1600px]">
      <ComingSoonForm
        mode="edit"
        contentId={content.id}
        initialData={{
          ...content,
          type: content.type,
          comingSoonDate: content.comingSoonDate,
          genres: content.genres,
        }}
        genres={genres}
      />
    </div>
  );
}