// src/providers/auth-provider.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { ApiServices } from '@/services/api-services';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  checkAuth: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Enhanced Authentication Provider with comprehensive auth management
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Check authentication status on mount and token refresh
   */
  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      clearError();

      const token = localStorage.getItem('auth_token');
      if (!token) {
        setUser(null);
        return;
      }

      // Set token in API client
      apiClient.setAuthToken(token);

      // Verify token with backend
      try {
        const response = await ApiServices.Auth.getMe();
        if (response.success && response.data) {
          setUser(response.data);
          // Update stored user data
          localStorage.setItem('user_data', JSON.stringify(response.data));
        } else {
          throw new Error('Invalid token response');
        }
      } catch (authError: any) {
        console.error('Token verification failed:', authError);
        // Clear invalid token
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        apiClient.setAuthToken(null);
        setUser(null);
        
        // Don't throw error here to avoid infinite loops
        if (authError.status !== 401) {
          setError('Authentication verification failed');
        }
      }
    } catch (error: any) {
      console.error('Auth check failed:', error);
      setError('Authentication check failed');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  /**
   * Login function
   */
  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      clearError();

      const response = await ApiServices.Auth.login({ email, password });
      
      if (response.success && response.data) {
        const { user: userData, token } = response.data;
        
        // Update state
        setUser(userData);
        
        // Store in localStorage (already done in AuthService)
        // But let's ensure it's set properly
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_data', JSON.stringify(userData));
        
        // Set token in API client
        apiClient.setAuthToken(token);
        
        // Navigate based on user setup status
        if (userData.isFirstTimeUser && !userData.setupCompleted) {
          router.push('/setup/organization');
        } else {
          router.push('/dashboard');
        }
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please check your credentials.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [router, clearError]);

  /**
   * Logout function
   */
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      clearError();

      // Call logout API (this also clears local storage)
      await ApiServices.Auth.logout();
      
      // Update state
      setUser(null);
      
      // Navigate to login
      router.push('/login');
    } catch (error: any) {
      console.error('Logout error:', error);
      // Even if API call fails, clear local state
      setUser(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      apiClient.setAuthToken(null);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  }, [router, clearError]);

  /**
   * Refresh token function
   */
  const refreshToken = useCallback(async () => {
    try {
      const response = await ApiServices.Auth.refreshToken();
      
      if (response.success && response.data?.token) {
        const newToken = response.data.token;
        localStorage.setItem('auth_token', newToken);
        apiClient.setAuthToken(newToken);
        
        // Re-fetch user data
        await checkAuth();
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error: any) {
      console.error('Token refresh failed:', error);
      // If refresh fails, logout user
      await logout();
    }
  }, [checkAuth, logout]);

  /**
   * Handle token expiration
   */
  useEffect(() => {
    const handleTokenExpiration = () => {
      console.warn('Token expired, attempting refresh...');
      refreshToken();
    };

    // Listen for token expiration events (you can dispatch these from API client)
    window.addEventListener('tokenExpired', handleTokenExpiration);
    
    return () => {
      window.removeEventListener('tokenExpired', handleTokenExpiration);
    };
  }, [refreshToken]);

  /**
   * Auto-refresh token before expiration
   */
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token || !user) return;

    // Refresh token every 30 minutes if user is authenticated
    const refreshInterval = setInterval(() => {
      refreshToken();
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(refreshInterval);
  }, [user, refreshToken]);

  /**
   * Check authentication on mount
   */
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /**
   * Handle visibility change to refresh token when tab becomes active
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        // Check auth when tab becomes visible again
        checkAuth();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, checkAuth]);

  /**
   * Handle storage events (logout from another tab)
   */
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token' && !e.newValue && user) {
        // Token was removed from another tab
        setUser(null);
        apiClient.setAuthToken(null);
        router.push('/login');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user, router]);

  const value: AuthContextType = {
    user,
    setUser,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshToken,
    checkAuth,
    error,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to use authentication context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

/**
 * Hook to check if user has specific permissions
 */
export function usePermissions() {
  const { user } = useAuth();
  
  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) return false;
    
    // Add your permission logic here
    // For now, we'll assume all authenticated users have all permissions
    return true;
  }, [user]);

  const hasRole = useCallback((role: string): boolean => {
    if (!user) return false;
    
    // Add your role logic here
    // This would depend on your user model structure
    return true;
  }, [user]);

  return {
    hasPermission,
    hasRole,
  };
}

/**
 * Higher-order component for route protection
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    redirectTo?: string;
    requireSetup?: boolean;
  } = {}
) {
  const { redirectTo = '/login', requireSetup = false } = options;

  return function AuthenticatedComponent(props: P) {
    const { user, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (isLoading) return;

      if (!isAuthenticated) {
        router.push(redirectTo);
        return;
      }

      if (requireSetup && user?.isFirstTimeUser && !user?.setupCompleted) {
        router.push('/setup/organization');
        return;
      }
    }, [isAuthenticated, isLoading, user, router]);

    if (isLoading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    if (requireSetup && user?.isFirstTimeUser && !user?.setupCompleted) {
      return null;
    }

    return <Component {...props} />;
  };
}