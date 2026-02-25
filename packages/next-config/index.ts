import withBundleAnalyzer from '@next/bundle-analyzer';
// @ts-expect-error No declaration file
import { PrismaPlugin } from '@prisma/nextjs-monorepo-workaround-plugin';
import type { NextConfig } from 'next';

export const config: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'aluket.s3.ap-northeast-2.amazonaws.com',
      },
    ],
  },
  webpack(config, { isServer }) {
    if (isServer) {
      config.plugins = config.plugins || [];
      config.plugins.push(new PrismaPlugin());
    }

    return config;
  },
};

export const withAnalyzer = (sourceConfig: NextConfig): NextConfig => {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    return sourceConfig; // 개발 환경에서는 그대로 리턴
  }

  return withBundleAnalyzer({
    openAnalyzer: false,
    logLevel: 'silent',
  })(sourceConfig);
};
