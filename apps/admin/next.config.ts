import { config, withAnalyzer } from '@repo/next-config';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  ...config,
  reactStrictMode: true,
  images: {
    remotePatterns: [
      ...(config.images?.remotePatterns ?? []),
      {
        protocol: 'https',
        hostname: 'dcenter-img.cafe24.com',
      },
      {
        protocol: 'https',
        hostname: 'ecimg.cafe24img.com',
      },
    ],
  },
  serverExternalPackages: ['@sparticuz/chromium', 'puppeteer-core'],
};

export default withAnalyzer(nextConfig);
