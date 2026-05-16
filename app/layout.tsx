import type { Metadata, Viewport } from 'next';
import { Bebas_Neue, Inter } from 'next/font/google';
import './globals.css';

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const APP_DESC = "Sue's 3rd Official Annual Victoria Day Step Challenge — May 18 to June 14, 2026";

export const metadata: Metadata = {
  title: 'Step w Sue',
  description: APP_DESC,
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Step w Sue',
  },
  icons: {
    apple: '/icons/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    title: 'Step w Sue',
    description: APP_DESC,
    images: [{ url: '/icons/icon-512x512.png', width: 512, height: 512 }],
  },
  twitter: {
    card: 'summary',
    title: 'Step w Sue',
    description: APP_DESC,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1B2F5E',
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
