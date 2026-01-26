import type { Metadata, Viewport } from 'next';
import { AuthProvider } from '@/context/AuthContext';
import { PreferencesProvider } from '@/context/PreferencesContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'Morning Briefing | Your 5-Minute News Scan',
  description: 'Stay conversationally ready with curated news from tech, finance, UK, world, and sport.',
  keywords: ['news', 'tech news', 'UK news', 'finance', 'sports', 'morning briefing'],
  authors: [{ name: 'Dave Hillier' }],
  openGraph: {
    title: 'Morning Briefing',
    description: 'Your 5-minute news scan for tech, finance, UK, world, and sport news.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#B08968',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB">
      <body className="min-h-screen bg-[var(--color-parchment)] antialiased">
        <AuthProvider>
          <PreferencesProvider>
            {children}
          </PreferencesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
