import Link from "next/link";
import { Play, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";

interface RelatedContentProps {
  currentId: string;
  type: "MOVIE" | "SERIES" | "ANIME" | "MUSIC" | "DRAMA";
}

export async function RelatedContent({ currentId, type }: RelatedContentProps) {
  // Database se usi type ka content uthayenge, current content ko chhod kar
  const relatedItems = await prisma.content.findMany({
    where: {
      type: type,
      status: "PUBLISHED",
      isComingSoon: false,
      id: { not: currentId }, // Jo movie user dekh raha hai, woh na aaye
    },
    orderBy: { totalViews: "desc" }, // Sabse zyada dekhi jane wali movies
    take: 10,
  });

  // Agar music hai toh 'isComingSoon' ki zaroorat nahi, par code same chalega
  if (relatedItems.length === 0) return null;

  const title =
    type === "MOVIE" ? "More Movies Like This" :
    type === "SERIES" ? "More Series Like This" :
    type === "ANIME" ? "More Anime Like This" :
    type === "MUSIC" ? "More Music Like This" : "More Dramas Like This";

  return (
    <div className="mt-16 pt-8 border-t border-white/10">
      <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x">
        {relatedItems.map((item) => (
          <Link
            key={item.id}
            href={`/content/${item.slug}`}
            className="group relative flex-shrink-0 w-[160px] md:w-[200px] transition-all duration-300 hover:-translate-y-2"
          >
            <div className="aspect-[2/3] rounded-xl overflow-hidden border border-white/10 relative bg-zinc-900 group-hover:border-yellow-500/50">
              {item.posterUrl ? (
                <img src={item.posterUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-600 font-bold">MALIX</div>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center transform scale-50 group-hover:scale-100 transition-transform">
                  <Play size={16} className="fill-black text-black ml-1" />
                </div>
              </div>
              {item.avgRating && item.avgRating > 0 && (
                <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/80 flex items-center gap-1">
                  <Star size={10} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-[10px] font-bold text-white">{item.avgRating.toFixed(1)}</span>
                </div>
              )}
            </div>
            <div className="mt-2">
              <h3 className="text-sm font-bold text-white truncate group-hover:text-yellow-500">{item.title}</h3>
              <p className="text-xs text-zinc-400">{item.releaseYear}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}