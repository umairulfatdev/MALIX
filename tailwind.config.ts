import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          dark: "#0a0a0a",
          deep: "#050505",
          card: "#141414",
          light: "#1f1f1f",
        },
        cosmic: {
          purple: "#d97706", // deep gold
          pink: "#fbbf24",   // golden
          red: "#f59e0b",    // amber
          gold: "#fbbf24",   // main gold
        },
      },
      letterSpacing: {
        cinematic: "0.3em",
      },
      animation: {
        "float-star": "floatStar linear infinite",
        twinkle: "twinkle 3s ease-in-out infinite",
        nebula: "nebulaPulse 8s ease-in-out infinite",
        aurora: "auroraShift 6s ease infinite",
        orbit: "orbit 20s linear infinite",
        "slide-up": "slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-in": "fadeIn 0.6s ease-out",
        marquee: "marquee 40s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;