import '../globals.css';
import { Inter } from 'next/font/google';
import { QueryProvider } from '@/providers/query-provider';
import { AuthProvider } from '@/providers/auth-provider';
import RouteGuard from '@/components/auth/route-guard';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Glynac - Workplace Analytics Platform',
  description: 'Advanced workplace analytics and collaboration insights',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <AuthProvider>
            <RouteGuard>
              {children}
            </RouteGuard>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}