import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exclude Firebase Functions from Next.js build
  outputFileTracingExcludes: {
    '*': ['./functions/**/*'],
  },
  
  // Image domains for Next.js 16
  images: {
    remotePatterns: [
      { hostname: 'images.unsplash.com' },
      { hostname: 'via.placeholder.com' },
      { hostname: 'lh3.googleusercontent.com' },
      { hostname: 'oaidalleapiprodscus.blob.core.windows.net' },
    ],
  },
};

export default nextConfig;
