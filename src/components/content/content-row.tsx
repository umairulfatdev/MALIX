"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ContentCard } from "./content-card";

interface Item {
  id: string;
  title: string;
  slug: string;
  posterUrl?: string | null;
  releaseYear?: number | null;
  avgRating?: number | null;
  type: string;
  progress?: number;
}

interface ContentRowProps {
  title: string;
  items: Item[];
  hrefPrefix?: string;
  showNumbers?: boolean;
}

export function ContentRow({
  title,
  items,
  hrefPrefix = "/content",
  showNumbers = false,
}: ContentRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (!items.length) return null;

  return (
    <section className="mb-14 md:mb-16">
      {/* Heading */}
      <div className="flex items-end justify-between mb-5 px-1">
        <div className="flex items-center gap-3">
          <div className="w-1 h-7 rounded-full bg-gradient-to-b from-cosmic-pink via-cosmic-purple to-cosmic-red shadow-lg shadow-cosmic-pink/50" />
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              {title}
            </h2>
            <div className="h-0.5 w-12 bg-gradient-to-r from-cosmic-pink to-transparent mt-1 rounded-full" />
          </div>
        </div>
        <div className="hidden md:flex items-center gap-1">
          <button
            onClick={() => scroll("left")}
            className="p-2 rounded-full glass-cosmic hover:bg-cosmic-purple/20 transition-colors group"
            aria-label="Scroll left"
          >
            <ChevronLeft
              size={20}
              className="text-zinc-500 group-hover:text-cosmic-pink"
            />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2 rounded-full glass-cosmic hover:bg-cosmic-purple/20 transition-colors group"
            aria-label="Scroll right"
          >
            <ChevronRight
              size={20}
              className="text-zinc-500 group-hover:text-cosmic-pink"
            />
          </button>
        </div>
      </div>

      {/* Scroller */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-2"
      >
        {items.map((item, idx) => (
          <div
            key={item.id}
            className={`flex-shrink-0 ${
              showNumbers && idx < 10
                ? "w-40 md:w-48 pl-10 md:pl-12"
                : "w-36 md:w-44"
            }`}
          >
            <ContentCard
              href={`${hrefPrefix}/${item.slug}`}
              title={item.title}
              posterUrl={item.posterUrl}
              year={item.releaseYear}
              rating={item.avgRating}
              progress={item.progress}
              numberBadge={showNumbers && idx < 10 ? idx + 1 : undefined}
            />
          </div>
        ))}
      </div>
    </section>
  );
}