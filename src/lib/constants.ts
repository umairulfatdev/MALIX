export const SITE_CONFIG = {
  name: "MALIX",
  tagline: "Watch. Discover. Enjoy.",
  description:
    "Stream movies, dramas, series, and anime. Your entertainment. One place.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
};

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Movies", href: "/movies" },
  { label: "Dramas", href: "/dramas" },
  { label: "Series", href: "/series" },
  { label: "Anime", href: "/anime" }, // ✅ Genre replaced with Anime
];

export const FOOTER_LINKS = {
  explore: [
    { label: "Movies", href: "/movies" },
    { label: "Dramas", href: "/dramas" },
    { label: "Series", href: "/series" },
    { label: "Anime", href: "/anime" }, // ✅ Changed
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Careers", href: "/careers" },
  ],
  legal: [
    { label: "Terms", href: "/terms" },
    { label: "Privacy", href: "/privacy" },
    { label: "DMCA", href: "/dmca" },
  ],
};