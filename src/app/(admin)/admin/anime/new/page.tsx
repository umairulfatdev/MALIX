import { AnimeForm } from "@/components/admin/anime-form";
import { getAllGenresForAnimeAdmin } from "@/server/actions/admin/anime";

export const metadata = { title: "Add New Anime" };

export default async function NewAnimePage() {
  const genres = await getAllGenresForAnimeAdmin();

  return (
    <div className="max-w-[1600px]">
      <AnimeForm mode="create" genres={genres} />
    </div>
  );
}