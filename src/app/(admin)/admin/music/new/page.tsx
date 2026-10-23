import MusicForm from "@/components/admin/music-form";
import { createMusicAction } from "@/server/actions/admin/music";

export default function NewMusicPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-white mb-6">Add New Music</h1>
      <MusicForm action={createMusicAction} />
    </div>
  );
}