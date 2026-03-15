import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  reactCompiler: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 't.me' },
      { protocol: 'https', hostname: '*.telegram.org' },
      // Wildcard для иконок достижений с внешних хостов (достаточно для хакатона)
      { protocol: 'https', hostname: '**' },
    ],
  },
};

export default nextConfig;
