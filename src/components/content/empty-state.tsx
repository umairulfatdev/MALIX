import Link from "next/link";
import { Search } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  showResetButton?: boolean;
}

export function EmptyState({
  title = "No results found",
  description = "Try adjusting your filters or search terms.",
  showResetButton = true,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-yellow-500/20 blur-3xl" />
        <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-300 to-amber-600 flex items-center justify-center shadow-2xl shadow-yellow-500/30">
          <Search size={32} className="text-black" />
        </div>
      </div>
      <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
      <p className="text-zinc-400 max-w-md mb-6">{description}</p>
      {showResetButton && (
        <Link
          href="/movies"
          className="btn-cosmic px-6 py-3 text-base font-bold rounded-xl"
        >
          Clear All Filters
        </Link>
      )}
    </div>
  );
}