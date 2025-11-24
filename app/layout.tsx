import type { Metadata } from 'next';
import './globals.css';
import LayoutWrapper from '@/components/LayoutWrapper';

export const metadata: Metadata = {
  title: 'Taiwan NutriCalc Pro',
  description: '台灣飲食紀錄與熱量計算專業版',
  authors: [{ name: 'Renee Lan', url: 'https://github.com/ysl0628/taiwan-food-calculator' }],
  creator: 'Renee Lan',
  publisher: 'Renee Lan',
  applicationName: 'Taiwan NutriCalc Pro',
  keywords: ['食品營養成分資料庫', 'Taiwan NutriCalc Pro', '台灣營養計算', '食品營養成分'],
  openGraph: {
    title: 'Taiwan NutriCalc Pro',
    description: '台灣營養計算專業版',
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
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
