import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.css";
import { TechSetCacheProvider } from "@/components/providers/TechSetCacheProvider";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "테크톡 - 개발자 학습 커리어 플랫폼",
  description: "개발자 기술 면접은 테크톡과 함께! 개발자 학습 커리어 플랫폼",
  icons: {
    icon: [
      {
        url: '/techtalk_logo.svg',
        type: 'image/svg+xml',
      },
    ],
    shortcut: '/techtalk_logo.svg',
    apple: '/techtalk_logo.svg',
  },
  other: {
    "color-scheme": "light only"
  }
};

// 모바일 디바이스 최적화를 위한 viewport 설정
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // 모바일에서 줌 방지로 레이아웃 안정성 향상
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
        <TechSetCacheProvider>
          {children}
        </TechSetCacheProvider>
      </body>
    </html>
  );
}
