import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  typescript: {
    // ⚠️ Dangerously allow production builds to successfully complete even if
    // your project has type errors (prototype mode).
    ignoreBuildErrors: true,
  },
  images: {
    domains: [],
    unoptimized: true,
  },
};

export default nextConfig;
