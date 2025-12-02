import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable Turbopack completely
  turbopack: false,
  
  // Exclude Firebase Functions
  outputFileTracingExcludes: {
    '*': ['./functions/**/*'],
  },
  
  // Image domains
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
