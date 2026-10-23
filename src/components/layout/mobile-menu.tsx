"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/movies", label: "Movies" },
  { href: "/dramas", label: "Dramas" },
  { href: "/series", label: "Series" },
  { href: "/anime", label: "Anime" },
  { href: "/music", label: "Music" },
];

export function MobileMenu({ user }: { user: any }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className="lg:hidden p-2 text-white">
        <Menu size={24} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] bg-black/90">
          <div className="absolute right-0 top-0 h-full w-[80%] max-w-sm bg-[#0a0a0a] p-6 overflow-y-auto">
            
            <div className="flex justify-between items-center mb-6">
              <span className="text-xl font-black text-yellow-500">MALIX</span>
              <button onClick={() => setOpen(false)} className="text-white">
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-col space-y-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-lg text-white font-medium hover:text-yellow-500"
                >
                  {link.label}
                </Link>
              ))}
            </div>

          </div>
        </div>
      )}
    </>
  );
}