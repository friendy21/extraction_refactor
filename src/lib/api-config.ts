// src/lib/api-config.ts
export const API_CONFIG = {
    // Microsoft Services Base URLs
    USER_EXTRACTION: process.env.NEXT_PUBLIC_USER_EXTRACTION_URL || 'http://localhost:3005',
    CALENDAR_ACTIVITY: process.env.NEXT_PUBLIC_CALENDAR_ACTIVITY_URL || 'http://localhost:3006',
    TEAMS_CHAT: process.env.NEXT_PUBLIC_TEAMS_CHAT_URL || 'http://localhost:3007',
    ONEDRIVE_ACTIVITY: process.env.NEXT_PUBLIC_ONEDRIVE_ACTIVITY_URL || 'http://localhost:3008',
    OUTLOOK_MAIL: process.env.NEXT_PUBLIC_OUTLOOK_MAIL_URL || 'http://localhost:3009',
    SHAREPOINT: process.env.NEXT_PUBLIC_SHAREPOINT_URL || 'http://localhost:3010',
    
    // API Endpoints
    ENDPOINTS: {
      // User Extraction Service
      USER: {
        HEALTH: '/health',
        START: '/api/extract/start',
        STATUS: '/api/extract/status',
        RESULT: '/api/extract/result',
        DELETE: '/api/extract/delete',
        LIST: '/api/extractions',
        STATISTICS: '/api/statistics',
        CLEANUP: '/api/cleanup'
      },
      
      // Calendar Activity Service
      CALENDAR: {
        START: '/scan/start',
        STATUS: '/scan/status',
        RESULT: '/scan/result',
        HEALTH: '/health'
      },
      
      // Teams Chat Service
      TEAMS: {
        START: '/api/scan/start',
        STATUS: '/api/scan/status',
        MESSAGES: '/api/scan/result/{connection_id}/messages',
        PERSONAL_MESSAGES: '/api/scan/result/{connection_id}/personal-messages',
        TEAMS_CHANNELS: '/api/scan/result/{connection_id}/teams',
        HEALTH: '/api/scan/health'
      },
      
      // OneDrive Activity Service
      ONEDRIVE: {
        CHECK: '/api/scan/check',
        START: '/api/scan/start',
        RESUME: '/api/scan/resume',
        RESTART: '/api/scan/restart',
        STATUS: '/api/scan/status',
        RESULT: '/api/scan/result',
        ACTIVITIES: '/api/scan/result/{connection_id}/activities',
        DELETE: '/api/scan',
        LIST: '/api/scan/list',
        HEALTH: '/api/health'
      },
      
      // Outlook Mail Service
      OUTLOOK: {
        START: '/start_batch_extraction',
        STATUS: '/batch_status',
        RESULT: '/get_emails',
        HEALTH: '/health'
      },
      
      // SharePoint Service
      SHAREPOINT: {
        START: '/api/scan/start',
        STATUS: '/api/scan/status',
        RESULT: '/api/scan/result',
        DELETE: '/api/scan/remove',
        HEALTH: '/healthz'
      }
    }
  };
  
  // src/types/api.ts
  export interface BaseApiResponse {
    success?: boolean;
    message?: string;
    error?: string;
    timestamp?: string;
  }
  
  export interface PaginationParams {
    page?: number;
    page_size?: number;
  }
  
  export interface PaginatedResponse<T> {
    page: number;
    page_size: number;
    total_count: number;
    total_pages: number;
    items?: T[];
    messages?: T[];
    data?: T[];
  }
  
  // Microsoft User Extraction Types
  export interface UserExtractionConfig {
    tenant_id: string;
    client_id: string;
    client_secret: string;
  }
  
  export interface UserExtractionStatus {
    status: 'not_found' | 'in_progress' | 'completed' | 'failed';
    started_at?: string;
    completed_at?: string;
    error?: string;
    connection_id: string;
  }
  
  export interface ExtractedUser {
    id: string;
    connection_id: string;
    upn: string;
    display_name: string;
    given_name?: string;
    surname?: string;
    job_title?: string;
    email?: string;
    business_phones?: string[];
    mobile_phone?: string;
    office_location?: string;
    preferred_language?: string;
    date_extracted: string;
  }
  
  export interface UserExtractionResult {
    connection_id: string;
    total_users: number;
    users: ExtractedUser[];
  }
  
  // Calendar Activity Types
  export interface CalendarConfig {
    tenant_id: string;
    client_id: string;
    client_secret: string;
    user_upns: string[];
  }
  
  export interface CalendarEvent {
    id: string;
    event_id: string;
    tenant_id: string;
    user_upn: string;
    organizer_name?: string;
    organizer_email?: string;
    title?: string;
    description?: string;
    location?: string;
    is_virtual: boolean;
    start_time?: string;
    end_time?: string;
    organizer_response?: string;
    allow_new_time_proposals: boolean;
    attendees?: Array<{
      name?: string;
      email?: string;
      type?: string;
      response?: string;
      proposed_time?: string;
    }>;
    created_at: string;
    updated_at: string;
  }
  
  export interface CalendarResult extends PaginatedResponse<CalendarEvent> {
    connection_id: string;
    status: string;
    started_at?: string;
    completed_at?: string;
    error_message?: string;
  }
  
  // Teams Chat Types
  export interface TeamsConfig {
    tenant_id: string;
    client_id: string;
    client_secret: string;
    user_upns: string[];
  }
  
  export interface ChatMessage {
    id: string;
    chat_id: string;
    from_user_email: string;
    from_display_name: string;
    platform: string;
    channel?: string;
    thread_id?: string;
    message: string;
    mentioned_users?: string;
    timestamp: string;
    date_extracted: string;
    channel_info?: {
      channel_id: string;
      display_name: string;
      description?: string;
      channel_type: string;
    };
  }
  
  export interface PersonalChatMessage {
    id: string;
    user_upn: string;
    chat_id: string;
    from_user_email: string;
    from_display_name: string;
    message: string;
    mentioned_users?: string;
    timestamp: string;
    date_extracted: string;
    chat_type: string;
    recipients?: string[];
  }
  
  export interface Team {
    id: string;
    team_id: string;
    display_name: string;
    description?: string;
    channels?: Channel[];
  }
  
  export interface Channel {
    id: string;
    channel_id: string;
    display_name: string;
    description?: string;
    channel_type: string;
  }
  
  export interface TeamsStatus {
    extraction_status: {
      connection_id: string;
      status: string;
      error?: string;
      started_at?: string;
      completed_at?: string;
      user_upns: string[];
    };
    chat_stats: Array<{
      id: string;
      user_upn: string;
      total_teams: number;
      total_channels: number;
      total_personal_messages: number;
      team_status: string;
      channel_status: string;
      personal_message_status: string;
      started_at?: string;
      completed_at?: string;
    }>;
    channel_stats: Array<{
      id: string;
      team_id: string;
      channel_id: string;
      total_channel_messages: number;
      extraction_status: string;
      started_at?: string;
      completed_at?: string;
    }>;
  }
  
  // OneDrive Activity Types
  export interface OneDriveConfig {
    tenant_id: string;
    client_id: string;
    client_secret: string;
    user_upns: string[];
  }
  
  export interface Document {
    document_id: number;
    user_upn: string;
    file_id: string;
    file_name: string;
    file_path: string;
    is_folder: boolean;
    file_type?: string;
    file_size_bytes?: number;
    last_modified?: string;
    last_modified_by?: string;
    last_modified_by_email?: string;
    activities: Activity[];
  }
  
  export interface Activity {
    activity_id: string;
    action_type: string;
    performed_by: string;
    user_principal_name: string;
    email: string;
    timestamp: string;
    metadata?: any;
  }
  
  export interface OneDriveStatus {
    connection_id: string;
    status: string;
    started_at?: string;
    completed_at?: string;
    progress: number;
    error?: string;
    user_count: number;
    exists?: boolean;
    can_restart?: boolean;
    can_resume?: boolean;
    is_active?: boolean;
  }
  
  // Outlook Mail Types
  export interface OutlookConfig {
    tenant_id: string;
    outlook_client_id: string;
    outlook_client_secret: string;
    user_upns: string[];
  }
  
  export interface EmailMessage {
    id: string;
    user_upn: string;
    subject?: string;
    body?: string;
    body_preview?: string;
    importance?: string;
    conversation_id?: string;
    created_date_time?: string;
    received_date_time?: string;
    sent_date_time?: string;
    has_attachments: boolean;
    is_draft: boolean;
    is_read: boolean;
    parent_folder_id?: string;
    folder_name: string;
    recipients: EmailRecipient[];
    attachments: EmailAttachment[];
  }
  
  export interface EmailRecipient {
    recipient_id: number;
    email_id: string;
    recipient_type: 'from' | 'to' | 'cc' | 'bcc';
    email_address: string;
    name?: string;
  }
  
  export interface EmailAttachment {
    attachment_id: number;
    email_id: string;
    attachment_name: string;
    content_type?: string;
    size?: number;
    content_url?: string;
  }
  
  export interface OutlookBatchStatus {
    batch_task_id: string;
    total_users: number;
    started_at: string;
    completed_at?: string;
    status: string;
    error?: string;
    users_passed: number;
    users_failed: number;
    user_upns: string[];
  }
  
  // SharePoint Types
  export interface SharePointConfig {
    tenant_id: string;
    client_id: string;
    client_secret: string;
  }
  
  export interface SharePointItem {
    item_id: string;
    name: string;
    type: 'file' | 'folder';
    is_folder: boolean;
    size?: number;
    web_url?: string;
    download_url?: string;
    parent_item_id?: string;
    drive_id: string;
    site_id?: string;
    last_modified_datetime?: string;
    last_modified_by_user_id?: string;
    last_modified_by_user_display_name?: string;
  }
  
  export interface SharePointStatus {
    connectionId: string;
    status: string;
    started_at?: string;
    completed_at?: string;
    error?: string;
  }
  
  // Generic Connection Types
  export interface ConnectionConfig {
    microsoft?: {
      user?: UserExtractionConfig;
      calendar?: CalendarConfig;
      teams?: TeamsConfig;
      onedrive?: OneDriveConfig;
      outlook?: OutlookConfig;
      sharepoint?: SharePointConfig;
    };
  }
  
  export interface ExtractionStatus {
    connection_id: string;
    service: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'not_found';
    started_at?: string;
    completed_at?: string;
    error?: string;
    progress?: number;
    data_count?: number;
  }
  
  export interface ServiceHealth {
    status: 'healthy' | 'unhealthy';
    service: string;
    timestamp: string;
    version?: string;
    checks?: Record<string, any>;
  }