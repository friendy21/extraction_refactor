'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLogin } from '@/hooks/api';
import { useAuth } from '@/providers/auth-provider';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showDemo, setShowDemo] = useState(false);
  
  const router = useRouter();
  const { user, setUser, isAuthenticated } = useAuth();
  const loginMutation = useLogin();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await loginMutation.mutateAsync(formData);
      
      if (result.success && result.data) {
        setUser(result.data.user);
        
        // Check if user needs to complete setup
        if (result.data.user.isFirstTimeUser && !result.data.user.setupCompleted) {
          router.push('/setup/organization');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (error) {
      console.error('Login failed:', error);
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
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              />
            </div>

            <div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loginMutation.isPending ? 'Signing in...' : 'Log in'}
              </button>
            </div>

            {loginMutation.error && (
              <div className="text-red-600 text-sm text-center">
                Login failed. Please check your credentials.
              </div>
            )}
          </form>

          {/* Demo Account Section */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Demo Account</h3>
              <button
                type="button"
                onClick={handleDemoLogin}
                className="text-sm text-blue-600 hover:text-blue-500 border border-blue-300 hover:border-blue-400 px-3 py-1 rounded"
              >
                Use Demo Credentials
              </button>
              
              {showDemo && (
                <div className="mt-3 text-xs text-gray-600 space-y-1">
                  <div><strong>Email:</strong> admin123@glynac.ai</div>
                  <div><strong>Password:</strong> admin123</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}