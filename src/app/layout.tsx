import { AuthProvider } from '@/contexts/AuthContext';
import { AnalyticsProvider } from '@/contexts/AnalyticsContext';
import Script from 'next/script';
import './globals.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'LinkStream - Protect Your LinkedIn',
  description: 'Backup and protect your LinkedIn data',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html lang="en">
      <head>
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
          </>
        )}
      </head>
      <body>
        <AuthProvider>
          <AnalyticsProvider>
            {children}
          </AnalyticsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
