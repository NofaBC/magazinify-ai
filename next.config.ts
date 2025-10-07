// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // If you later use images from remote hosts, add them here:
  // images: { remotePatterns: [{ protocol: "https", hostname: "your-cdn.com" }] },
  // experimental: { serverActions: true }, // enable if you start using Server Actions
};

export default nextConfig;
