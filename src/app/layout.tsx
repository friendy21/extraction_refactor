// src/app/layout.tsx (KEEP ONLY THIS)
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { EnhancedQueryProvider } from '@/lib/query-client';
import { AuthProvider } from '@/providers/auth-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Glynac - Workplace Analytics Platform',
  description: 'Gain powerful insights into your workplace dynamics',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <EnhancedQueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </EnhancedQueryProvider>
      </body>
    </html>
  );
}