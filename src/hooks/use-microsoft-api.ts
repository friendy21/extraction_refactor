// src/hooks/use-microsoft-api.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type {
  UserExtractionConfig,
  CalendarConfig,
  TeamsConfig,
  OneDriveConfig,
  OutlookConfig,
  SharePointConfig,
  PaginationParams
} from '@/types/api';

// ===========================================
// Query Keys
// ===========================================
export const QUERY_KEYS = {
  // Health checks
  HEALTH: ['health'],
  USER_HEALTH: ['health', 'user'],
  CALENDAR_HEALTH: ['health', 'calendar'],
  TEAMS_HEALTH: ['health', 'teams'],
  ONEDRIVE_HEALTH: ['health', 'onedrive'],
  SHAREPOINT_HEALTH: ['health', 'sharepoint'],
  ALL_HEALTH: ['health', 'all'],

  // User Extraction
  USER_EXTRACTIONS: ['user-extractions'],
  USER_EXTRACTION_STATUS: (id: string) => ['user-extraction-status', id],
  USER_EXTRACTION_RESULT: (id: string) => ['user-extraction-result', id],
  USER_EXTRACTION_STATS: ['user-extraction-stats'],

  // Calendar Activity
  CALENDAR_STATUS: (id: string) => ['calendar-status', id],
  CALENDAR_RESULT: (id: string) => ['calendar-result', id],

  // Teams Chat
  TEAMS_STATUS: (id: string) => ['teams-status', id],
  TEAMS_MESSAGES: (id: string) => ['teams-messages', id],
  TEAMS_PERSONAL_MESSAGES: (id: string) => ['teams-personal-messages', id],
  TEAMS_CHANNELS: (id: string) => ['teams-channels', id],

  // OneDrive Activity
  ONEDRIVE_STATUS: (id: string) => ['onedrive-status', id],
  ONEDRIVE_RESULT: (id: string) => ['onedrive-result', id],
  ONEDRIVE_ACTIVITIES: (id: string) => ['onedrive-activities', id],

  // Outlook Mail
  OUTLOOK_BATCH_STATUS: (id: string) => ['outlook-batch-status', id],
  OUTLOOK_EMAILS: (userUpn: string) => ['outlook-emails', userUpn],

  // SharePoint
  SHAREPOINT_STATUS: (id: string) => ['sharepoint-status', id],
  SHAREPOINT_RESULT: (id: string) => ['sharepoint-result', id],
} as const;

// ===========================================
// Health Check Hooks
// ===========================================

export function useAllServicesHealth() {
  return useQuery({
    queryKey: QUERY_KEYS.ALL_HEALTH,
    queryFn: () => apiClient.getAllServicesHealth(),
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // 1 minute
  });
}

export function useServiceHealth(service: 'user' | 'calendar' | 'teams' | 'onedrive' | 'sharepoint') {
  return useQuery({
    queryKey: [QUERY_KEYS.HEALTH, service],
    queryFn: () => {
      switch (service) {
        case 'user':
          return apiClient.getUserExtractionHealth();
        case 'calendar':
          return apiClient.getCalendarHealth();
        case 'teams':
          return apiClient.getTeamsHealth();
        case 'onedrive':
          return apiClient.getOneDriveHealth();
        case 'sharepoint':
          return apiClient.getSharePointHealth();
        default:
          throw new Error(`Unknown service: ${service}`);
      }
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

// ===========================================
// User Extraction Hooks
// ===========================================

export function useStartUserExtraction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ connectionId, config }: { connectionId: string; config: UserExtractionConfig }) =>
      apiClient.startUserExtraction(connectionId, config),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_EXTRACTIONS });
      queryClient.setQueryData(
        QUERY_KEYS.USER_EXTRACTION_STATUS(data.connection_id),
        { status: 'in_progress', connection_id: data.connection_id }
      );
    },
  });
}

export function useUserExtractionStatus(connectionId: string, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.USER_EXTRACTION_STATUS(connectionId),
    queryFn: () => apiClient.getUserExtractionStatus(connectionId),
    enabled: enabled && !!connectionId,
    refetchInterval: (data) => {
      // Stop polling when completed or failed
      return data?.status === 'in_progress' ? 3000 : false;
    },
  });
}

export function useUserExtractionResult(connectionId: string, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.USER_EXTRACTION_RESULT(connectionId),
    queryFn: () => apiClient.getUserExtractionResult(connectionId),
    enabled: enabled && !!connectionId,
  });
}

export function useUserExtractions() {
  return useQuery({
    queryKey: QUERY_KEYS.USER_EXTRACTIONS,
    queryFn: () => apiClient.listUserExtractions(),
  });
}

export function useUserExtractionStatistics() {
  return useQuery({
    queryKey: QUERY_KEYS.USER_EXTRACTION_STATS,
    queryFn: () => apiClient.getUserExtractionStatistics(),
  });
}

export function useDeleteUserExtraction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (connectionId: string) => apiClient.deleteUserExtraction(connectionId),
    onSuccess: (_, connectionId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_EXTRACTIONS });
      queryClient.removeQueries({ queryKey: QUERY_KEYS.USER_EXTRACTION_STATUS(connectionId) });
      queryClient.removeQueries({ queryKey: QUERY_KEYS.USER_EXTRACTION_RESULT(connectionId) });
    },
  });
}

export function useCleanupUserExtractions() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (daysOld: number = 30) => apiClient.cleanupUserExtractions(daysOld),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_EXTRACTIONS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_EXTRACTION_STATS });
    },
  });
}

// ===========================================
// Calendar Activity Hooks
// ===========================================

export function useStartCalendarExtraction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ connectionId, config }: { connectionId: string; config: CalendarConfig }) =>
      apiClient.startCalendarExtraction(connectionId, config),
    onSuccess: (data) => {
      queryClient.setQueryData(
        QUERY_KEYS.CALENDAR_STATUS(data.connection_id),
        { status: 'in_progress', connection_id: data.connection_id }
      );
    },
  });
}

export function useCalendarStatus(connectionId: string, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.CALENDAR_STATUS(connectionId),
    queryFn: () => apiClient.getCalendarStatus(connectionId),
    enabled: enabled && !!connectionId,
    refetchInterval: (data) => {
      return data?.status === 'running' ? 3000 : false;
    },
  });
}

export function useCalendarResult(connectionId: string, params?: PaginationParams, enabled = true) {
  return useQuery({
    queryKey: [...QUERY_KEYS.CALENDAR_RESULT(connectionId), params],
    queryFn: () => apiClient.getCalendarResult(connectionId, params),
    enabled: enabled && !!connectionId,
  });
}

// ===========================================
// Teams Chat Hooks
// ===========================================

export function useStartTeamsExtraction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ connectionId, config }: { connectionId: string; config: TeamsConfig }) =>
      apiClient.startTeamsExtraction(connectionId, config),
    onSuccess: (data) => {
      queryClient.setQueryData(
        QUERY_KEYS.TEAMS_STATUS(data.connection_id),
        { 
          extraction_status: { 
            status: 'in_progress', 
            connection_id: data.connection_id 
          },
          chat_stats: [],
          channel_stats: []
        }
      );
    },
  });
}

export function useTeamsStatus(connectionId: string, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.TEAMS_STATUS(connectionId),
    queryFn: () => apiClient.getTeamsStatus(connectionId),
    enabled: enabled && !!connectionId,
    refetchInterval: (data) => {
      return data?.extraction_status?.status === 'in_progress' ? 3000 : false;
    },
  });
}

export function useTeamsMessages(connectionId: string, params?: PaginationParams, enabled = true) {
  return useQuery({
    queryKey: [...QUERY_KEYS.TEAMS_MESSAGES(connectionId), params],
    queryFn: () => apiClient.getTeamsMessages(connectionId, params),
    enabled: enabled && !!connectionId,
  });
}

export function useTeamsPersonalMessages(
  connectionId: string,
  params?: PaginationParams & { user_upn?: string },
  enabled = true
) {
  return useQuery({
    queryKey: [...QUERY_KEYS.TEAMS_PERSONAL_MESSAGES(connectionId), params],
    queryFn: () => apiClient.getTeamsPersonalMessages(connectionId, params),
    enabled: enabled && !!connectionId,
  });
}

export function useTeamsAndChannels(connectionId: string, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.TEAMS_CHANNELS(connectionId),
    queryFn: () => apiClient.getTeamsAndChannels(connectionId),
    enabled: enabled && !!connectionId,
  });
}

// ===========================================
// OneDrive Activity Hooks
// ===========================================

export function useCheckOneDriveScan(connectionId: string, enabled = true) {
  return useQuery({
    queryKey: ['onedrive-check', connectionId],
    queryFn: () => apiClient.checkOneDriveScan(connectionId),
    enabled: enabled && !!connectionId,
  });
}

export function useStartOneDriveExtraction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (config: OneDriveConfig) => apiClient.startOneDriveExtraction(config),
    onSuccess: (data) => {
      queryClient.setQueryData(
        QUERY_KEYS.ONEDRIVE_STATUS(data.connection_id),
        { status: 'in_progress', connection_id: data.connection_id }
      );
    },
  });
}

export function useResumeOneDriveScan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (connectionId: string) => apiClient.resumeOneDriveScan(connectionId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.ONEDRIVE_STATUS(data.connection_id) 
      });
    },
  });
}

export function useRestartOneDriveScan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ connectionId, config }: { connectionId: string; config: OneDriveConfig }) =>
      apiClient.restartOneDriveScan(connectionId, config),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.ONEDRIVE_STATUS(data.connection_id) 
      });
      queryClient.removeQueries({ 
        queryKey: QUERY_KEYS.ONEDRIVE_RESULT(data.connection_id) 
      });
    },
  });
}

export function useOneDriveStatus(connectionId: string, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.ONEDRIVE_STATUS(connectionId),
    queryFn: () => apiClient.getOneDriveStatus(connectionId),
    enabled: enabled && !!connectionId,
    refetchInterval: (data) => {
      return data?.status === 'in_progress' ? 3000 : false;
    },
  });
}

export function useOneDriveResult(connectionId: string, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.ONEDRIVE_RESULT(connectionId),
    queryFn: () => apiClient.getOneDriveResult(connectionId),
    enabled: enabled && !!connectionId,
  });
}

export function useOneDriveActivities(connectionId: string, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.ONEDRIVE_ACTIVITIES(connectionId),
    queryFn: () => apiClient.getOneDriveActivities(connectionId),
    enabled: enabled && !!connectionId,
  });
}

export function useDeleteOneDriveScan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (connectionId: string) => apiClient.deleteOneDriveScan(connectionId),
    onSuccess: (_, connectionId) => {
      queryClient.removeQueries({ queryKey: QUERY_KEYS.ONEDRIVE_STATUS(connectionId) });
      queryClient.removeQueries({ queryKey: QUERY_KEYS.ONEDRIVE_RESULT(connectionId) });
      queryClient.removeQueries({ queryKey: QUERY_KEYS.ONEDRIVE_ACTIVITIES(connectionId) });
    },
  });
}

// ===========================================
// Outlook Mail Hooks
// ===========================================

export function useStartOutlookBatchExtraction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ batchTaskId, config }: { batchTaskId: string; config: OutlookConfig }) =>
      apiClient.startOutlookBatchExtraction(batchTaskId, config),
    onSuccess: (data) => {
      queryClient.setQueryData(
        QUERY_KEYS.OUTLOOK_BATCH_STATUS(data.batch_task_id),
        { status: 'in_progress', batch_task_id: data.batch_task_id }
      );
    },
  });
}

export function useOutlookBatchStatus(batchTaskId: string, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.OUTLOOK_BATCH_STATUS(batchTaskId),
    queryFn: () => apiClient.getOutlookBatchStatus(batchTaskId),
    enabled: enabled && !!batchTaskId,
    refetchInterval: (data) => {
      return data?.status === 'in_progress' ? 3000 : false;
    },
  });
}

export function useOutlookEmails(
  userUpn: string,
  params?: {
    limit?: number;
    offset?: number;
    folder_name?: 'inbox' | 'sent' | 'both';
    is_read?: boolean;
  },
  enabled = true
) {
  return useQuery({
    queryKey: [...QUERY_KEYS.OUTLOOK_EMAILS(userUpn), params],
    queryFn: () => apiClient.getOutlookEmails(userUpn, params),
    enabled: enabled && !!userUpn,
  });
}

// ===========================================
// SharePoint Hooks
// ===========================================

export function useStartSharePointExtraction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ connectionId, config }: { connectionId: string; config: SharePointConfig }) =>
      apiClient.startSharePointExtraction(connectionId, config),
    onSuccess: (data) => {
      queryClient.setQueryData(
        QUERY_KEYS.SHAREPOINT_STATUS(data.connection_id),
        { status: 'in_progress', connectionId: data.connection_id }
      );
    },
  });
}

export function useSharePointStatus(connectionId: string, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.SHAREPOINT_STATUS(connectionId),
    queryFn: () => apiClient.getSharePointStatus(connectionId),
    enabled: enabled && !!connectionId,
    refetchInterval: (data) => {
      return data?.status === 'in_progress' ? 3000 : false;
    },
  });
}

export function useSharePointResult(connectionId: string, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.SHAREPOINT_RESULT(connectionId),
    queryFn: () => apiClient.getSharePointResult(connectionId),
    enabled: enabled && !!connectionId,
  });
}

export function useDeleteSharePointScan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (connectionId: string) => apiClient.deleteSharePointScan(connectionId),
    onSuccess: (_, connectionId) => {
      queryClient.removeQueries({ queryKey: QUERY_KEYS.SHAREPOINT_STATUS(connectionId) });
      queryClient.removeQueries({ queryKey: QUERY_KEYS.SHAREPOINT_RESULT(connectionId) });
    },
  });
}