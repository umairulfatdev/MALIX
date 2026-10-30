"use client";

import Link from "next/link";
import { MalixLogo } from "./malix-logo";
import { SITE_CONFIG, FOOTER_LINKS } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-space-deep mt-20 overflow-hidden">
      {/* Nebula glow */}
      <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] nebula-purple opacity-30 pointer-events-none" />
      <div className="absolute -bottom-40 right-1/4 w-[400px] h-[400px] nebula-pink opacity-20 pointer-events-none" />

      <div className="relative max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          <div className="col-span-2 md:col-span-1">
            <MalixLogo size="md" />
            <p className="text-xs text-cosmic-pink/80 mt-3 tracking-cinematic uppercase">
              {SITE_CONFIG.tagline}
            </p>
            <p className="text-sm text-zinc-500 mt-6 leading-relaxed max-w-xs">
              A cosmic entertainment experience for movies, dramas and series.
            </p>
          </div>

          <FooterColumn title="Explore" links={FOOTER_LINKS.explore} />
          <FooterColumn title="Company" links={FOOTER_LINKS.company} />
          <FooterColumn title="Legal" links={FOOTER_LINKS.legal} />
        </div>

        <div className="constellation-line my-10" />

        {/* 👇 ANIMATION & TRANSITION SECTION 👇 */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} MALIX. All rights reserved.
          </p>

          {/* Hover Effect on the whole Card */}
          <div className="group flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10 transition-all duration-500 ease-out cursor-pointer shadow-[0_0_15px_rgba(251,191,36,0.1)] hover:border-yellow-500/50 hover:shadow-[0_0_30px_rgba(251,191,36,0.4)] hover:-translate-y-1 hover:scale-105">
            
            <div className="relative">
              {/* Image Glow Ring - Transition on hover */}
              <div className="absolute inset-0 bg-yellow-500 rounded-full blur-md opacity-40 transition-all duration-500 group-hover:opacity-100 group-hover:blur-lg" />
              <img 
                src="/umair.jpeg" 
                alt="Malik Umair Ulfat" 
                className="relative w-10 h-10 rounded-full object-cover border-2 border-yellow-500 z-10 transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            
            <span className="text-sm text-zinc-300">
              Created by{" "}
              {/* Text Shimmer Animation + Color Transition on hover */}
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-yellow-400 to-white bg-[length:200%_auto] animate-text-shimmer transition-all duration-300 group-hover:from-yellow-400 group-hover:to-yellow-400">
                Malik Umair Ulfat
              </span>
            </span>
          </div>

          <p className="text-xs text-zinc-600 text-center md:text-right max-w-[200px]">
            Only legally authorized content is hosted on this platform.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="text-xs font-bold uppercase tracking-cinematic text-cosmic-pink mb-4">
        {title}
      </h4>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-zinc-500 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}