"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ContinueWatchingCard } from "./continue-watching-card";

interface Item {
  id: string;
  progress: number;
  position: number;
  duration: number;
  content: {
    id: string;
    title: string;
    slug: string;
    posterUrl: string | null;
    backdropUrl: string | null;
    releaseYear: number | null;
    avgRating: number | null;
    duration: number | null;
    type: string;
  };
}

export function ContinueWatchingRow({ items }: { items: Item[] }) {
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
          <div className="w-1 h-7 rounded-full bg-gradient-to-b from-yellow-400 via-amber-500 to-amber-600 shadow-lg shadow-yellow-500/50" />
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Continue Watching
            </h2>
            <div className="h-0.5 w-12 bg-gradient-to-r from-yellow-500 to-transparent mt-1 rounded-full" />
          </div>
        </div>
        <div className="hidden md:flex items-center gap-1">
          <button
            onClick={() => scroll("left")}
            className="p-2 rounded-full glass-cosmic hover:bg-yellow-500/20 transition-colors group"
            aria-label="Scroll left"
          >
            <ChevronLeft
              size={20}
              className="text-zinc-500 group-hover:text-yellow-400"
            />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2 rounded-full glass-cosmic hover:bg-yellow-500/20 transition-colors group"
            aria-label="Scroll right"
          >
            <ChevronRight
              size={20}
              className="text-zinc-500 group-hover:text-yellow-400"
            />
          </button>
        </div>
      </div>

      {/* Scroller */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-2"
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="flex-shrink-0 w-64 md:w-72"
          >
            <ContinueWatchingCard item={item} />
          </div>
        ))}
      </div>
    </section>
  );
}