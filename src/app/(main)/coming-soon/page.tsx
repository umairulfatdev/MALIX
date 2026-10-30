import { prisma } from "@/lib/prisma";
import { ContentCard } from "@/components/content/content-card";
import { EmptyState } from "@/components/content/empty-state";
import { ComingSoonModal } from "@/components/content/coming-soon-modal";

export const metadata = {
  title: "Coming Soon | MALIX",
  description: "Get ready for upcoming movies, series, and anime on MALIX",
};

export default async function ComingSoonPage() {
  const comingSoonItems = await prisma.content.findMany({
    where: {
      isComingSoon: true,
      status: "PUBLISHED", 
    },
    orderBy: {
      comingSoonDate: "asc", 
    },
    include: {
      genres: true,
    },
  });

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-12">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">
          <span
            style={{
              background: "linear-gradient(135deg, #fde68a 0%, #fbbf24 50%, #f59e0b 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Coming Soon
          </span>
        </h1>
        <p className="text-zinc-400 max-w-2xl">
          Get ready for the most anticipated movies, series, and anime. Watch trailers and mark your calendars!
        </p>
      </div>

      {comingSoonItems.length === 0 ? (
        <EmptyState
          title="Nothing coming soon yet"
          description="Check back later for upcoming releases."
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {comingSoonItems.map((item) => (
            <ComingSoonModal key={item.id} item={item}>
              <ContentCard
                href="#"
                title={item.title}
                posterUrl={item.posterUrl}
                year={item.releaseYear}
                rating={item.avgRating}
              />
            </ComingSoonModal>
          ))}
        </div>
      )}
    </div>
  );
}