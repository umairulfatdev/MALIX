"use client"; // 👈 Client component banao taake useState chale

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/movies", label: "Movies" },
  { href: "/dramas", label: "Dramas" },
  { href: "/series", label: "Series" },
  { href: "/anime", label: "Anime" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="MALIX" className="h-10 w-auto object-contain" />
          <span className="text-xl md:text-2xl font-black text-yellow-500 tracking-widest hidden sm:block">
            MALIX
          </span>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-zinc-400 hover:text-white">
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Hamburger */}
        <button onClick={() => setMobileOpen(true)} className="lg:hidden text-white p-2">
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 lg:hidden">
          <div className="flex justify-end p-4">
            <button onClick={() => setMobileOpen(false)} className="text-white">
              <X size={24} />
            </button>
          </div>
          <nav className="flex flex-col p-8 space-y-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-2xl font-bold text-white hover:text-yellow-500"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}