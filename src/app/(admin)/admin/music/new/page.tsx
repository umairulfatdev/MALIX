import { MusicForm } from "@/components/admin/music-form";

export const metadata = { title: "Add Music | Admin" };

export default function NewMusicPage() {
  return (
    <div className="max-w-[1600px]">
      <MusicForm />
    </div>
  );
}