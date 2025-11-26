import type { Metadata } from "next";
import Script from "next/script";

import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import { PostHogProvider } from "@/components/PostHogProvider";

export const metadata: Metadata = {
  title: "Taiwan NutriCalc Pro",
  description: "台灣飲食紀錄與熱量計算專業版",
  authors: [
    {
      name: "Renee Lan",
      url: "https://github.com/ysl0628/taiwan-food-calculator",
    },
  ],
  creator: "Renee Lan",
  publisher: "Renee Lan",
  applicationName: "Taiwan NutriCalc Pro",
  keywords: [
    "食品營養成分資料庫",
    "Taiwan NutriCalc Pro",
    "台灣飲食紀錄",
    "台灣熱量計算",
    "食品營養成分",
    "營養師",
  ],
  openGraph: {
    title: "Taiwan NutriCalc Pro",
    description: "台灣飲食紀錄與熱量計算專業版",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body>
        {/* 1. 載入 GA script */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XTP6LZFZS1"
          strategy="afterInteractive"
        />
        {/* 2. 初始化 GA4 */}
        <Script id="ga-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XTP6LZFZS1');
          `}
        </Script>
        <PostHogProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
        </PostHogProvider>
      </body>
    </html>
  );
}