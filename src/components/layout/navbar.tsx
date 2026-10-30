"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, LogOut, User, Settings, Heart, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/server/actions/auth";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/movies", label: "Movies" },
  { href: "/series", label: "Series" },
  { href: "/anime", label: "Anime" },
  { href: "/coming-soon", label: "Coming Soon" },
  { href: "/music", label: "Music" },
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
        
        {/* Logo + MALIX Text with Animation */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            {/* Logo glow effect */}
            <div className="absolute inset-0 bg-yellow-500 blur-lg opacity-20 group-hover:opacity-60 transition-opacity duration-500 rounded-full" />
            <img 
              src="/logo.png" 
              alt="MALIX" 
              className="relative h-9 md:h-11 w-auto object-contain animate-logo-float group-hover:scale-110 transition-transform duration-300" 
            />
          </div>
          <div className="flex flex-col -mt-1">
            <span className="text-xl md:text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-500 to-yellow-200 bg-[length:200%_auto] animate-text-shimmer drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]">
              MALIX
            </span>
            <span className="text-[9px] md:text-[10px] text-yellow-500/80 font-bold tracking-[0.25em] uppercase pl-1">
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-zinc-400 hover:text-white hover:scale-110 transition-all duration-300">
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
              <Link href="/login" className="text-sm text-zinc-300 hover:text-white transition-colors">Sign In</Link>
              <Link href="/register" className="bg-yellow-500 text-black text-sm font-bold px-4 py-2 rounded-lg hover:bg-yellow-400 hover:scale-105 transition-all">Get Started</Link>
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
            <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 group">
              <img src="/logo.png" alt="MALIX" className="h-8 w-auto object-contain animate-logo-float" />
              <div className="flex flex-col -mt-1">
                <span className="text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-500 to-yellow-200 bg-[length:200%_auto] animate-text-shimmer">
                  MALIX
                </span>
                <span className="text-[8px] text-yellow-500/80 font-bold tracking-[0.25em] uppercase">
              
                </span>
              </div>
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
                  className="py-3 text-xl font-medium text-zinc-300 hover:text-yellow-500 border-b border-white/5 transition-colors"
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
                <Link href="/profile" onClick={() => setMobileOpen(false)} className="block py-3 text-center rounded-lg border border-white/10 text-white hover:bg-white/5 transition">Profile</Link>
                {user.role === "ADMIN" && (
                  <Link href="/admin" onClick={() => setMobileOpen(false)} className="block py-3 text-center rounded-lg bg-yellow-500 text-black font-bold hover:bg-yellow-400 transition">Admin Panel</Link>
                )}
                <button onClick={handleLogout} className="w-full py-3 rounded-lg border border-red-500/50 text-red-500 font-semibold hover:bg-red-500/10 transition">
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Link href="/login" onClick={() => setMobileOpen(false)} className="block py-3 text-center rounded-lg border border-yellow-500/50 text-yellow-500 font-semibold hover:bg-yellow-500/10 transition">
                  Sign In
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="block py-3 text-center rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-400 transition">
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