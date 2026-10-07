import { notFound } from "next/navigation";
import Link from "next/link";
import { Star, Clock, Play, Calendar, Globe, MessageSquare } from "lucide-react";
import { getContentBySlug } from "@/server/actions/series";
import { getDownloadOptions } from "@/server/actions/downloads";
import { getContentRatingStats, getUserRating } from "@/server/actions/ratings";
import {
  getContentReviews,
  getUserReview,
} from "@/server/actions/reviews";
import { getCurrentUser } from "@/lib/auth";
import { ContentCard } from "@/components/content/content-card";
import { SeasonAccordion } from "@/components/content/season-accordion";
import { DownloadButton } from "@/components/content/download-button";
import { WatchlistButton } from "@/components/content/watchlist-button";
import { RatingSummary } from "@/components/content/rating-summary";
import { ReviewForm } from "@/components/content/review-form";
import { ReviewsList } from "@/components/content/reviews-list";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const content = await getContentBySlug(slug);
  if (!content) return { title: "Not Found" };
  return {
    title: content.title,
    description: content.description.slice(0, 160),
  };
}

export default async function ContentDetailPage({ params }: Props) {
  const { slug } = await params;
  const content = await getContentBySlug(slug);

  if (!content) {
    notFound();
  }

  // Fetch in parallel
  const [downloadOptions, user, ratingStats, userRating, reviews, userReview] =
    await Promise.all([
      getDownloadOptions(content.id),
      getCurrentUser(),
      getContentRatingStats(content.id),
      getUserRating(content.id),
      getContentReviews(content.id),
      getUserReview(content.id),
    ]);

  const hasDownloads = downloadOptions.length > 0;

  const typeLabel =
    content.type === "MOVIE"
      ? "Movie"
      : content.type === "SERIES"
        ? "Series"
        : content.type === "DRAMA"
          ? "Drama"
          : content.type;

  return (
    <div className="pb-16">
      {/* ============ HERO ============ */}
      <section className="relative">
        <div className="relative h-[60vh] min-h-[500px] overflow-hidden">
          {content.backdropUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={content.backdropUrl}
              alt={content.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 deep-space-bg" />
          )}
          <div className="absolute inset-0 hero-cosmic-gradient" />
          <div className="absolute inset-0 hero-cosmic-side" />
        </div>

        <div className="relative max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12 -mt-64 md:-mt-80 z-10">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Poster */}
            <div className="w-48 md:w-64 flex-shrink-0 mx-auto md:mx-0">
              <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-zinc-900 ring-1 ring-white/10 shadow-2xl shadow-yellow-500/10">
                {content.posterUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={content.posterUrl}
                    alt={content.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-950 to-black">
                    <span className="text-zinc-700 text-sm font-bold tracking-widest uppercase">
                      MALIX
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 pt-4 md:pt-24">
              <div className="inline-flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/40 px-3 py-1 rounded-full mb-4">
                <span className="text-xs font-bold text-yellow-500 tracking-cinematic uppercase">
                  {typeLabel}
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-4 text-glow">
                {content.title}
              </h1>

              <div className="flex items-center flex-wrap gap-3 md:gap-4 mb-6 text-sm md:text-base">
                {content.avgRating && content.avgRating > 0 && (
                  <div className="flex items-center gap-1.5 glass-cosmic px-3 py-1.5 rounded-lg">
                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-white">
                      {content.avgRating.toFixed(1)}
                    </span>
                  </div>
                )}
                {content.releaseYear && (
                  <span className="flex items-center gap-1.5 text-zinc-300">
                    <Calendar size={14} /> {content.releaseYear}
                  </span>
                )}
                {content.duration && (
                  <span className="flex items-center gap-1.5 text-zinc-300">
                    <Clock size={14} /> {content.duration} min
                  </span>
                )}
                {content.country && (
                  <span className="flex items-center gap-1.5 text-zinc-300">
                    <Globe size={14} /> {content.country}
                  </span>
                )}
              </div>

              {content.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {content.genres.map((g) => (
                    <Link
                      key={g.id}
                      href={`/movies?genre=${g.slug}`}
                      className="text-xs md:text-sm px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 hover:text-yellow-500 transition-colors"
                    >
                      {g.name}
                    </Link>
                  ))}
                </div>
              )}

              <p className="text-zinc-300 text-base md:text-lg leading-relaxed mb-8 max-w-2xl">
                {content.description}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={`/watch/${content.slug}`}
                  className="btn-cosmic flex items-center gap-2 px-6 md:px-8 py-3 text-base font-bold rounded-xl"
                >
                  <Play size={18} className="fill-black" />
                  Watch Now
                </Link>

                {hasDownloads && (
                  <DownloadButton
                    contentId={content.id}
                    options={downloadOptions}
                  />
                )}

                <WatchlistButton
                  contentId={content.id}
                  initialInWatchlist={false}
                  variant="hero"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ RATING SECTION ============ */}
      <section className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12 mt-16">
        <div className="flex items-baseline gap-3 mb-6">
          <div className="w-1 h-8 bg-gradient-to-b from-yellow-400 to-amber-600 rounded-full" />
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Ratings
          </h2>
        </div>

        <RatingSummary
          contentId={content.id}
          stats={ratingStats}
          userRating={userRating?.score || null}
          isLoggedIn={!!user}
        />
      </section>

      {/* ============ SEASONS + EPISODES ============ */}
      {content.seasons && content.seasons.length > 0 && (
        <section className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12 mt-16">
          <div className="flex items-baseline gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-yellow-400 to-amber-600 rounded-full" />
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Seasons & Episodes
            </h2>
            <span className="text-sm text-zinc-500">
              ({content.totalSeasons} seasons)
            </span>
          </div>

          <SeasonAccordion
            seasons={content.seasons}
            contentSlug={content.slug}
          />
        </section>
      )}

      {/* ============ REVIEWS SECTION ============ */}
      <section className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12 mt-16">
        <div className="flex items-baseline gap-3 mb-6">
          <div className="w-1 h-8 bg-gradient-to-b from-yellow-400 to-amber-600 rounded-full" />
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Reviews
          </h2>
          <span className="text-sm text-zinc-500">
            ({reviews.length} review{reviews.length === 1 ? "" : "s"})
          </span>
          <MessageSquare size={20} className="text-yellow-500/50" />
        </div>

        <div className="space-y-6">
          {/* Review Form (if logged in) */}
          {user ? (
            <ReviewForm
              contentId={content.id}
              existingReview={
                userReview
                  ? {
                      id: userReview.id,
                      title: userReview.title,
                      body: userReview.body,
                    }
                  : null
              }
            />
          ) : (
            <div className="glass-cosmic rounded-2xl p-6 text-center">
              <p className="text-zinc-400 text-sm mb-3">
                Sign in to write a review
              </p>
              <Link
                href="/login"
                className="btn-cosmic inline-flex px-5 py-2 text-sm font-bold rounded-lg"
              >
                Sign In
              </Link>
            </div>
          )}

          {/* Reviews List */}
          <ReviewsList reviews={reviews} currentUserId={user?.id} />
        </div>
      </section>

      {/* ============ RELATED ============ */}
      {content.related.length > 0 && (
        <section className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12 mt-20">
          <div className="flex items-baseline gap-3 mb-8">
            <div className="w-1 h-8 bg-gradient-to-b from-yellow-400 to-amber-600 rounded-full" />
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              More Like This
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
            {content.related.map((item) => (
              <ContentCard
                key={item.id}
                href={`/content/${item.slug}`}
                title={item.title}
                posterUrl={item.posterUrl}
                year={item.releaseYear}
                rating={item.avgRating}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}