import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  reactCompiler: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 't.me' },
      { protocol: 'https', hostname: '*.telegram.org' },
    ],
  },
};

export default nextConfig;
