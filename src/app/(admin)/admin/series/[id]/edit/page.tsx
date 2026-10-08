import { notFound } from "next/navigation";
import { SeriesForm } from "@/components/admin/series-form";
import { SeasonsManager } from "@/components/admin/seasons-manager";
import {
  getSeriesForEdit,
  getAllGenresForSeriesAdmin,
} from "@/server/actions/admin/series";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Edit Series",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditSeriesPage({ params }: Props) {
  const { id } = await params;
  const [series, genres] = await Promise.all([
    getSeriesForEdit(id),
    getAllGenresForSeriesAdmin(),
  ]);

  if (!series) {
    notFound();
  }

  return (
    <div className="max-w-[1600px] space-y-8">
      <SeriesForm
        mode="edit"
        seriesId={series.id}
        genres={genres}
        initialData={{
          id: series.id,
          title: series.title,
          description: series.description,
          shortDesc: series.shortDesc,
          releaseYear: series.releaseYear,
          language: series.language,
          country: series.country,
          posterUrl: series.posterUrl,
          backdropUrl: series.backdropUrl,
          trailerUrl: series.trailerUrl,
          status: series.status,
          isFeatured: series.isFeatured,
          genres: series.genres.map((g) => ({ id: g.id })),
        }}
      />

      {series.series && (
        <SeasonsManager
          seriesContentId={series.id}
          seasons={series.series.seasons}
        />
      )}
    </div>
  );
}