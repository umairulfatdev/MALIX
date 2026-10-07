import { SeriesForm } from "@/components/admin/series-form";
import { getAllGenresForSeriesAdmin } from "@/server/actions/admin/series";

export const metadata = { title: "Add New Series" };

export default async function NewSeriesPage() {
  const genres = await getAllGenresForSeriesAdmin();

  return (
    <div className="max-w-[1600px]">
      <SeriesForm mode="create" genres={genres} />
    </div>
  );
}