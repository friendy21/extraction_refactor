// src/app/layout.tsx - Updated with enhanced providers
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { EnhancedQueryProvider } from '@/lib/query-client';
import { AuthProvider } from '@/providers/auth-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Glynac - Workplace Analytics Platform',
  description: 'Gain powerful insights into your workplace dynamics and improve collaboration',
  keywords: ['workplace analytics', 'collaboration', 'productivity', 'team insights'],
  authors: [{ name: 'Glynac Team' }],
  viewport: 'width=device-width, initial-scale=1',
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

// src/app/page.tsx - Updated with enhanced auth handling
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';

export default function HomePage() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated && user) {
      if (user.isFirstTimeUser && !user.setupCompleted) {
        router.push('/setup/organization');
      } else {
        router.push('/dashboard');
      }
    } else {
      router.push('/login');
    }
  }, [isAuthenticated, user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return null;
}

// src/app/login/page.tsx - Updated with enhanced error handling
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { toast } from 'sonner';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showDemo, setShowDemo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const router = useRouter();
  const { user, isAuthenticated, login, error, clearError } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.isFirstTimeUser && !user.setupCompleted) {
        router.push('/setup/organization');
      } else {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, user, router]);

  // Clear error when form data changes
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [formData, error, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    if (!formData.email.trim() || !formData.password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await login(formData.email, formData.password);
      // Navigation is handled in the login function
    } catch (error: any) {
      // Error is handled in AuthProvider and displayed via toast
      console.error('Login failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = () => {
    setFormData({
      email: 'admin123@glynac.ai',
      password: 'admin123'
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Glynac</h1>
          <h2 className="text-xl text-gray-600">Log in to your account</h2>
          <p className="mt-2 text-sm text-gray-500">
            Enter your credentials to access your account
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'Log in'
                )}
              </button>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Login Failed
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>

          {/* Demo Account Section */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Demo Account</h3>
              <p className="text-xs text-gray-600 mb-3">
                Use the demo credentials to explore the platform
              </p>
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={isSubmitting}
                className="text-sm text-blue-600 hover:text-blue-500 border border-blue-300 hover:border-blue-400 px-3 py-1 rounded transition-colors disabled:opacity-50"
              >
                Use Demo Credentials
              </button>
              
              {showDemo && (
                <div className="mt-3 text-xs text-gray-600 space-y-1">
                  <div><strong>Email:</strong> admin123@glynac.ai</div>
                  <div><strong>Password:</strong> admin123</div>
                </div>
              )}
              
              <button
                type="button"
                onClick={() => setShowDemo(!showDemo)}
                className="ml-2 text-xs text-gray-500 hover:text-gray-700"
              >
                {showDemo ? 'Hide' : 'Show'} credentials
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// src/app/dashboard/page.tsx - Updated with enhanced error handling
'use client';

import React from 'react';
import { useGetDashboardStats } from '@/hooks/api';
import { useAuth } from '@/providers/auth-provider';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { data: statsData, isLoading, error } = useGetDashboardStats();

  const stats = statsData?.data;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      toast.error('Logout failed. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Failed to Load Dashboard</h2>
          <p className="text-gray-600 mb-6">
            {error?.message || 'An unexpected error occurred while loading the dashboard.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Glynac</h1>
              <span className="ml-2 text-sm text-gray-500">Analytics Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user?.name || 'User'}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Analytics Dashboard</h2>
          <p className="text-lg text-gray-600">
            Welcome to your Glynac analytics dashboard. Your workplace insights are ready for exploration.
          </p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
                  <p className="text-gray-600">Total Employees</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.departments}</p>
                  <p className="text-gray-600">Departments</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100">
                  <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.locations}</p>
                  <p className="text-gray-600">Locations</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-orange-100">
                  <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.remoteWorkers}</p>
                  <p className="text-gray-600">Remote Workers</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Data Collection Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stats.dataCollection.emails.toLocaleString()}</div>
                <div className="text-gray-600">Emails Analyzed</div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{stats.dataCollection.meetings.toLocaleString()}</div>
                <div className="text-gray-600">Meetings Processed</div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">{stats.dataCollection.chatMessages.toLocaleString()}</div>
                <div className="text-gray-600">Chat Messages</div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">{stats.dataCollection.fileAccesses.toLocaleString()}</div>
                <div className="text-gray-600">File Accesses</div>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        <div className="bg-white shadow rounded-lg p-8">
          <div className="text-center">
            <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🎉 Backend Integration Complete!</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Your Glynac platform is now fully integrated with professional backend services using Axios and React Query. 
              The system includes comprehensive error handling, authentication management, caching strategies, and type-safe API communications.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <div className="text-left max-w-3xl mx-auto">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">✅ Implementation Features:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                  <div>
                    <h4 className="font-semibold mb-2">API Client:</h4>
                    <ul className="space-y-1">
                      <li>• Professional Axios configuration</li>
                      <li>• Automatic retry with exponential backoff</li>
                      <li>• Request/response interceptors</li>
                      <li>• Type-safe error handling</li>
                      <li>• Authentication token management</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">React Query:</h4>
                    <ul className="space-y-1">
                      <li>• Optimized caching strategies</li>
                      <li>• Background refetching</li>
                      <li>• Optimistic updates</li>
                      <li>• Query invalidation</li>
                      <li>• Offline support</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Services Layer:</h4>
                    <ul className="space-y-1">
                      <li>• Service-oriented architecture</li>
                      <li>• Comprehensive API coverage</li>
                      <li>• Type-safe service methods</li>
                      <li>• Error normalization</li>
                      <li>• Consistent response formats</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Authentication:</h4>
                    <ul className="space-y-1">
                      <li>• Secure token management</li>
                      <li>• Automatic token refresh</li>
                      <li>• Route protection</li>
                      <li>• Session persistence</li>
                      <li>• Multi-tab synchronization</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-sm text-gray-500">
              <p>Ready for production deployment with enterprise-grade reliability and performance.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}