import { notFound } from "next/navigation";
import { AnimeForm } from "@/components/admin/anime-form";
import { SeasonsManager } from "@/components/admin/seasons-manager";
import {
  getAnimeForEdit,
  getAllGenresForAnimeAdmin,
} from "@/server/actions/admin/anime";

export const metadata = { title: "Edit Anime" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditAnimePage({ params }: Props) {
  const { id } = await params;
  const [anime, genres] = await Promise.all([
    getAnimeForEdit(id),
    getAllGenresForAnimeAdmin(),
  ]);

  if (!anime) {
    notFound();
  }

  return (
    <div className="max-w-[1600px] space-y-8">
      <AnimeForm
        mode="edit"
        animeId={anime.id}
        genres={genres}
        initialData={{
          id: anime.id,
          title: anime.title,
          description: anime.description,
          shortDesc: anime.shortDesc,
          releaseYear: anime.releaseYear,
          language: anime.language,
          country: anime.country,
          posterUrl: anime.posterUrl,
          backdropUrl: anime.backdropUrl,
          trailerUrl: anime.trailerUrl,
          status: anime.status,
          isFeatured: anime.isFeatured,
          genres: anime.genres.map((g) => ({ id: g.id })),
        }}
      />

      {anime.series && (
        <SeasonsManager
          seriesContentId={anime.id}
          seasons={anime.series.seasons}
        />
      )}
    </div>
  );
}