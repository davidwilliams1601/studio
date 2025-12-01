import { AuthProvider } from '@/contexts/AuthContext';
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
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
