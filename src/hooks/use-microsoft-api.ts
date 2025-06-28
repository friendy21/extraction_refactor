// src/hooks/use-microsoft-api.ts
import { useMutation, useQuery } from '@tanstack/react-query';

// Mock implementations for Microsoft API services
// In production, these would connect to actual Microsoft Graph API endpoints

export interface MicrosoftExtractionConfig {
  connectionId: string;
  config: {
    tenant_id: string;
    client_id: string;
    client_secret: string;
    user_upns?: string[];
  };
}

export interface MicrosoftServiceHealth {
  status: 'healthy' | 'unhealthy' | 'unknown';
  service: string;
  timestamp: string;
}

// User Extraction Hook
export const useStartUserExtraction = () => {
  return useMutation({
    mutationFn: async (data: MicrosoftExtractionConfig) => {
      console.log('Starting user extraction:', data);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        success: true,
        data: {
          extraction_id: data.connectionId,
          status: 'started',
          message: 'User extraction started successfully'
        }
      };
    },
  });
};

// Calendar Activity Hook
export const useStartCalendarExtraction = () => {
  return useMutation({
    mutationFn: async (data: MicrosoftExtractionConfig) => {
      console.log('Starting calendar extraction:', data);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        success: true,
        data: {
          extraction_id: data.connectionId,
          status: 'started',
          message: 'Calendar extraction started successfully'
        }
      };
    },
  });
};

// Teams Chat Hook
export const useStartTeamsExtraction = () => {
  return useMutation({
    mutationFn: async (data: MicrosoftExtractionConfig) => {
      console.log('Starting Teams extraction:', data);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        success: true,
        data: {
          extraction_id: data.connectionId,
          status: 'started',
          message: 'Teams extraction started successfully'
        }
      };
    },
  });
};

// OneDrive Activity Hook
export const useStartOneDriveExtraction = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      console.log('Starting OneDrive extraction:', data);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        success: true,
        data: {
          connection_id: data.connection_id,
          status: 'started',
          message: 'OneDrive extraction started successfully'
        }
      };
    },
  });
};

// Outlook Mail Hook
export const useStartOutlookBatchExtraction = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      console.log('Starting Outlook batch extraction:', data);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        success: true,
        data: {
          batch_task_id: data.batchTaskId,
          status: 'started',
          message: 'Outlook extraction started successfully'
        }
      };
    },
  });
};

// SharePoint Hook
export const useStartSharePointExtraction = () => {
  return useMutation({
    mutationFn: async (data: MicrosoftExtractionConfig) => {
      console.log('Starting SharePoint extraction:', data);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        success: true,
        data: {
          extraction_id: data.connectionId,
          status: 'started',
          message: 'SharePoint extraction started successfully'
        }
      };
    },
  });
};

// All Services Health Hook
export const useAllServicesHealth = () => {
  return useQuery<Record<string, MicrosoftServiceHealth>>({
    queryKey: ['microsoft-services-health'],
    queryFn: async () => {
      // Simulate health check API calls
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        user: {
          status: 'healthy',
          service: 'User Extraction',
          timestamp: new Date().toISOString()
        },
        calendar: {
          status: 'healthy',
          service: 'Calendar Activity',
          timestamp: new Date().toISOString()
        },
        teams: {
          status: 'healthy',
          service: 'Teams Chat',
          timestamp: new Date().toISOString()
        },
        onedrive: {
          status: 'healthy',
          service: 'OneDrive Activity',
          timestamp: new Date().toISOString()
        },
        outlook: {
          status: 'healthy',
          service: 'Outlook Mail',
          timestamp: new Date().toISOString()
        },
        sharepoint: {
          status: 'healthy',
          service: 'SharePoint',
          timestamp: new Date().toISOString()
        }
      };
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // 1 minute
  });
};

// Individual service health hooks
export const useUserExtractionHealth = () => {
  return useQuery({
    queryKey: ['user-extraction-health'],
    queryFn: async (): Promise<MicrosoftServiceHealth> => {
      await new Promise(resolve => setTimeout(resolve, 200));
      return {
        status: 'healthy',
        service: 'User Extraction',
        timestamp: new Date().toISOString()
      };
    },
  });
};

export const useCalendarExtractionHealth = () => {
  return useQuery({
    queryKey: ['calendar-extraction-health'],
    queryFn: async (): Promise<MicrosoftServiceHealth> => {
      await new Promise(resolve => setTimeout(resolve, 200));
      return {
        status: 'healthy',
        service: 'Calendar Activity',
        timestamp: new Date().toISOString()
      };
    },
  });
};

// Export utility functions
export const getMicrosoftServiceStatus = (serviceKey: string, healthData: any) => {
  return healthData?.[serviceKey]?.status || 'unknown';
};

export const formatMicrosoftConnectionId = (serviceType: string): string => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `microsoft-${serviceType}-${timestamp}`;
};

// ===================================

// Update to src/types/connection.ts - Add missing interface
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

// ADD THIS MISSING INTERFACE
export interface ConfigModal {
  isOpen: boolean;
  platform: PlatformConfig | null;
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