cat > next.config.ts << 'EOF'
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exclude Firebase Functions from Next.js build
  outputFileTracingExcludes: {
    '*': ['./functions/**/*'],
  },
  
  // Webpack config to ignore firebase-functions module
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'firebase-functions': false,
    };
    return config;
  },
  
  // Image domains using remotePatterns for Next.js 16
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
EOF
