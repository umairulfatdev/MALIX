"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, LogOut, User, Settings, Heart, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/server/actions/auth";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/movies", label: "Movies" },
  { href: "/dramas", label: "Dramas" },
  { href: "/series", label: "Series" },
  { href: "/anime", label: "Anime" },
];

export function Navbar({ user }: { user: any }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await logoutAction();
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 bg-black border-b border-white/10">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">
        
        {/* Logo + MALIX Text */}
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="MALIX" className="h-9 w-auto object-contain" />
          <span className="text-xl md:text-2xl font-black text-yellow-500 tracking-widest">
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

        {/* Right Side - Desktop User Menu */}
        <div className="hidden lg:flex items-center gap-4">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition"
              >
                <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-black font-bold">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-white">{user.name}</span>
              </button>

              {/* User Dropdown */}
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl py-2 z-50">
                  <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5">
                    <User size={16} /> Profile
                  </Link>
                  <Link href="/watchlist" className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5">
                    <Heart size={16} /> Watchlist
                  </Link>
                  <Link href="/history" className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5">
                    <Clock size={16} /> History
                  </Link>
                  {user.role === "ADMIN" && (
                    <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-yellow-500 hover:bg-white/5">
                      <Settings size={16} /> Admin Panel
                    </Link>
                  )}
                  <hr className="my-2 border-white/10" />
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-white/5 text-left">
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="text-sm text-zinc-300 hover:text-white">Sign In</Link>
              <Link href="/register" className="bg-yellow-500 text-black text-sm font-bold px-4 py-2 rounded-lg">Get Started</Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button onClick={() => setMobileOpen(true)} className="lg:hidden text-white p-2">
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] bg-black">
          <div className="flex justify-between items-center p-4 border-b border-white/10">
            <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
              <img src="/logo.png" alt="MALIX" className="h-8 w-auto object-contain" />
              <span className="text-xl font-black text-yellow-500">MALIX</span>
            </Link>
            <button onClick={() => setMobileOpen(false)} className="text-white">
              <X size={24} />
            </button>
          </div>

          <div className="p-6">
            {/* Nav Links */}
            <nav className="flex flex-col space-y-1 mb-8">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-3 text-xl font-medium text-zinc-300 hover:text-yellow-500 border-b border-white/5"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Auth Section */}
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-black font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-medium">{user.name}</p>
                    <p className="text-xs text-zinc-400">{user.email}</p>
                  </div>
                </div>
                <Link href="/profile" onClick={() => setMobileOpen(false)} className="block py-3 text-center rounded-lg border border-white/10 text-white">Profile</Link>
                {user.role === "ADMIN" && (
                  <Link href="/admin" onClick={() => setMobileOpen(false)} className="block py-3 text-center rounded-lg bg-yellow-500 text-black font-bold">Admin Panel</Link>
                )}
                <button onClick={handleLogout} className="w-full py-3 rounded-lg border border-red-500/50 text-red-500 font-semibold">
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Link href="/login" onClick={() => setMobileOpen(false)} className="block py-3 text-center rounded-lg border border-yellow-500/50 text-yellow-500 font-semibold">
                  Sign In
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="block py-3 text-center rounded-lg bg-yellow-500 text-black font-semibold">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}