// src/lib/api-client.ts
import { API_CONFIG } from './api-config';
import type {
  BaseApiResponse,
  PaginationParams,
  UserExtractionConfig,
  UserExtractionStatus,
  UserExtractionResult,
  CalendarConfig,
  CalendarResult,
  TeamsConfig,
  TeamsStatus,
  ChatMessage,
  PersonalChatMessage,
  Team,
  OneDriveConfig,
  OneDriveStatus,
  Document,
  Activity,
  OutlookConfig,
  OutlookBatchStatus,
  EmailMessage,
  SharePointConfig,
  SharePointStatus,
  SharePointItem,
  ServiceHealth,
  ExtractionStatus
} from '@/types/api';

class ApiClient {
  private async request<T>(
    baseUrl: string,
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${baseUrl}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: defaultHeaders,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || 
          errorData.error || 
          `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${url}`, error);
      throw error;
    }
  }

  // ===========================================
  // Microsoft User Extraction Service
  // ===========================================
  
  async getUserExtractionHealth(): Promise<ServiceHealth> {
    return this.request(
      API_CONFIG.USER_EXTRACTION,
      API_CONFIG.ENDPOINTS.USER.HEALTH
    );
  }

  async startUserExtraction(
    connectionId: string,
    config: UserExtractionConfig
  ): Promise<BaseApiResponse & { connection_id: string; status: string }> {
    return this.request(
      API_CONFIG.USER_EXTRACTION,
      `${API_CONFIG.ENDPOINTS.USER.START}/${connectionId}`,
      {
        method: 'POST',
        body: JSON.stringify(config),
      }
    );
  }

  async getUserExtractionStatus(connectionId: string): Promise<UserExtractionStatus> {
    return this.request(
      API_CONFIG.USER_EXTRACTION,
      `${API_CONFIG.ENDPOINTS.USER.STATUS}/${connectionId}`
    );
  }

  async getUserExtractionResult(connectionId: string): Promise<UserExtractionResult> {
    return this.request(
      API_CONFIG.USER_EXTRACTION,
      `${API_CONFIG.ENDPOINTS.USER.RESULT}/${connectionId}`
    );
  }

  async deleteUserExtraction(connectionId: string): Promise<BaseApiResponse> {
    return this.request(
      API_CONFIG.USER_EXTRACTION,
      `${API_CONFIG.ENDPOINTS.USER.DELETE}/${connectionId}`,
      { method: 'DELETE' }
    );
  }

  async listUserExtractions(): Promise<{
    total: number;
    extractions: Array<ExtractionStatus & { user_count: number }>;
  }> {
    return this.request(
      API_CONFIG.USER_EXTRACTION,
      API_CONFIG.ENDPOINTS.USER.LIST
    );
  }

  async getUserExtractionStatistics(): Promise<{
    extractions: {
      total: number;
      completed: number;
      failed: number;
      in_progress: number;
    };
    users: { total: number };
    active_extractions: number;
    timestamp: string;
  }> {
    return this.request(
      API_CONFIG.USER_EXTRACTION,
      API_CONFIG.ENDPOINTS.USER.STATISTICS
    );
  }

  async cleanupUserExtractions(daysOld: number = 30): Promise<{
    message: string;
    deleted_extractions: number;
    days_old: number;
  }> {
    return this.request(
      API_CONFIG.USER_EXTRACTION,
      `${API_CONFIG.ENDPOINTS.USER.CLEANUP}?days_old=${daysOld}`,
      { method: 'POST' }
    );
  }

  // ===========================================
  // Calendar Activity Service
  // ===========================================

  async getCalendarHealth(): Promise<ServiceHealth> {
    return this.request(
      API_CONFIG.CALENDAR_ACTIVITY,
      API_CONFIG.ENDPOINTS.CALENDAR.HEALTH
    );
  }

  async startCalendarExtraction(
    connectionId: string,
    config: CalendarConfig
  ): Promise<BaseApiResponse & { connection_id: string; status: string }> {
    return this.request(
      API_CONFIG.CALENDAR_ACTIVITY,
      `${API_CONFIG.ENDPOINTS.CALENDAR.START}/${connectionId}`,
      {
        method: 'POST',
        body: JSON.stringify(config),
      }
    );
  }

  async getCalendarStatus(connectionId: string): Promise<{
    id: string;
    connection_id: string;
    status: string;
    started_at?: string;
    completed_at?: string;
    error_message?: string;
    created_at: string;
    updated_at: string;
  }> {
    return this.request(
      API_CONFIG.CALENDAR_ACTIVITY,
      `${API_CONFIG.ENDPOINTS.CALENDAR.STATUS}/${connectionId}`
    );
  }

  async getCalendarResult(
    connectionId: string,
    params?: PaginationParams
  ): Promise<CalendarResult> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
    
    const endpoint = `${API_CONFIG.ENDPOINTS.CALENDAR.RESULT}/${connectionId}${
      queryParams.toString() ? `?${queryParams}` : ''
    }`;
    
    return this.request(API_CONFIG.CALENDAR_ACTIVITY, endpoint);
  }

  // ===========================================
  // Teams Chat Service
  // ===========================================

  async getTeamsHealth(): Promise<ServiceHealth> {
    return this.request(
      API_CONFIG.TEAMS_CHAT,
      API_CONFIG.ENDPOINTS.TEAMS.HEALTH
    );
  }

  async startTeamsExtraction(
    connectionId: string,
    config: TeamsConfig
  ): Promise<BaseApiResponse & { connection_id: string; status: string; user_count: number }> {
    return this.request(
      API_CONFIG.TEAMS_CHAT,
      `${API_CONFIG.ENDPOINTS.TEAMS.START}/${connectionId}`,
      {
        method: 'POST',
        body: JSON.stringify(config),
      }
    );
  }

  async getTeamsStatus(connectionId: string): Promise<TeamsStatus> {
    return this.request(
      API_CONFIG.TEAMS_CHAT,
      `${API_CONFIG.ENDPOINTS.TEAMS.STATUS}/${connectionId}`
    );
  }

  async getTeamsMessages(
    connectionId: string,
    params?: PaginationParams
  ): Promise<{
    connection_id: string;
    page: number;
    page_size: number;
    total_count: number;
    total_pages: number;
    messages: ChatMessage[];
  }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
    
    const endpoint = API_CONFIG.ENDPOINTS.TEAMS.MESSAGES
      .replace('{connection_id}', connectionId) +
      (queryParams.toString() ? `?${queryParams}` : '');
    
    return this.request(API_CONFIG.TEAMS_CHAT, endpoint);
  }

  async getTeamsPersonalMessages(
    connectionId: string,
    params?: PaginationParams & { user_upn?: string }
  ): Promise<{
    connection_id: string;
    page: number;
    page_size: number;
    total_count: number;
    total_pages: number;
    user_upn?: string;
    messages: PersonalChatMessage[];
  }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params?.user_upn) queryParams.append('user_upn', params.user_upn);
    
    const endpoint = API_CONFIG.ENDPOINTS.TEAMS.PERSONAL_MESSAGES
      .replace('{connection_id}', connectionId) +
      (queryParams.toString() ? `?${queryParams}` : '');
    
    return this.request(API_CONFIG.TEAMS_CHAT, endpoint);
  }

  async getTeamsAndChannels(connectionId: string): Promise<{
    connection_id: string;
    total_teams: number;
    teams: Team[];
  }> {
    const endpoint = API_CONFIG.ENDPOINTS.TEAMS.TEAMS_CHANNELS
      .replace('{connection_id}', connectionId);
    
    return this.request(API_CONFIG.TEAMS_CHAT, endpoint);
  }

  // ===========================================
  // OneDrive Activity Service
  // ===========================================

  async getOneDriveHealth(): Promise<ServiceHealth> {
    return this.request(
      API_CONFIG.ONEDRIVE_ACTIVITY,
      API_CONFIG.ENDPOINTS.ONEDRIVE.HEALTH
    );
  }

  async checkOneDriveScan(connectionId: string): Promise<OneDriveStatus & { exists: boolean }> {
    return this.request(
      API_CONFIG.ONEDRIVE_ACTIVITY,
      `${API_CONFIG.ENDPOINTS.ONEDRIVE.CHECK}/${connectionId}`
    );
  }

  async startOneDriveExtraction(config: OneDriveConfig): Promise<{
    message: string;
    connection_id: string;
    status: string;
    user_count: number;
    endpoints: {
      check_status: string;
      get_activities: string;
      get_results: string;
    };
  }> {
    return this.request(
      API_CONFIG.ONEDRIVE_ACTIVITY,
      API_CONFIG.ENDPOINTS.ONEDRIVE.START,
      {
        method: 'POST',
        body: JSON.stringify(config),
      }
    );
  }

  async resumeOneDriveScan(connectionId: string): Promise<{
    message: string;
    connection_id: string;
    status: string;
    previous_status: string;
    user_count: number;
  }> {
    return this.request(
      API_CONFIG.ONEDRIVE_ACTIVITY,
      `${API_CONFIG.ENDPOINTS.ONEDRIVE.RESUME}/${connectionId}`,
      { method: 'POST' }
    );
  }

  async restartOneDriveScan(
    connectionId: string,
    config: OneDriveConfig
  ): Promise<{
    message: string;
    connection_id: string;
    status: string;
    previous_status: string;
    user_count: number;
  }> {
    return this.request(
      API_CONFIG.ONEDRIVE_ACTIVITY,
      `${API_CONFIG.ENDPOINTS.ONEDRIVE.RESTART}/${connectionId}`,
      {
        method: 'POST',
        body: JSON.stringify(config),
      }
    );
  }

  async getOneDriveStatus(connectionId: string): Promise<OneDriveStatus> {
    return this.request(
      API_CONFIG.ONEDRIVE_ACTIVITY,
      `${API_CONFIG.ENDPOINTS.ONEDRIVE.STATUS}/${connectionId}`
    );
  }

  async getOneDriveResult(connectionId: string): Promise<{
    connection_id: string;
    document_count: number;
    documents: Document[];
  }> {
    return this.request(
      API_CONFIG.ONEDRIVE_ACTIVITY,
      `${API_CONFIG.ENDPOINTS.ONEDRIVE.RESULT}/${connectionId}`
    );
  }

  async getOneDriveActivities(connectionId: string): Promise<{
    connection_id: string;
    activity_count: number;
    activities: Activity[];
  }> {
    const endpoint = API_CONFIG.ENDPOINTS.ONEDRIVE.ACTIVITIES
      .replace('{connection_id}', connectionId);
    
    return this.request(API_CONFIG.ONEDRIVE_ACTIVITY, endpoint);
  }

  async deleteOneDriveScan(connectionId: string): Promise<{
    message: string;
    removed_scan: {
      connection_id: string;
      previous_status: string;
      had_results: boolean;
    };
  }> {
    return this.request(
      API_CONFIG.ONEDRIVE_ACTIVITY,
      `${API_CONFIG.ENDPOINTS.ONEDRIVE.DELETE}/${connectionId}`,
      { method: 'DELETE' }
    );
  }

  // ===========================================
  // Outlook Mail Service
  // ===========================================

  async startOutlookBatchExtraction(
    batchTaskId: string,
    config: OutlookConfig
  ): Promise<{
    batch_task_id: string;
    started_at: string;
    success: boolean;
    message: string;
  }> {
    return this.request(
      API_CONFIG.OUTLOOK_MAIL,
      API_CONFIG.ENDPOINTS.OUTLOOK.START,
      {
        method: 'POST',
        body: JSON.stringify({
          batch_task_id: batchTaskId,
          ...config,
        }),
      }
    );
  }

  async getOutlookBatchStatus(batchTaskId: string): Promise<OutlookBatchStatus> {
    return this.request(
      API_CONFIG.OUTLOOK_MAIL,
      `${API_CONFIG.ENDPOINTS.OUTLOOK.STATUS}/${batchTaskId}`
    );
  }

  async getOutlookEmails(
    userUpn: string,
    params?: {
      limit?: number;
      offset?: number;
      folder_name?: 'inbox' | 'sent' | 'both';
      is_read?: boolean;
    }
  ): Promise<EmailMessage[]> {
    const queryParams = new URLSearchParams({ user_upn: userUpn });
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.folder_name) queryParams.append('folder_name', params.folder_name);
    if (params?.is_read !== undefined) queryParams.append('is_read', params.is_read.toString());
    
    return this.request(
      API_CONFIG.OUTLOOK_MAIL,
      `${API_CONFIG.ENDPOINTS.OUTLOOK.RESULT}?${queryParams}`
    );
  }

  // ===========================================
  // SharePoint Service
  // ===========================================

  async getSharePointHealth(): Promise<ServiceHealth> {
    return this.request(
      API_CONFIG.SHAREPOINT,
      API_CONFIG.ENDPOINTS.SHAREPOINT.HEALTH
    );
  }

  async startSharePointExtraction(
    connectionId: string,
    config: SharePointConfig
  ): Promise<{
    connection_id: string;
    status: string;
    message: string;
  }> {
    return this.request(
      API_CONFIG.SHAREPOINT,
      API_CONFIG.ENDPOINTS.SHAREPOINT.START,
      {
        method: 'POST',
        body: JSON.stringify({
          connection_id: connectionId,
          config,
        }),
      }
    );
  }

  async getSharePointStatus(connectionId: string): Promise<SharePointStatus> {
    return this.request(
      API_CONFIG.SHAREPOINT,
      `${API_CONFIG.ENDPOINTS.SHAREPOINT.STATUS}/${connectionId}`
    );
  }

  async getSharePointResult(connectionId: string): Promise<{
    connectionId: string;
    extracted_data: SharePointItem[];
  }> {
    return this.request(
      API_CONFIG.SHAREPOINT,
      `${API_CONFIG.ENDPOINTS.SHAREPOINT.RESULT}/${connectionId}`
    );
  }

  async deleteSharePointScan(connectionId: string): Promise<void> {
    return this.request(
      API_CONFIG.SHAREPOINT,
      `${API_CONFIG.ENDPOINTS.SHAREPOINT.DELETE}/${connectionId}`,
      { method: 'DELETE' }
    );
  }

  // ===========================================
  // Health Check for All Services
  // ===========================================

  async getAllServicesHealth(): Promise<Record<string, ServiceHealth>> {
    const services = [
      { name: 'user', method: () => this.getUserExtractionHealth() },
      { name: 'calendar', method: () => this.getCalendarHealth() },
      { name: 'teams', method: () => this.getTeamsHealth() },
      { name: 'onedrive', method: () => this.getOneDriveHealth() },
      { name: 'sharepoint', method: () => this.getSharePointHealth() },
    ];

    const results: Record<string, ServiceHealth> = {};

    await Promise.allSettled(
      services.map(async (service) => {
        try {
          results[service.name] = await service.method();
        } catch (error) {
          results[service.name] = {
            status: 'unhealthy',
            service: service.name,
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      })
    );

    return results;
  }
}

export const apiClient = new ApiClient();