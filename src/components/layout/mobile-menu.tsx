"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Search, Sparkles } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";

interface MobileMenuProps {
  user: {
    id: string;
    name: string;
    role: "USER" | "ADMIN";
  } | null;
}

export function MobileMenu({ user }: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden p-2 rounded-xl glass-cosmic"
        aria-label="Menu"
      >
        <Menu size={20} className="text-white" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 bg-space-deep/80 backdrop-blur-md z-[100] animate-fade-in"
            onClick={() => setOpen(false)}
          />

          <div className="fixed right-0 top-0 h-full w-[85%] max-w-sm glass-cosmic z-[101] animate-slide-up overflow-y-auto">
            <div className="relative flex items-center justify-between p-5 border-b border-white/5 overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 nebula-purple" />
              <div className="relative flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cosmic-red via-cosmic-pink to-cosmic-purple flex items-center justify-center">
                  <Sparkles size={18} className="text-white" />
                </div>
                <span className="text-xl font-black tracking-cinematic text-white">
                  MALIX
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="relative p-2 rounded-lg hover:bg-white/5"
              >
                <X size={20} className="text-white" />
              </button>
            </div>

            <div className="p-5">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2.5">
                <Search size={15} className="text-zinc-500" />
                <input
                  type="search"
                  placeholder="Search the galaxy..."
                  className="bg-transparent border-none outline-none text-sm text-white placeholder-zinc-500 w-full"
                />
              </div>
            </div>

            <nav className="px-3 pb-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 text-base font-medium text-zinc-300 hover:text-white hover:bg-cosmic-purple/10 rounded-xl transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="border-t border-white/5 p-5 space-y-3">
              {user ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setOpen(false)}
                    className="block text-center text-sm text-zinc-300 py-2"
                  >
                    {user.name}
                  </Link>
                  <Link
                    href="/watchlist"
                    onClick={() => setOpen(false)}
                    className="btn-cosmic-ghost block text-center py-3"
                  >
                    My Watchlist
                  </Link>
                  {user.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      onClick={() => setOpen(false)}
                      className="btn-cosmic-ghost block text-center py-3"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="btn-cosmic-ghost block text-center py-3"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className="btn-cosmic block text-center py-3 font-semibold"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}