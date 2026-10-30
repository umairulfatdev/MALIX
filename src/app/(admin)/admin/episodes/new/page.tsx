import { EpisodeForm } from "@/components/admin/episode-form";
import { getSeriesWithSeasons } from "@/server/actions/admin/episodes";

export const metadata = { title: "Add New Episode" };

export default async function NewEpisodePage() {
  const series = await getSeriesWithSeasons();

  return (
    <div className="max-w-[1600px]">
      <EpisodeForm series={series} />
    </div>
  );
}