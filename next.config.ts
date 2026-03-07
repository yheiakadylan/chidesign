import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Add experimental options here if needed
  },
  // @ts-ignore
  turbopack: {
    root: './',
  },
};

export default nextConfig;
