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

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} MALIX. All rights reserved.
          </p>
          <p className="text-xs text-zinc-600 text-center md:text-right">
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