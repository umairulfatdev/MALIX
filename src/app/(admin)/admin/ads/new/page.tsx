import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default function NewAdPage() {
  async function createAd(formData: FormData) {
    "use server";
    await prisma.ad.create({
      data: {
        title: formData.get("title") as string,
        type: formData.get("type") as string,
        imageUrl: formData.get("imageUrl") as string || null,
        videoUrl: formData.get("videoUrl") as string || null,
        linkUrl: formData.get("linkUrl") as string || null,
        position: formData.get("position") as string,
        isActive: true,
      },
    });
    revalidatePath("/admin/ads");
    redirect("/admin/ads");
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-6">Add New Ad</h1>
      <form action={createAd} className="space-y-4">
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Title</label>
          <input name="title" required className="w-full px-4 py-2 bg-[#111] border border-white/10 rounded-lg text-white" />
        </div>
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Type</label>
          <select name="type" className="w-full px-4 py-2 bg-[#111] border border-white/10 rounded-lg text-white">
            <option value="banner">Banner</option>
            <option value="pre-roll">Pre-roll Video</option>
            <option value="popup">Popup</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Position</label>
          <select name="position" className="w-full px-4 py-2 bg-[#111] border border-white/10 rounded-lg text-white">
            <option value="homepage">Homepage</option>
            <option value="watch">Watch Page</option>
            <option value="detail">Detail Page</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Image URL (Banner)</label>
          <input name="imageUrl" className="w-full px-4 py-2 bg-[#111] border border-white/10 rounded-lg text-white" />
        </div>
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Video URL (Pre-roll)</label>
          <input name="videoUrl" className="w-full px-4 py-2 bg-[#111] border border-white/10 rounded-lg text-white" />
        </div>
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Link URL (Click)</label>
          <input name="linkUrl" className="w-full px-4 py-2 bg-[#111] border border-white/10 rounded-lg text-white" />
        </div>
        <button type="submit" className="w-full py-3 bg-yellow-500 text-black font-bold rounded-lg">Create Ad</button>
      </form>
    </div>
  );
}