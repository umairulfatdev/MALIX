import { MovieForm } from "@/components/admin/movie-form";
import { getAllGenresForAdmin } from "@/server/actions/admin/content";

export const metadata = {
  title: "Add New Movie",
};

export default async function NewMoviePage() {
  const genres = await getAllGenresForAdmin();

  return (
    <div className="max-w-[1600px]">
      <MovieForm mode="create" genres={genres} />
    </div>
  );
}