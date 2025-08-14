/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable App Router (default in Next.js 14+)
  experimental: {
    // Enable React 18 concurrent features
    serverComponentsExternalPackages: ['postgres', 'drizzle-orm'],
  },

  // Performance optimizations
  swcMinify: true,
  poweredByHeader: false,
  
  // Compiler options for better optimization
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Bundle analyzer (only when needed)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config) => {
      config.plugins.push(
        new (require('@next/bundle-analyzer'))({
          enabled: true,
        })
      );
      return config;
    },
  }),

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // Redirect configuration for better SEO
  async redirects() {
    return [
      {
        source: '/advocates/:path*',
        has: [
          {
            type: 'query',
            key: 'legacy',
          },
        ],
        destination: '/?legacy=true',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
