"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

// 👇 NAV_LINKS direct yahan define hain (koi import nahi)
const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/movies", label: "Movies" },
  { href: "/dramas", label: "Dramas" },
  { href: "/series", label: "Series" },
  { href: "/anime", label: "Anime" },
];

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
        className="lg:hidden p-2 rounded-xl text-white"
        aria-label="Menu"
      >
        <Menu size={24} />
      </button>

      {/* Mobile Drawer */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
            onClick={() => setOpen(false)}
          />

          {/* Drawer */}
          <div className="fixed right-0 top-0 h-full w-[80%] max-w-sm bg-[#0a0a0a] z-[101] overflow-y-auto border-l border-white/10">
            
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2">
                <img src="/logo.png" alt="MALIX" className="h-8 w-auto object-contain" />
                <span className="text-xl font-black text-yellow-500 tracking-widest">MALIX</span>
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg text-white"
              >
                <X size={24} />
              </button>
            </div>

            {/* Nav Links */}
            <nav className="p-4 space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 text-base font-medium text-zinc-300 hover:text-yellow-500 hover:bg-white/5 rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Auth Buttons */}
            <div className="p-4 border-t border-white/10 mt-4">
              {user ? (
                <div className="space-y-2">
                  <p className="text-sm text-zinc-400 px-4">Signed in as</p>
                  <p className="text-white font-semibold px-4">{user.name}</p>
                  <Link
                    href="/profile"
                    onClick={() => setOpen(false)}
                    className="block text-center py-3 rounded-lg border border-white/20 text-white mt-2"
                  >
                    My Profile
                  </Link>
                  {user.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      onClick={() => setOpen(false)}
                      className="block text-center py-3 rounded-lg bg-yellow-500 text-black font-semibold"
                    >
                      Admin Panel
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="block text-center w-full py-3 rounded-lg border border-yellow-500/50 text-yellow-500 font-semibold"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className="block text-center w-full py-3 rounded-lg bg-yellow-500 text-black font-semibold"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}