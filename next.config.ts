cat > next.config.ts << 'EOF'
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Force Webpack (disable Turbopack completely)
  turbopack: false,
  
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
EOF

# Commit and deploy
git add next.config.ts
git commit -m "fix: Final clean config - remove webpack function"
git push origin main
