import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import * as React from 'react';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: {
    default: 'DevTrack AI - Developer Career Platform',
    template: '%s | DevTrack AI',
  },
  description: 'Track daily data structure habits, audit resumes for ATS compatibility, manage portfolio showcases, and prepare for tech loops in one consolidated SaaS environment.',
  metadataBase: new URL('http://localhost:3000'),
  keywords: ['software engineer portfolio', 'developer resume builder', 'ATS resume checker', 'DSA streak tracker', 'technical mock interview AI'],
  authors: [{ name: 'DevTrack AI Team' }],
  creator: 'DevTrack AI',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://devtrack.ai',
    title: 'DevTrack AI - Developer Career Platform',
    description: 'Track daily data structure habits, audit resumes for ATS compatibility, manage portfolio showcases, and prepare for tech loops.',
    siteName: 'DevTrack AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DevTrack AI - Developer Career Platform',
    description: 'Track daily data structure habits, audit resumes for ATS compatibility, manage portfolio showcases, and prepare for tech loops.',
    creator: '@devtrack_ai',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
