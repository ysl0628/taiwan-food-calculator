import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Taiwan NutriCalc Pro',
  description: '台灣營養計算專業版',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  );
}

