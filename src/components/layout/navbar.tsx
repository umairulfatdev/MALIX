import Link from "next/link";
import { NAV_LINKS } from "@/lib/constants";
import { fetchCurrentUser } from "@/server/actions/user";
import { UserMenu } from "./user-menu";
import { MobileMenu } from "./mobile-menu";
import { SearchBar } from "@/components/content/search-bar";
import { MalixLogo } from "./malix-logo";

export async function Navbar() {
  const user = await fetchCurrentUser();

  return (
    <>
      {/* Top Ticker */}
      <div className="bg-gradient-to-r from-yellow-950 via-yellow-900 to-yellow-950 border-b border-yellow-800/30 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee py-1.5">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-12 px-6">
              <span className="text-xs text-yellow-200/80 tracking-cinematic uppercase">
                ● Now Streaming
              </span>
              <span className="text-xs text-yellow-100/60 tracking-wide">
                New Episodes Every Friday
              </span>
              <span className="text-xs text-yellow-200/80 tracking-cinematic uppercase">
                ● Featured
              </span>
              <span className="text-xs text-yellow-100/60 tracking-wide">
                Cinematic Experience on MALIX
              </span>
              <span className="text-xs text-yellow-200/80 tracking-cinematic uppercase">
                ● Trending
              </span>
              <span className="text-xs text-yellow-100/60 tracking-wide">
                Watch. Discover. Enjoy.
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-50 glass-dark">
        <nav className="max-w-[1800px] mx-auto px-4 md:px-8 lg:px-12">
          <div className="flex items-center justify-between h-16 md:h-20 gap-4">
            {/* Logo + Desktop Nav */}
            <div className="flex items-center gap-8 md:gap-12">
              <MalixLogo size="md" showText={true} />

              <div className="hidden lg:flex items-center gap-8">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm font-medium text-zinc-400 hover:text-white transition-colors relative group"
                  >
                    {link.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-500 group-hover:w-full transition-all duration-300" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3 md:gap-4">
              {/* ✅ Functional Search Bar */}
              <div className="hidden md:block">
                <SearchBar />
              </div>

              {/* User menu or auth buttons */}
              {user ? (
                <UserMenu user={user} />
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    href="/login"
                    className="text-sm font-medium text-zinc-300 hover:text-white px-4 py-2 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="btn-cosmic text-sm px-5 py-2 font-semibold"
                  >
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile menu */}
              <MobileMenu user={user} />
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}