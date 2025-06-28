// src/app/api/connections/client.ts

/**
 * Connection status types
 */
export enum ConnectionStatus {
  PENDING = 'pending',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
}

/**
 * API response error structure
 */
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

/**
 * Connection statistics response
 */
export interface ConnectionStats {
  connection_id: string;
  status: ConnectionStatus;
  last_connected_at: string;
  created_at: string;
  error?: string;
}

/**
 * Generic connection response
 */
export interface ConnectionResponse {
  connection_id: string;
  status: ConnectionStatus;
  error?: string;
}

/**
 * Custom error class for API errors
 */
export class ConnectionApiError extends Error {
  public statusCode: number;
  public apiError?: ApiError;

  constructor(message: string, statusCode: number, apiError?: ApiError) {
    super(message);
    this.name = 'ConnectionApiError';
    this.statusCode = statusCode;
    this.apiError = apiError;
  }
}

// Service-specific connection configs
export interface Microsoft365Config {
  tenant_id: string;
  client_id: string;
  client_secret: string;
  redirect_uri: string;
}

export interface GoogleWorkspaceConfig {
  account_id: string;
  client_id: string;
  client_secret: string;
  redirect_uri: string;
}

export interface DropboxConfig {
  app_key: string;
  client_id: string;
  client_secret: string;
  redirect_uri: string;
}

export interface SlackConfig {
  workspace_id: string;
  client_id: string;
  client_secret: string;
  redirect_uri: string;
}

export interface ZoomConfig {
  account_id: string;
  client_id: string;
  client_secret: string;
  redirect_uri: string;
}

export interface JiraConfig {
  instance_url: string;
  client_id: string;
  client_secret: string;
  redirect_uri: string;
}

export interface CustomApiConfig {
  api_url: string;
  api_key: string;
  auth_type: string;
  headers?: Record<string, string>;
}

// Connection services enum
export enum ConnectionService {
  MICROSOFT365 = 'microsoft365',
  GOOGLEWORKSPACE = 'googleworkspace',
  DROPBOX = 'dropbox',
  SLACK = 'slack',
  ZOOM = 'zoom',
  JIRA = 'jira',
  CUSTOMAPI = 'customapi',
}

/**
 * Request options
 */
export interface RequestOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

/**
 * Client for interacting with the connections API endpoints
 */
export class ConnectionClient {
  private baseUrl: string;
  private token?: string;
  private defaultTimeout = 30000; // 30 seconds default timeout
  private maxRetries = 3; // Default max retries
  private retryDelay = 1000; // Default retry delay in ms

  /**
   * Create a new ConnectionClient instance
   * * @param baseUrl - Base URL for the API, defaults to '/api'
   * @param token - Optional API token for authenticated requests
   */
  constructor(baseUrl: string = '/api', token?: string) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  /**
   * Set the API token for authenticated requests
   * * @param token - The authentication token
   */
  public setToken(token: string): void {
    this.token = token;
  }

  /**
   * Clear the current API token
   */
  public clearToken(): void {
    this.token = undefined;
  }

  /**
   * Set request configuration
   * * @param config - Configuration options
   */
  public setConfig(config: {
    timeout?: number;
    maxRetries?: number;
    retryDelay?: number;
  }): void {
    if (config.timeout) this.defaultTimeout = config.timeout;
    if (config.maxRetries) this.maxRetries = config.maxRetries;
    if (config.retryDelay) this.retryDelay = config.retryDelay;
  }

  /**
   * Common headers for API requests
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest', // CSRF protection
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Make an API request with retry and timeout support
   * * @param url - The URL to request
   * @param method - The HTTP method
   * @param body - Optional request body
   * @param options - Request options
   * @returns Promise with the response data
   */
  private async request<T>(
    url: string,
    method: string,
    body?: any,
    options: RequestOptions = {}
  ): Promise<T> {
    const timeout = options.timeout || this.defaultTimeout;
    const maxRetries = options.retries || this.maxRetries;
    const retryDelay = options.retryDelay || this.retryDelay;
    
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Create AbortController for timeout handling
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const response = await fetch(url, {
          method,
          headers: this.getHeaders(),
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });
        
        // Clear the timeout
        clearTimeout(timeoutId);
        
        // Handle unsuccessful responses
        if (!response.ok) {
          let errorData: ApiError;
          
          try {
            errorData = await response.json();
          } catch (e) {
            errorData = {
              code: 'unknown_error',
              message: `API error: ${response.status} ${response.statusText}`
            };
          }
          
          throw new ConnectionApiError(
            errorData.message || `API error: ${response.status}`,
            response.status,
            errorData
          );
        }
        
        // Parse and return successful response
        return await response.json() as T;
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry if it's an abort error (timeout) or we've reached max retries
        if (
          error instanceof DOMException && error.name === 'AbortError' ||
          error instanceof ConnectionApiError && error.statusCode >= 400 && error.statusCode < 500 ||
          attempt >= maxRetries
        ) {
          break;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
      }
    }
    
    // If we got here, all attempts failed
    throw lastError || new Error('Request failed after multiple attempts');
  }

  /**
   * Validate connection configuration
   * * @param service - The service type
   * @param config - The configuration object 
   */
  private validateConfig(service: ConnectionService, config: any): void {
    const requiredFields: Record<ConnectionService, string[]> = {
      [ConnectionService.MICROSOFT365]: ['tenant_id', 'client_id', 'client_secret', 'redirect_uri'],
      [ConnectionService.GOOGLEWORKSPACE]: ['account_id', 'client_id', 'client_secret', 'redirect_uri'],
      [ConnectionService.DROPBOX]: ['app_key', 'client_id', 'client_secret', 'redirect_uri'],
      [ConnectionService.SLACK]: ['workspace_id', 'client_id', 'client_secret', 'redirect_uri'],
      [ConnectionService.ZOOM]: ['account_id', 'client_id', 'client_secret', 'redirect_uri'],
      [ConnectionService.JIRA]: ['instance_url', 'client_id', 'client_secret', 'redirect_uri'],
      [ConnectionService.CUSTOMAPI]: ['api_url', 'api_key', 'auth_type'],
    };
    
    const fields = requiredFields[service];
    
    for (const field of fields) {
      if (!config[field]) {
        throw new Error(`Missing required field: ${field} for ${service} connection`);
      }
    }
  }

  /**
   * Create a new connection configuration
   * * @param service - The service type
   * @param config - Service-specific configuration
   * @returns Promise with connection response
   */
  public async createConnection(
    service: ConnectionService, 
    config: Record<string, any>
  ): Promise<ConnectionResponse> {
    try {
      // Validate config
      this.validateConfig(service, config);
      
      // Sanitize sensitive data for logging
      const sanitizedConfig = { ...config };
      if (sanitizedConfig.client_secret) sanitizedConfig.client_secret = '***********';
      if (sanitizedConfig.api_key) sanitizedConfig.api_key = '***********';
      
      console.info(`Creating ${service} connection with config:`, sanitizedConfig);
      
      return await this.request<ConnectionResponse>(
        `${this.baseUrl}/connections/${service.toLowerCase()}`,
        'POST',
        config
      );
    } catch (error) {
      console.error(`Error creating ${service} connection:`, error);
      throw error;
    }
  }

  /**
   * Get statistics for a connection
   * * @param connectionId - The connection ID
   * @returns Promise with connection statistics
   */
  public async getConnectionStats(connectionId: string): Promise<ConnectionStats> {
    try {
      if (!connectionId || typeof connectionId !== 'string') {
        throw new Error('Invalid connection ID provided');
      }
      
      return await this.request<ConnectionStats>(
        `${this.baseUrl}/connections/stats`,
        'POST',
        { connection_id: connectionId }
      );
    } catch (error) {
      console.error(`Error getting connection stats:`, error);
      throw error;
    }
  }

  /**
   * Initiate a connection using configured credentials
   * * @param connectionId - The connection ID
   * @returns Promise with connection response
   */
  public async connect(connectionId: string): Promise<ConnectionResponse> {
    try {
      if (!connectionId || typeof connectionId !== 'string') {
        throw new Error('Invalid connection ID provided');
      }
      
      return await this.request<ConnectionResponse>(
        `${this.baseUrl}/connections/connect`,
        'POST',
        { connection_id: connectionId }
      );
    } catch (error) {
      console.error(`Error connecting:`, error);
      throw error;
    }
  }

  /**
   * Check if a connection is active
   * * @param connectionId - The connection ID
   * @returns Promise with boolean indicating active status
   */
  public async isConnectionActive(connectionId: string): Promise<boolean> {
    try {
      const stats = await this.getConnectionStats(connectionId);
      return stats.status === ConnectionStatus.CONNECTED;
    } catch (error) {
      console.error(`Error checking connection status:`, error);
      return false;
    }
  }

  /**
   * Microsoft 365 connection
   * * @param config - Microsoft 365 connection config
   * @returns Promise with connection response
   */
  public async createMicrosoft365Connection(
    config: Microsoft365Config
  ): Promise<ConnectionResponse> {
    return this.createConnection(ConnectionService.MICROSOFT365, config);
  }

  /**
   * Google Workspace connection
   * * @param config - Google Workspace connection config
   * @returns Promise with connection response
   */
  public async createGoogleWorkspaceConnection(
    config: GoogleWorkspaceConfig
  ): Promise<ConnectionResponse> {
    return this.createConnection(ConnectionService.GOOGLEWORKSPACE, config);
  }

  /**
   * Dropbox connection
   * * @param config - Dropbox connection config
   * @returns Promise with connection response
   */
  public async createDropboxConnection(
    config: DropboxConfig
  ): Promise<ConnectionResponse> {
    return this.createConnection(ConnectionService.DROPBOX, config);
  }

  /**
   * Slack connection
   * * @param config - Slack connection config
   * @returns Promise with connection response
   */
  public async createSlackConnection(
    config: SlackConfig
  ): Promise<ConnectionResponse> {
    return this.createConnection(ConnectionService.SLACK, config);
  }

  /**
   * Zoom connection
   * * @param config - Zoom connection config
   * @returns Promise with connection response
   */
  public async createZoomConnection(
    config: ZoomConfig
  ): Promise<ConnectionResponse> {
    return this.createConnection(ConnectionService.ZOOM, config);
  }

  /**
   * Jira connection
   * * @param config - Jira connection config
   * @returns Promise with connection response
   */
  public async createJiraConnection(
    config: JiraConfig
  ): Promise<ConnectionResponse> {
    return this.createConnection(ConnectionService.JIRA, config);
  }

  /**
   * Custom API connection
   * * @param config - Custom API connection config
   * @returns Promise with connection response
   */
  public async createCustomApiConnection(
    config: CustomApiConfig
  ): Promise<ConnectionResponse> {
    return this.createConnection(ConnectionService.CUSTOMAPI, config);
  }
}

// Create a default client instance
export const connectionClient = new ConnectionClient();

export default connectionClient;