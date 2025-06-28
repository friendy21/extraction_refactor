// src/hooks/api-hooks.ts
import { 
  useMutation, 
  useQuery, 
  useQueryClient, 
  UseQueryOptions,
  UseMutationOptions 
} from '@tanstack/react-query';
import { ApiServices } from '@/services/api-services';
import type { 
  User, 
  LoginCredentials, 
  RegisterData, 
  Organization, 
  Employee, 
  DataQualityIssue, 
  DashboardStats,
  ApiResponse 
} from '@/types';

/**
 * Query Keys for consistent cache management
 */
export const QUERY_KEYS = {
  // Authentication
  AUTH: {
    ME: ['auth', 'me'] as const,
    SESSIONS: ['auth', 'sessions'] as const,
  },
  
  // Organization
  ORGANIZATION: {
    LIST: ['organization', 'list'] as const,
    DETAIL: (id: string) => ['organization', 'detail', id] as const,
    ACCOUNTS: ['organization', 'accounts'] as const,
    USERS: ['organization', 'users'] as const,
  },

  // Data Sources
  DATA_SOURCES: {
    LIST: ['dataSources', 'list'] as const,
    DETAIL: (id: string) => ['dataSources', 'detail', id] as const,
    EXTRACTIONS: ['dataSources', 'extractions'] as const,
    EXTRACTION_STATUS: (id: string) => ['dataSources', 'extraction', id, 'status'] as const,
  },

  // Employees
  EMPLOYEES: {
    LIST: ['employees', 'list'] as const,
    DETAIL: (id: string) => ['employees', 'detail', id] as const,
    VERIFICATION: (id: string) => ['employees', id, 'verification'] as const,
  },

  // Departments
  DEPARTMENTS: {
    LIST: ['departments', 'list'] as const,
    DETAIL: (id: string) => ['departments', 'detail', id] as const,
    HIERARCHY: (id: string) => ['departments', id, 'hierarchy'] as const,
  },

  // Communications
  COMMUNICATIONS: {
    EMAILS: ['communications', 'emails'] as const,
    EMAIL_THREADS: (threadId: string) => ['communications', 'emails', 'threads', threadId] as const,
    TEAMS_DIRECT: ['communications', 'teams', 'direct'] as const,
    TEAMS_GROUP: ['communications', 'teams', 'group'] as const,
    TEAMS_CHANNELS: ['communications', 'teams', 'channels'] as const,
  },

  // Files
  FILES: {
    LIST: ['files', 'list'] as const,
    ONEDRIVE: ['files', 'onedrive'] as const,
    DROPBOX: ['files', 'dropbox'] as const,
    GOOGLE_DRIVE: ['files', 'google-drive'] as const,
    ACTIVITIES: (fileId: string) => ['files', fileId, 'activities'] as const,
    PERMISSIONS: (fileId: string) => ['files', fileId, 'permissions'] as const,
  },

  // Meetings
  MEETINGS: {
    LIST: ['meetings', 'list'] as const,
    DETAIL: (id: string) => ['meetings', 'detail', id] as const,
    CALENDAR: ['meetings', 'calendar'] as const,
    PARTICIPANTS: (id: string) => ['meetings', id, 'participants'] as const,
    ANALYTICS: (id: string) => ['meetings', id, 'analytics'] as const,
  },

  // Analytics
  ANALYTICS: {
    GLYNAC_SCORE: ['analytics', 'glynac-score'] as const,
    TRENDS: ['analytics', 'trends'] as const,
    COLLABORATION: ['analytics', 'collaboration'] as const,
    PRODUCTIVITY: ['analytics', 'productivity'] as const,
    COMMUNICATION: ['analytics', 'communication'] as const,
  },

  // Dashboard
  DASHBOARD: {
    STATS: ['dashboard', 'stats'] as const,
  },
} as const;

// ===================================
// AUTHENTICATION HOOKS
// ===================================

/**
 * Login mutation hook
 */
export function useLogin(options?: UseMutationOptions<ApiResponse<{ user: User; token: string }>, Error, LoginCredentials>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ApiServices.Auth.login,
    onSuccess: (data) => {
      // Update user cache
      if (data.success && data.data) {
        queryClient.setQueryData(QUERY_KEYS.AUTH.ME, data.data.user);
      }
    },
    ...options,
  });
}

/**
 * Register mutation hook
 */
export function useRegister(options?: UseMutationOptions<ApiResponse<{ user: User; token: string }>, Error, RegisterData>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ApiServices.Auth.register,
    onSuccess: (data) => {
      // Update user cache
      if (data.success && data.data) {
        queryClient.setQueryData(QUERY_KEYS.AUTH.ME, data.data.user);
      }
    },
    ...options,
  });
}

/**
 * Logout mutation hook
 */
export function useLogout(options?: UseMutationOptions<ApiResponse<void>, Error, void>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ApiServices.Auth.logout,
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
    },
    onError: () => {
      // Even if logout fails, clear cache
      queryClient.clear();
    },
    ...options,
  });
}

/**
 * Get current user hook
 */
export function useGetMe(options?: UseQueryOptions<ApiResponse<User>, Error>) {
  return useQuery({
    queryKey: QUERY_KEYS.AUTH.ME,
    queryFn: ApiServices.Auth.getMe,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Refresh token mutation hook
 */
export function useRefreshToken(options?: UseMutationOptions<ApiResponse<{ token: string }>, Error, void>) {
  return useMutation({
    mutationFn: ApiServices.Auth.refreshToken,
    ...options,
  });
}

// ===================================
// ORGANIZATION HOOKS
// ===================================

/**
 * Create organization mutation hook
 */
export function useCreateOrganization(options?: UseMutationOptions<ApiResponse<Organization>, Error, Organization>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ApiServices.Organization.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORGANIZATION.LIST });
    },
    ...options,
  });
}

/**
 * Get organizations query hook
 */
export function useGetOrganizations(options?: UseQueryOptions<ApiResponse<Organization[]>, Error>) {
  return useQuery({
    queryKey: QUERY_KEYS.ORGANIZATION.LIST,
    queryFn: ApiServices.Organization.getOrganizations,
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}

/**
 * Get accounts query hook
 */
export function useGetAccounts(options?: UseQueryOptions<ApiResponse<any[]>, Error>) {
  return useQuery({
    queryKey: QUERY_KEYS.ORGANIZATION.ACCOUNTS,
    queryFn: ApiServices.Organization.getAccounts,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Create account mutation hook
 */
export function useCreateAccount(options?: UseMutationOptions<ApiResponse<any>, Error, any>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ApiServices.Organization.createAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORGANIZATION.ACCOUNTS });
    },
    ...options,
  });
}

/**
 * Get users query hook
 */
export function useGetUsers(options?: UseQueryOptions<ApiResponse<User[]>, Error>) {
  return useQuery({
    queryKey: QUERY_KEYS.ORGANIZATION.USERS,
    queryFn: ApiServices.Organization.getUsers,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

// ===================================
// DATA SOURCE HOOKS
// ===================================

/**
 * Get data sources query hook
 */
export function useGetDataSources(options?: UseQueryOptions<ApiResponse<any[]>, Error>) {
  return useQuery({
    queryKey: QUERY_KEYS.DATA_SOURCES.LIST,
    queryFn: ApiServices.DataSource.getDataSources,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Create data source mutation hook
 */
export function useCreateDataSource(options?: UseMutationOptions<ApiResponse<any>, Error, any>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ApiServices.DataSource.createDataSource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DATA_SOURCES.LIST });
    },
    ...options,
  });
}

/**
 * Connect data source mutation hook
 */
export function useConnectDataSource(options?: UseMutationOptions<ApiResponse<any>, Error, { dataSourceId: string; config: any }>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ dataSourceId, config }) => ApiServices.DataSource.connectDataSource(dataSourceId, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DATA_SOURCES.LIST });
    },
    ...options,
  });
}

/**
 * Start extraction mutation hook
 */
export function useStartExtraction(options?: UseMutationOptions<ApiResponse<any>, Error, any>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ApiServices.DataSource.startExtraction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DATA_SOURCES.EXTRACTIONS });
    },
    ...options,
  });
}

/**
 * Get extraction status query hook
 */
export function useGetExtractionStatus(
  extractionId: string,
  options?: UseQueryOptions<ApiResponse<any>, Error>
) {
  return useQuery({
    queryKey: QUERY_KEYS.DATA_SOURCES.EXTRACTION_STATUS(extractionId),
    queryFn: () => ApiServices.DataSource.getExtractionStatus(extractionId),
    enabled: !!extractionId,
    refetchInterval: (data) => {
      // Poll while extraction is in progress
      const status = data?.data?.status;
      return status === 'in_progress' || status === 'running' ? 3000 : false;
    },
    ...options,
  });
}

// ===================================
// EMPLOYEE HOOKS
// ===================================

/**
 * Get employees query hook
 */
export function useGetEmployees(options?: UseQueryOptions<ApiResponse<Employee[]>, Error>) {
  return useQuery({
    queryKey: QUERY_KEYS.EMPLOYEES.LIST,
    queryFn: ApiServices.Employee.getEmployees,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
}

/**
 * Create employee mutation hook
 */
export function useCreateEmployee(options?: UseMutationOptions<ApiResponse<Employee>, Error, Omit<Employee, 'id'>>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ApiServices.Employee.createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EMPLOYEES.LIST });
    },
    ...options,
  });
}

/**
 * Get employee query hook
 */
export function useGetEmployee(
  employeeId: string,
  options?: UseQueryOptions<ApiResponse<Employee>, Error>
) {
  return useQuery({
    queryKey: QUERY_KEYS.EMPLOYEES.DETAIL(employeeId),
    queryFn: () => ApiServices.Employee.getEmployee(employeeId),
    enabled: !!employeeId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Update employee mutation hook
 */
export function useUpdateEmployee(options?: UseMutationOptions<ApiResponse<Employee>, Error, { employeeId: string; updates: Partial<Employee> }>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ employeeId, updates }) => ApiServices.Employee.updateEmployee(employeeId, updates),
    onSuccess: (data, variables) => {
      // Update specific employee cache
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EMPLOYEES.DETAIL(variables.employeeId) });
      // Update employees list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EMPLOYEES.LIST });
    },
    ...options,
  });
}

/**
 * Delete employee mutation hook
 */
export function useDeleteEmployee(options?: UseMutationOptions<ApiResponse<void>, Error, string>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ApiServices.Employee.deleteEmployee,
    onSuccess: (data, employeeId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: QUERY_KEYS.EMPLOYEES.DETAIL(employeeId) });
      // Update employees list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EMPLOYEES.LIST });
    },
    ...options,
  });
}

// ===================================
// DEPARTMENT HOOKS
// ===================================

/**
 * Get departments query hook
 */
export function useGetDepartments(options?: UseQueryOptions<ApiResponse<any[]>, Error>) {
  return useQuery({
    queryKey: QUERY_KEYS.DEPARTMENTS.LIST,
    queryFn: ApiServices.Department.getDepartments,
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}

/**
 * Create department mutation hook
 */
export function useCreateDepartment(options?: UseMutationOptions<ApiResponse<any>, Error, any>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ApiServices.Department.createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DEPARTMENTS.LIST });
    },
    ...options,
  });
}

// ===================================
// COMMUNICATION HOOKS
// ===================================

/**
 * Get emails query hook
 */
export function useGetEmails(params?: any, options?: UseQueryOptions<ApiResponse<any[]>, Error>) {
  return useQuery({
    queryKey: [...QUERY_KEYS.COMMUNICATIONS.EMAILS, params],
    queryFn: () => ApiServices.Communication.getEmails(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Get Teams direct messages query hook
 */
export function useGetTeamsDirectMessages(options?: UseQueryOptions<ApiResponse<any[]>, Error>) {
  return useQuery({
    queryKey: QUERY_KEYS.COMMUNICATIONS.TEAMS_DIRECT,
    queryFn: ApiServices.Communication.getTeamsDirectMessages,
    staleTime: 2 * 60 * 1000,
    ...options,
  });
}

/**
 * Search communications mutation hook
 */
export function useSearchCommunications(options?: UseMutationOptions<ApiResponse<any[]>, Error, any>) {
  return useMutation({
    mutationFn: ApiServices.Communication.searchCommunications,
    ...options,
  });
}

// ===================================
// FILE HOOKS
// ===================================

/**
 * Get files query hook
 */
export function useGetFiles(options?: UseQueryOptions<ApiResponse<any[]>, Error>) {
  return useQuery({
    queryKey: QUERY_KEYS.FILES.LIST,
    queryFn: ApiServices.File.getFiles,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Get OneDrive files query hook
 */
export function useGetOneDriveFiles(options?: UseQueryOptions<ApiResponse<any[]>, Error>) {
  return useQuery({
    queryKey: QUERY_KEYS.FILES.ONEDRIVE,
    queryFn: ApiServices.File.getOneDriveFiles,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

// ===================================
// MEETING HOOKS
// ===================================

/**
 * Get meetings query hook
 */
export function useGetMeetings(options?: UseQueryOptions<ApiResponse<any[]>, Error>) {
  return useQuery({
    queryKey: QUERY_KEYS.MEETINGS.LIST,
    queryFn: ApiServices.Meeting.getMeetings,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Get meeting query hook
 */
export function useGetMeeting(
  meetingId: string,
  options?: UseQueryOptions<ApiResponse<any>, Error>
) {
  return useQuery({
    queryKey: QUERY_KEYS.MEETINGS.DETAIL(meetingId),
    queryFn: () => ApiServices.Meeting.getMeeting(meetingId),
    enabled: !!meetingId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

// ===================================
// ANALYTICS HOOKS
// ===================================

/**
 * Get Glynac score query hook
 */
export function useGetGlynacScore(options?: UseQueryOptions<ApiResponse<any>, Error>) {
  return useQuery({
    queryKey: QUERY_KEYS.ANALYTICS.GLYNAC_SCORE,
    queryFn: ApiServices.Analytics.getGlynacScore,
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}

/**
 * Get trends query hook
 */
export function useGetTrends(options?: UseQueryOptions<ApiResponse<any[]>, Error>) {
  return useQuery({
    queryKey: QUERY_KEYS.ANALYTICS.TRENDS,
    queryFn: ApiServices.Analytics.getTrends,
    staleTime: 15 * 60 * 1000,
    ...options,
  });
}

/**
 * Get collaboration analytics query hook
 */
export function useGetCollaborationAnalytics(options?: UseQueryOptions<ApiResponse<any>, Error>) {
  return useQuery({
    queryKey: QUERY_KEYS.ANALYTICS.COLLABORATION,
    queryFn: ApiServices.Analytics.getCollaborationAnalytics,
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}

/**
 * Create forecast mutation hook
 */
export function useCreateForecast(options?: UseMutationOptions<ApiResponse<any>, Error, any>) {
  return useMutation({
    mutationFn: ApiServices.Analytics.createForecast,
    ...options,
  });
}

// ===================================
// DASHBOARD HOOKS
// ===================================

/**
 * Get dashboard stats query hook
 */
export function useGetDashboardStats(options?: UseQueryOptions<ApiResponse<DashboardStats>, Error>) {
  return useQuery({
    queryKey: QUERY_KEYS.DASHBOARD.STATS,
    queryFn: ApiServices.Dashboard.getDashboardStats,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    ...options,
  });
}

// ===================================
// UTILITY HOOKS
// ===================================

/**
 * Invalidate multiple query keys
 */
export function useInvalidateQueries() {
  const queryClient = useQueryClient();
  
  return (queryKeys: any[][]) => {
    queryKeys.forEach(queryKey => {
      queryClient.invalidateQueries({ queryKey });
    });
  };
}

/**
 * Prefetch query hook
 */
export function usePrefetchQuery() {
  const queryClient = useQueryClient();
  
  return <T>(queryKey: any[], queryFn: () => Promise<T>, staleTime = 5 * 60 * 1000) => {
    queryClient.prefetchQuery({
      queryKey,
      queryFn,
      staleTime,
    });
  };
}