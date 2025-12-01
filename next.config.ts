import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Completely exclude Firebase Functions from Next.js build
  experimental: {
    outputFileTracingExcludes: {
      '*': ['./functions/**/*'],
    },
  },
  
  // Webpack config to ignore firebase-functions module
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'firebase-functions': false,
    };
    return config;
  },
  
  // Image domains for magazine assets
  images: {
    domains: [
      'images.unsplash.com',
      'via.placeholder.com',
      'lh3.googleusercontent.com',
    ],
  },
};

export default nextConfig;
