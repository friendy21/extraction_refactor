export interface PlatformConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  features: string[];
  connected: boolean;
  connectionId?: string;
  status?: 'disconnected' | 'configured' | 'connecting' | 'connected' | 'error';
  configuredAt?: string;
  connectedAt?: string;
  lastError?: string;
}

export interface ConnectionConfiguration {
  id?: string;
  platformId: string;
  sourceName: string;
  authMethod: 'oauth' | 'api_key' | 'service_account';
  environment: 'production' | 'staging' | 'sandbox';
  dataTypes: string[];
  permissions: string[];
  refreshInterval: string;
  encryptionEnabled: boolean;
  dataRetention: number;
  
  // OAuth specific
  clientId?: string;
  tenantId?: string;
  redirectUri?: string;
  scopes?: string[];
  
  // API Key specific
  apiKey?: string;
  endpointUrl?: string;
  
  // Advanced settings
  rateLimit?: number;
  retryPolicy?: 'exponential' | 'linear' | 'none';
  webhooksEnabled?: boolean;
  webhookUrl?: string;
  
  createdAt?: string;
  updatedAt?: string;
  status: 'draft' | 'configured' | 'active' | 'error';
}

export interface ConnectionStatus {
  id: string;
  platformId: string;
  status: 'connecting' | 'connected' | 'error' | 'disconnected';
  lastConnected?: string;
  lastError?: string;
  dataCollected?: {
    emails?: number;
    meetings?: number;
    files?: number;
    messages?: number;
  };
  healthCheck?: {
    status: 'healthy' | 'warning' | 'error';
    lastCheck: string;
    details?: string;
  };
}