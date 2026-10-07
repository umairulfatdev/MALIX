"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Film,
  Tv,
  Play,
  ListVideo,
  Sparkles,
  Users,
  MessageSquare,
  Download,
  BarChart3,
  Settings,
  Menu,
  X,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MalixLogo } from "@/components/layout/malix-logo";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Movies", href: "/admin/movies", icon: Film },
  { label: "Dramas", href: "/admin/dramas", icon: Tv },
  { label: "Series", href: "/admin/series", icon: Play },
  { label: "Anime", href: "/admin/anime", icon: Sparkles }, // ✅ Genre → Anime
  { label: "Episodes", href: "/admin/episodes", icon: ListVideo },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Reviews", href: "/admin/reviews", icon: MessageSquare },
  { label: "Downloads", href: "/admin/downloads", icon: Download },
  { label: "Statistics", href: "/admin/stats", icon: BarChart3 },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebar = (
    <div className="flex flex-col h-full">
      {/* Animated MALIX Logo */}
      <div className="p-6 border-b border-white/5">
        <MalixLogo size="md" href="/admin" />
        <div className="mt-3 text-[10px] text-yellow-500/80 tracking-cinematic uppercase font-semibold">
          Admin Panel
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all group",
                isActive
                  ? "bg-gradient-to-r from-yellow-500/20 to-amber-600/10 text-yellow-400 border border-yellow-500/30"
                  : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
              )}
            >
              <item.icon
                size={18}
                className={cn(
                  "flex-shrink-0 transition-colors",
                  isActive
                    ? "text-yellow-400"
                    : "text-zinc-500 group-hover:text-yellow-400"
                )}
              />
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Back to site */}
      <div className="p-4 border-t border-white/5">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <ArrowLeft size={18} className="text-zinc-500" />
          Back to Site
        </Link>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex w-64 flex-shrink-0 border-r border-white/5 bg-black/40 backdrop-blur-xl">
        {sidebar}
      </aside>

      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-11 h-11 rounded-xl glass-cosmic flex items-center justify-center"
        aria-label="Open menu"
      >
        <Menu size={20} className="text-white" />
      </button>

      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed top-0 left-0 h-full w-72 max-w-[85%] z-[101] lg:hidden bg-black/95 backdrop-blur-2xl border-r border-yellow-500/20">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-lg hover:bg-white/10 flex items-center justify-center z-10"
            >
              <X size={18} className="text-white" />
            </button>
            {sidebar}
          </aside>
        </>
      )}
    </>
  );
}