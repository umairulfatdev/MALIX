import { notFound } from "next/navigation";
import { MovieForm } from "@/components/admin/movie-form";
import {
  getMovieForEdit,
  getAllGenresForAdmin,
} from "@/server/actions/admin/content";

export const metadata = {
  title: "Edit Movie",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditMoviePage({ params }: Props) {
  const { id } = await params;
  const [movie, genres] = await Promise.all([
    getMovieForEdit(id),
    getAllGenresForAdmin(),
  ]);

  if (!movie) {
    notFound();
  }

  return (
    <div className="max-w-[1600px]">
      <MovieForm
        mode="edit"
        movieId={movie.id}
        genres={genres}
        initialData={{
          id: movie.id,
          title: movie.title,
          description: movie.description,
          shortDesc: movie.shortDesc,
          releaseYear: movie.releaseYear,
          duration: movie.duration,
          language: movie.language,
          country: movie.country,
          posterUrl: movie.posterUrl,
          backdropUrl: movie.backdropUrl,
          trailerUrl: movie.trailerUrl,
          status: movie.status,
          isFeatured: movie.isFeatured,
          genres: movie.genres.map((g) => ({ id: g.id })),
        }}
      />
    </div>
  );
}