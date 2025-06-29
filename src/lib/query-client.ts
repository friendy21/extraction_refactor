// src/lib/query-client.ts
import { QueryClient, DefaultOptions } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * Default options for React Query
 */
const defaultOptions: DefaultOptions = {
  queries: {
    // Stale time - how long data is considered fresh
    staleTime: 5 * 60 * 1000, // 5 minutes
    
    // Cache time - how long data stays in cache after becoming unused
    gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
    
    // Retry configuration
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors except for specific cases
      if (error?.status >= 400 && error?.status < 500) {
        // Retry on rate limiting (429) and request timeout (408)
        if (error.status === 408 || error.status === 429) {
          return failureCount < 2;
        }
        // Don't retry on authentication errors
        if (error.status === 401 || error.status === 403) {
          return false;
        }
        // Don't retry on other 4xx errors
        return false;
      }
      
      // Retry on 5xx errors and network errors
      return failureCount < 3;
    },
    
    // Retry delay with exponential backoff
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    
    // Refetch configuration
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    
    // Error handling
    throwOnError: (error: any) => {
      // Throw error for 5xx server errors to trigger error boundaries
      return error?.status >= 500;
    },
  },
  
  mutations: {
    // Retry configuration for mutations
    retry: (failureCount, error: any) => {
      // Only retry on network errors and 5xx errors
      if (!error?.status || error.status >= 500) {
        return failureCount < 2;
      }
      return false;
    },
    
    // Retry delay for mutations
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    
    // Global error handling
    onError: (error: any, variables, context) => {
      console.error('Mutation error:', error);
      
      // Show error toast for user-facing errors
      if (error?.message && !error?.status || error?.status >= 400) {
        toast.error(error.message || 'An unexpected error occurred');
      }
      
      // Handle authentication errors
      if (error?.status === 401) {
        // Dispatch token expired event
        window.dispatchEvent(new Event('tokenExpired'));
      }
    },
    
    // Global success handling
    onSuccess: (data, variables, context) => {
      // Handle global success actions if needed
      if (process.env.NODE_ENV === 'development') {
        console.log('Mutation success:', { data, variables });
      }
    },
  },
};

/**
 * Create and configure React Query client
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions,
    
    // Query cache configuration
    queryCache: {
      onError: (error: any, query) => {
        console.error('Query error:', error, query);
        
        // Show error toast for critical queries
        if (query.meta?.showErrorToast !== false) {
          const message = error?.message || 'Failed to fetch data';
          toast.error(message);
        }
        
        // Handle authentication errors globally
        if (error?.status === 401) {
          window.dispatchEvent(new Event('tokenExpired'));
        }
      },
      
      onSuccess: (data, query) => {
        // Handle global query success if needed
        if (process.env.NODE_ENV === 'development' && query.meta?.debug) {
          console.log('Query success:', { data, queryKey: query.queryKey });
        }
      },
    },
    
    // Mutation cache configuration
    mutationCache: {
      onError: (error: any, variables, context, mutation) => {
        console.error('Mutation cache error:', error);
        
        // Show error toast for user-facing mutations
        if (mutation.meta?.showErrorToast !== false) {
          const message = error?.message || 'Operation failed';
          toast.error(message);
        }
      },
      
      onSuccess: (data, variables, context, mutation) => {
        // Show success toast for important mutations
        if (mutation.meta?.showSuccessToast && mutation.meta?.successMessage) {
          toast.success(mutation.meta.successMessage);
        }
      },
    },
  });
}

/**
 * Singleton query client instance
 */
export const queryClient = createQueryClient();

// Enhanced Query Provider has been moved to a separate .tsx file for proper JSX support.
// Please create a new file named 'enhanced-query-provider.tsx' in the appropriate directory and move the EnhancedQueryProvider component there.

/**
 * Query utilities for advanced usage
 */
export class QueryUtils {
  private queryClient: QueryClient;
  
  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
  }
  
  /**
   * Invalidate queries by pattern
   */
  invalidateByPattern(pattern: string[]): void {
    this.queryClient.invalidateQueries({
      queryKey: pattern,
    });
  }
  
  /**
   * Remove queries by pattern
   */
  removeByPattern(pattern: string[]): void {
    this.queryClient.removeQueries({
      queryKey: pattern,
    });
  }
  
  /**
   * Prefetch query with error handling
   */
  async safePrefetch<T>(
    queryKey: string[],
    queryFn: () => Promise<T>,
    options?: {
      staleTime?: number;
      onError?: (error: any) => void;
    }
  ): Promise<void> {
    try {
      await this.queryClient.prefetchQuery({
        queryKey,
        queryFn,
        staleTime: options?.staleTime || 5 * 60 * 1000,
      });
    } catch (error) {
      console.error('Prefetch failed:', error);
      options?.onError?.(error);
    }
  }
  
  /**
   * Set query data with optimistic updates
   */
  setOptimisticData<T>(
    queryKey: string[],
    updater: (oldData: T | undefined) => T,
    options?: {
      revert?: () => void;
    }
  ): void {
    const previousData = this.queryClient.getQueryData<T>(queryKey);
    
    this.queryClient.setQueryData(queryKey, updater);
    
    // Store revert function
    if (options?.revert) {
      setTimeout(() => {
        if (this.queryClient.getQueryState(queryKey)?.isError) {
          this.queryClient.setQueryData(queryKey, previousData);
          options.revert?.();
        }
      }, 100);
    }
  }
  
  /**
   * Cancel ongoing queries
   */
  async cancelQueries(queryKey?: string[]): Promise<void> {
    await this.queryClient.cancelQueries({
      queryKey,
    });
  }
  
  /**
   * Get cache statistics
   */
  getCacheStats(): {
    queryCount: number;
    mutationCount: number;
    cacheSize: string;
  } {
    const cache = this.queryClient.getQueryCache();
    const mutations = this.queryClient.getMutationCache();
    
    return {
      queryCount: cache.getAll().length,
      mutationCount: mutations.getAll().length,
      cacheSize: this.formatBytes(this.estimateCacheSize()),
    };
  }
  
  /**
   * Clear cache with confirmation
   */
  async clearCache(confirm = true): Promise<boolean> {
    if (confirm && typeof window !== 'undefined') {
      const shouldClear = window.confirm('Are you sure you want to clear the cache?');
      if (!shouldClear) return false;
    }
    
    this.queryClient.clear();
    return true;
  }
  
  private estimateCacheSize(): number {
    // Rough estimation of cache size
    const queries = this.queryClient.getQueryCache().getAll();
    return queries.length * 1024; // Assume 1KB per query on average
  }
  
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

/**
 * Hook to access query utilities
 */
export function useQueryUtils(): QueryUtils {
  const queryClient = useQueryClient();
  return new QueryUtils(queryClient);
}