import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma"; // 👈 NAYA: prisma import kiya
import { MovieForm } from "@/components/admin/movie-form";
import {
  getMovieForEdit,
  getAllGenresForAdmin,
} from "@/server/actions/admin/content";

export const dynamic = "force-dynamic";

export const metadata = { title: "Edit Movie" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditMoviePage({ params }: Props) {
  const { id } = await params;
  
  // 👇 NAYA: Ab yahan drives bhi fetch honge
  const [movie, genres, drives] = await Promise.all([
    getMovieForEdit(id),
    getAllGenresForAdmin(),
    prisma.drive.findMany({ where: { isActive: true }, select: { id: true, name: true } })
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
        drives={drives} // 👈 NAYA: Drives form ko bheje
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
          videoUrl: movie.videoUrl,
          downloadUrl: movie.downloadUrl,
          status: movie.status,
          isFeatured: movie.isFeatured,
          driveId: movie.driveId, // 👈 NAYA: Pehle se selected drive pass ki
          genres: movie.genres.map((g) => ({ id: g.id })),
        }}
      />
    </div>
  );
}