// src/lib/api-client.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse } from '@/types';

/**
 * API Client configuration interface
 */
export interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

/**
 * Professional API Client with comprehensive error handling,
 * authentication, retry logic, and type safety
 */
export class ApiClient {
  private axios: AxiosInstance;
  private retries: number;
  private retryDelay: number;

  constructor(config: ApiClientConfig = {}) {
    this.retries = config.retries || 3;
    this.retryDelay = config.retryDelay || 1000;

    this.axios = axios.create({
      baseURL: config.baseURL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor for authentication
    this.axios.interceptors.request.use(
      (config) => {
        // Add auth token if available
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('auth_token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }

        // Add request timestamp for debugging
        config.metadata = { startTime: new Date() };
        
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling and logging
    this.axios.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log response time in development
        if (process.env.NODE_ENV === 'development' && response.config.metadata) {
          const endTime = new Date();
          const duration = endTime.getTime() - response.config.metadata.startTime.getTime();
          console.log(`API Request: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
        }

        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
          this.handleUnauthorized();
          return Promise.reject(error);
        }

        // Handle retry logic for 5xx errors and network errors
        if (this.shouldRetry(error) && !originalRequest._retry) {
          return this.retryRequest(originalRequest);
        }

        // Enhanced error logging
        this.logError(error);

        return Promise.reject(this.normalizeError(error));
      }
    );
  }

  /**
   * Determine if request should be retried
   */
  private shouldRetry(error: any): boolean {
    // Don't retry client errors (4xx) except for specific cases
    if (error.response?.status >= 400 && error.response?.status < 500) {
      // Retry on rate limiting (429) and request timeout (408)
      return error.response.status === 429 || error.response.status === 408;
    }

    // Retry on server errors (5xx) and network errors
    return (
      !error.response || // Network error
      error.response.status >= 500 || // Server error
      error.code === 'ECONNABORTED' || // Timeout
      error.code === 'NETWORK_ERROR'
    );
  }

  /**
   * Retry failed requests with exponential backoff
   */
  private async retryRequest(originalRequest: any): Promise<AxiosResponse> {
    originalRequest._retry = true;
    originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

    if (originalRequest._retryCount > this.retries) {
      throw new Error(`Request failed after ${this.retries} retries`);
    }

    // Exponential backoff
    const delay = this.retryDelay * Math.pow(2, originalRequest._retryCount - 1);
    await new Promise(resolve => setTimeout(resolve, delay));

    console.warn(`Retrying request (${originalRequest._retryCount}/${this.retries}):`, originalRequest.url);
    
    return this.axios(originalRequest);
  }

  /**
   * Handle unauthorized access
   */
  private handleUnauthorized(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
  }

  /**
   * Log errors for debugging and monitoring
   */
  private logError(error: any): void {
    const errorInfo = {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data,
      timestamp: new Date().toISOString(),
    };

    console.error('API Error:', errorInfo);

    // In production, you might want to send this to a monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Send to monitoring service (e.g., Sentry, LogRocket, etc.)
      // monitoringService.captureException(error, { extra: errorInfo });
    }
  }

  /**
   * Normalize error response to consistent format
   */
  private normalizeError(error: any): ApiError {
    return {
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      status: error.response?.status || 0,
      code: error.response?.data?.code || error.code || 'UNKNOWN_ERROR',
      details: error.response?.data?.details || null,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Generic request method with type safety
   */
  async request<T = any>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.axios(config);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  /**
   * POST request
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  /**
   * PUT request
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  /**
   * Upload file with progress tracking
   */
  async upload<T = any>(
    url: string, 
    file: File, 
    onProgress?: (progress: number) => void,
    additionalData?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    return this.request<T>({
      method: 'POST',
      url,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
  }

  /**
   * Update authentication token
   */
  setAuthToken(token: string | null): void {
    if (token) {
      this.axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', token);
      }
    } else {
      delete this.axios.defaults.headers.common['Authorization'];
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
      }
    }
  }

  /**
   * Get current base URL
   */
  getBaseURL(): string {
    return this.axios.defaults.baseURL || '';
  }

  /**
   * Update base URL
   */
  setBaseURL(baseURL: string): void {
    this.axios.defaults.baseURL = baseURL;
  }
}

/**
 * API Error interface
 */
export interface ApiError {
  message: string;
  status: number;
  code: string;
  details?: any;
  timestamp: string;
}

/**
 * Create singleton instance
 */
export const apiClient = new ApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
});

// Export default instance
export default apiClient;