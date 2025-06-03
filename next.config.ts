import type { NextConfig } from "next";
import { createVanillaExtractPlugin } from '@vanilla-extract/next-plugin';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'velog.velcdn.com',
        // pathname: '/**', // 모든 경로 허용 (생략 가능)
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  serverExternalPackages: [],

  experimental: {
    // React 19 관련 설정들은 기본값 사용
  },

  compress: true,

  ...(process.env.NODE_ENV === 'development' && {
    onDemandEntries: {
      maxInactiveAge: 25 * 1000,
      pagesBufferLength: 2,
    },
  }),

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
        },
      };
    }

    return config;
  },
};

const withVanillaExtract = createVanillaExtractPlugin();

export default withVanillaExtract(nextConfig);
