import { notFound } from "next/navigation";
import { DramaForm } from "@/components/admin/drama-form";
import {
  getDramaForEdit,
  getAllGenresForDramaAdmin,
} from "@/server/actions/admin/dramas";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Edit Drama",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditDramaPage({ params }: Props) {
  const { id } = await params;
  const [drama, genres] = await Promise.all([
    getDramaForEdit(id),
    getAllGenresForDramaAdmin(),
  ]);

  if (!drama) {
    notFound();
  }

  return (
    <div className="max-w-[1600px]">
      <DramaForm
        mode="edit"
        dramaId={drama.id}
        genres={genres}
        initialData={{
          id: drama.id,
          title: drama.title,
          description: drama.description,
          shortDesc: drama.shortDesc,
          releaseYear: drama.releaseYear,
          duration: drama.duration,
          language: drama.language,
          country: drama.country,
          posterUrl: drama.posterUrl,
          backdropUrl: drama.backdropUrl,
          trailerUrl: drama.trailerUrl,
          status: drama.status,
          isFeatured: drama.isFeatured,
          genres: drama.genres.map((g) => ({ id: g.id })),
          drama: drama.drama,
        }}
      />
    </div>
  );
}