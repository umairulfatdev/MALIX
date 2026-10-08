import { HeroBanner } from "@/components/content/hero-banner";
import { ContentRow } from "@/components/content/content-row";
import { ContinueWatchingRow } from "@/components/content/continue-watching-row";
import { FloatingPlanet } from "@/components/effects/floating-planet";
import { getContinueWatching } from "@/server/actions/history";

// ✅ Force dynamic — skip build-time DB queries
export const dynamic = "force-dynamic";
export const dynamicParams = true;

const SAMPLE_DATA = {
  movies: [
    { id: "1", title: "The Dark Horizon", slug: "the-dark-horizon", posterUrl: null, releaseYear: 2024, avgRating: 8.5, type: "MOVIE" },
    { id: "2", title: "Midnight Protocol", slug: "midnight-protocol", posterUrl: null, releaseYear: 2023, avgRating: 7.9, type: "MOVIE" },
    { id: "3", title: "Crimson Tides", slug: "crimson-tides", posterUrl: null, releaseYear: 2024, avgRating: 8.2, type: "MOVIE" },
    { id: "4", title: "The Last Signal", slug: "the-last-signal", posterUrl: null, releaseYear: 2022, avgRating: 7.4, type: "MOVIE" },
    { id: "5", title: "Neon Requiem", slug: "neon-requiem", posterUrl: null, releaseYear: 2024, avgRating: 8.8, type: "MOVIE" },
    { id: "6", title: "Solar Winds", slug: "solar-winds", posterUrl: null, releaseYear: 2023, avgRating: 7.6, type: "MOVIE" },
  ],
  series: [
    { id: "s1", title: "Empire of Shadows", slug: "empire-of-shadows", posterUrl: null, releaseYear: 2024, avgRating: 9.1, type: "SERIES" },
    { id: "s2", title: "Silent Waters", slug: "silent-waters", posterUrl: null, releaseYear: 2023, avgRating: 8.6, type: "SERIES" },
    { id: "s3", title: "The Midnight Files", slug: "the-midnight-files", posterUrl: null, releaseYear: 2024, avgRating: 8.3, type: "SERIES" },
    { id: "s4", title: "Broken Compass", slug: "broken-compass", posterUrl: null, releaseYear: 2022, avgRating: 7.8, type: "SERIES" },
    { id: "s5", title: "Echoes of Tomorrow", slug: "echoes-of-tomorrow", posterUrl: null, releaseYear: 2024, avgRating: 8.9, type: "SERIES" },
    { id: "s6", title: "Beyond the Void", slug: "beyond-the-void", posterUrl: null, releaseYear: 2023, avgRating: 8.1, type: "SERIES" },
  ],
  dramas: [
    { id: "d1", title: "Fading Petals", slug: "fading-petals", posterUrl: null, releaseYear: 2024, avgRating: 8.9, type: "DRAMA" },
    { id: "d2", title: "The Promise", slug: "the-promise", posterUrl: null, releaseYear: 2023, avgRating: 8.4, type: "DRAMA" },
    { id: "d3", title: "Autumn Letters", slug: "autumn-letters", posterUrl: null, releaseYear: 2024, avgRating: 8.7, type: "DRAMA" },
    { id: "d4", title: "Where the Sun Sets", slug: "where-the-sun-sets", posterUrl: null, releaseYear: 2023, avgRating: 8.2, type: "DRAMA" },
    { id: "d5", title: "The Paper House", slug: "the-paper-house", posterUrl: null, releaseYear: 2024, avgRating: 8.5, type: "DRAMA" },
    { id: "d6", title: "Whispers of Rain", slug: "whispers-of-rain", posterUrl: null, releaseYear: 2022, avgRating: 7.9, type: "DRAMA" },
  ],
};

const HERO = {
  title: "Empire of Shadows",
  slug: "empire-of-shadows",
  type: "Series",
  description:
    "In a city where power is currency and secrets are the only truth, a young detective uncovers a conspiracy that reaches the highest offices of the empire. Every step closer to the truth brings her closer to her own undoing.",
  backdropUrl: null,
  year: 2024,
  rating: 9.1,
  duration: 52,
  genres: ["Crime", "Thriller", "Mystery"],
};

export default async function HomePage() {
  // ✅ Safe fetch — agar DB connect nahi hua, crash nahi hoga
  let continueWatching: any[] = [];
  try {
    continueWatching = await getContinueWatching(10);
  } catch (error) {
    console.warn("Continue watching fetch failed:", error);
    continueWatching = [];
  }

  return (
    <div className="pb-10">
      {/* Hero with floating planet */}
      <div className="relative">
        <HeroBanner {...HERO} />
        <FloatingPlanet />
      </div>

      {/* Content rows */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12 -mt-16 md:-mt-24 relative z-10">
        {/* ✅ Continue Watching (only if user has history) */}
        {continueWatching.length > 0 && (
          <ContinueWatchingRow items={continueWatching} />
        )}

        <ContentRow
          title="Trending Across the Galaxy"
          items={SAMPLE_DATA.movies}
          hrefPrefix="/content"
        />
        <ContentRow
          title="Top 10 Constellations Today"
          items={SAMPLE_DATA.series}
          hrefPrefix="/content"
          showNumbers
        />
        <ContentRow
          title="Popular Movies"
          items={SAMPLE_DATA.movies}
          hrefPrefix="/content"
        />
        <ContentRow
          title="Popular Dramas"
          items={SAMPLE_DATA.dramas}
          hrefPrefix="/content"
        />
        <ContentRow
          title="Top Rated Series"
          items={SAMPLE_DATA.series}
          hrefPrefix="/content"
        />
      </div>
    </div>
  );
}