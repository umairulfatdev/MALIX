import { ComingSoonForm } from "@/components/admin/coming-soon-form";
import { getAllGenresForComingSoonAdmin } from "@/server/actions/admin/coming-soon";

export const metadata = { title: "Add Coming Soon" };

export default async function NewComingSoonPage() {
  const genres = await getAllGenresForComingSoonAdmin();

  return (
    <div className="max-w-[1600px]">
      <ComingSoonForm mode="create" genres={genres} />
    </div>
  );
}