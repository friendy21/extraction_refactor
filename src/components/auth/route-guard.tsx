'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';

interface RouteGuardProps {
  children: React.ReactNode;
}

export default function RouteGuard({ children }: RouteGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    const isLoginPage = pathname === '/login';
    const isSetupPage = pathname.startsWith('/setup');
    const isDashboardPage = pathname === '/dashboard';

    // If not authenticated and not on login page, redirect to login
    if (!isAuthenticated && !isLoginPage) {
      router.push('/login');
      return;
    }

    // If authenticated, handle routing based on setup status
    if (isAuthenticated && user) {
      // If user is first time and hasn't completed setup
      if (user.isFirstTimeUser && !user.setupCompleted) {
        // If not on setup pages, redirect to setup
        if (!isSetupPage && !isLoginPage) {
          router.push('/setup/organization');
          return;
        }
      } else {
        // User has completed setup or is not first time
        // If on login or setup pages, redirect to dashboard
        if (isLoginPage || isSetupPage) {
          router.push('/dashboard');
          return;
        }
      }
    }
  }, [isAuthenticated, user, isLoading, pathname, router]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}



