"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Sparkles } from "lucide-react";
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
      {/* Hamburger Button */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden p-2 rounded-xl glass-cosmic"
        aria-label="Menu"
      >
        <Menu size={24} className="text-white" />
      </button>

      {/* Mobile Drawer */}
      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] animate-fade-in"
            onClick={() => setOpen(false)}
          />

          <div className="fixed right-0 top-0 h-full w-[85%] max-w-sm bg-[#0a0a0a] z-[101] animate-slide-up overflow-y-auto border-l border-white/10">
            
            {/* Header */}
            <div className="relative flex items-center justify-between p-5 border-b border-white/5">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="MALIX" className="h-8 w-auto object-contain" />
                <span className="text-xl font-black text-yellow-500 tracking-widest">MALIX</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg hover:bg-white/5 text-white"
              >
                <X size={24} />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="px-3 py-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-4 text-base font-medium text-zinc-300 hover:text-yellow-500 hover:bg-white/5 rounded-xl transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Auth Buttons */}
            <div className="border-t border-white/5 p-5 space-y-3 mt-4">
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
                    className="block text-center w-full py-3 rounded-xl border border-yellow-500/50 text-yellow-500 font-semibold hover:bg-yellow-500 hover:text-black transition-all"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className="block text-center w-full py-3 rounded-xl bg-yellow-500 text-black font-semibold hover:bg-yellow-400 transition-all"
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