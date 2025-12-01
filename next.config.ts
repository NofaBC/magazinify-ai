cat > next.config.ts << 'EOF'
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exclude Firebase Functions from Next.js build completely
  experimental: {
    outputFileTracingExcludes: {
      '*': ['./functions/**/*', './functions/**'],
    },
  },
  
  // Ensure TypeScript respects our tsconfig.json exclusions
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Webpack fallback to ignore firebase-functions if needed
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'firebase-functions': false,
    };
    return config;
  },
  
  // Standard Next.js config
  images: {
    domains: [
      'images.unsplash.com',
      'via.placeholder.com',
      'lh3.googleusercontent.com', // For user avatars
    ],
  },
};

export default nextConfig;
EOF
