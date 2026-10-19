import { prisma } from "@/lib/prisma";
import { MovieForm } from "@/components/admin/movie-form";
import { createMovieAction } from "@/server/actions/admin/content";

export default async function NewMoviePage() {
  // 1. Database se active drives fetch karo
  const drives = await prisma.drive.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-6">
      {/* 2. Form ko drives pass karo */}
      <MovieForm 
        mode="create" 
        genres={[]} 
        drives={drives} 
      />
    </div>
  );
}