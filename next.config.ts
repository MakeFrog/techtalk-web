import type { NextConfig } from "next";
import { createVanillaExtractPlugin } from '@vanilla-extract/next-plugin';

// 번들 분석 도구
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  // 성능 최적화 설정
  poweredByHeader: false, // X-Powered-By 헤더 제거
  generateEtags: false,   // ETag 생성 비활성화 (CDN 사용 시)

  // ESLint가 빌드를 차단하지 않도록 설정 (개발 중)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

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
    // 이미지 최적화 설정
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },

  // Next.js 15에서 변경된 설정
  serverExternalPackages: ['@google/generative-ai'],

  experimental: {
    // 서버 컴포넌트 최적화
    serverComponentsExternalPackages: ['@google/generative-ai'],
    // PPR (Partial Prerendering) 활성화 - Next.js 14+
    // ppr: true,
  },

  compress: true,

  // 개발 환경 최적화
  ...(process.env.NODE_ENV === 'development' && {
    onDemandEntries: {
      maxInactiveAge: 25 * 1000,
      pagesBufferLength: 2,
    },
  }),

  webpack: (config, { isServer, dev }) => {
    // 프로덕션 환경에서만 번들 최적화 적용
    if (!isServer && !dev) {
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        minRemainingSize: 0,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        enforceSizeThreshold: 50000,
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          // React 관련 라이브러리 분리 (가장 높은 우선순위)
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            priority: 30,
            chunks: 'all',
            enforce: true,
          },
          // AI 관련 라이브러리 분리 (큰 사이즈)
          ai: {
            test: /[\\/]node_modules[\\/]@google[\\/]generative-ai[\\/]/,
            name: 'ai',
            priority: 25,
            chunks: 'all',
            enforce: true,
          },
          // Firebase 관련 라이브러리 분리
          firebase: {
            test: /[\\/]node_modules[\\/](firebase|@firebase)[\\/]/,
            name: 'firebase',
            priority: 20,
            chunks: 'all',
          },
          // Markdown 관련 라이브러리 분리
          markdown: {
            test: /[\\/]node_modules[\\/](react-markdown|react-syntax-highlighter|refractor)[\\/]/,
            name: 'markdown',
            priority: 15,
            chunks: 'all',
          },
          // vanilla-extract 관련 분리
          styles: {
            test: /[\\/]node_modules[\\/]@vanilla-extract[\\/]/,
            name: 'styles',
            priority: 12,
            chunks: 'all',
          },
          // 나머지 vendor 라이브러리
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
        },
      };

      // 프로덕션에서 console.log 제거
      config.optimization.minimizer.forEach((minimizer: any) => {
        if (minimizer.constructor.name === 'TerserPlugin') {
          minimizer.options.terserOptions.compress.drop_console = true;
        }
      });
    }

    return config;
  },
};

const withVanillaExtract = createVanillaExtractPlugin();

export default withBundleAnalyzer(withVanillaExtract(nextConfig));
