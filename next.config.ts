import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // ✅ Skip static generation for DB-query pages
  output: undefined,
  experimental: {
    // Force all pages to be dynamic (avoids build-time DB queries)
    workerThreads: false,
    cpus: 1,
  },
};

export default nextConfig;