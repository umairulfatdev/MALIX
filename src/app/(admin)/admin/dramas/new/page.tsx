import { DramaForm } from "@/components/admin/drama-form";
import { getAllGenresForDramaAdmin } from "@/server/actions/admin/dramas";

export const metadata = { title: "Add New Drama" };

export default async function NewDramaPage() {
  const genres = await getAllGenresForDramaAdmin();

  return (
    <div className="max-w-[1600px]">
      <DramaForm mode="create" genres={genres} />
    </div>
  );
}