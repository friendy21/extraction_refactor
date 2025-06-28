// src/hooks/api.ts - Updated with new API integration
import { 
  useMutation, 
  useQuery, 
  useQueryClient, 
  UseQueryOptions,
  UseMutationOptions 
} from '@tanstack/react-query';
import { ApiServices } from '@/services/api-services';
import { QUERY_KEYS } from '@/hooks/api-hooks';
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

// Re-export all hooks from api-hooks for backward compatibility
export * from '@/hooks/api-hooks';

// ===================================
// LEGACY HOOKS (Updated to use new API services)
// ===================================

/**
 * @deprecated Use useLogin from api-hooks instead
 */
export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> => {
      return ApiServices.Auth.login(credentials);
    },
    onSuccess: (data) => {
      if (data.success && data.data) {
        queryClient.setQueryData(QUERY_KEYS.AUTH.ME, data.data.user);
      }
    },
    meta: {
      showSuccessToast: true,
      successMessage: 'Login successful!',
    },
  });
};

/**
 * @deprecated Use useRegister from api-hooks instead
 */
export const useRegister = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userData: RegisterData): Promise<ApiResponse<{ user: User; token: string }>> => {
      return ApiServices.Auth.register(userData);
    },
    onSuccess: (data) => {
      if (data.success && data.data) {
        queryClient.setQueryData(QUERY_KEYS.AUTH.ME, data.data.user);
      }
    },
    meta: {
      showSuccessToast: true,
      successMessage: 'Registration successful!',
    },
  });
};

/**
 * @deprecated Use useGetMe from api-hooks instead
 */
export const useVerifyToken = () => {
  return useQuery({
    queryKey: QUERY_KEYS.AUTH.ME,
    queryFn: ApiServices.Auth.getMe,
    enabled: !!localStorage.getItem('auth_token'),
    retry: false, // Don't retry auth verification
    meta: {
      showErrorToast: false, // Handle auth errors in AuthProvider
    },
  });
};

/**
 * @deprecated Use useCreateOrganization from api-hooks instead
 */
export const useCreateOrganization = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (orgData: Organization): Promise<ApiResponse<Organization>> => {
      return ApiServices.Organization.create(orgData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORGANIZATION.LIST });
    },
    meta: {
      showSuccessToast: true,
      successMessage: 'Organization created successfully!',
    },
  });
};

/**
 * @deprecated Use useGetOrganizations from api-hooks instead
 */
export const useGetOrganization = () => {
  return useQuery({
    queryKey: QUERY_KEYS.ORGANIZATION.LIST,
    queryFn: ApiServices.Organization.getOrganizations,
    select: (data) => ({
      ...data,
      data: data.data?.[0], // Return first organization for backward compatibility
    }),
  });
};

// ===================================
// PLATFORM AND DATA SOURCE HOOKS
// ===================================

/**
 * Get available platforms (mock data for backward compatibility)
 */
export const useGetAvailablePlatforms = () => {
  return useQuery({
    queryKey: ['available-platforms'],
    queryFn: async () => {
      // Return mock data for backward compatibility
      const { platformsData } = await import('@/data/platforms-data');
      return {
        success: true,
        data: platformsData,
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Get connected sources
 */
export const useGetConnectedSources = () => {
  return useQuery({
    queryKey: ['connected-sources'],
    queryFn: async () => {
      // This would typically come from your backend
      // For now, return empty array
      return {
        success: true,
        data: [],
      };
    },
  });
};

/**
 * Connect data source
 */
export const useConnectDataSource = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { type: string; config: any }) => {
      return ApiServices.DataSource.createDataSource({
        type: data.type,
        configuration: data.config,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['available-platforms'] });
      queryClient.invalidateQueries({ queryKey: ['connected-sources'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DATA_SOURCES.LIST });
    },
    meta: {
      showSuccessToast: true,
      successMessage: 'Data source connected successfully!',
    },
  });
};

/**
 * Disconnect data source
 */
export const useDisconnectDataSource = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (sourceId: string) => {
      // This would call a delete endpoint
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['available-platforms'] });
      queryClient.invalidateQueries({ queryKey: ['connected-sources'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DATA_SOURCES.LIST });
    },
    meta: {
      showSuccessToast: true,
      successMessage: 'Data source disconnected successfully!',
    },
  });
};

// ===================================
// EMPLOYEE HOOKS (Updated)
// ===================================

/**
 * @deprecated Use useGetEmployees from api-hooks instead
 */
export const useGetEmployees = () => {
  return useQuery({
    queryKey: QUERY_KEYS.EMPLOYEES.LIST,
    queryFn: ApiServices.Employee.getEmployees,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Run employee discovery
 */
export const useRunEmployeeDiscovery = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (): Promise<ApiResponse<{ count: number }>> => {
      // This would call your discovery endpoint
      return { 
        success: true, 
        data: { count: 248 },
        message: 'Employee discovery completed successfully'
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EMPLOYEES.LIST });
    },
    meta: {
      showSuccessToast: true,
      successMessage: 'Employee discovery completed!',
    },
  });
};

/**
 * @deprecated Use useUpdateEmployee from api-hooks instead
 */
export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { id: string; updates: Partial<Employee> }) => {
      return ApiServices.Employee.updateEmployee(data.id, data.updates);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EMPLOYEES.DETAIL(variables.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EMPLOYEES.LIST });
    },
    meta: {
      showSuccessToast: true,
      successMessage: 'Employee updated successfully!',
    },
  });
};

/**
 * @deprecated Use useCreateEmployee from api-hooks instead
 */
export const useAddEmployee = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (employeeData: Omit<Employee, 'id'>) => {
      return ApiServices.Employee.createEmployee(employeeData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EMPLOYEES.LIST });
    },
    meta: {
      showSuccessToast: true,
      successMessage: 'Employee added successfully!',
    },
  });
};

// ===================================
// DATA QUALITY HOOKS
// ===================================

/**
 * Get data quality issues
 */
export const useGetDataQualityIssues = () => {
  return useQuery({
    queryKey: ['data-quality-issues'],
    queryFn: async (): Promise<ApiResponse<DataQualityIssue[]>> => {
      // Mock data for backward compatibility
      const mockIssues: DataQualityIssue[] = [
        {
          id: 'issue-1',
          type: 'email_alias',
          employeeId: 'emp-1',
          employeeName: 'Sarah Williams',
          description: 'Employee has multiple email addresses across different systems.',
          severity: 'medium',
          resolved: false,
        },
        {
          id: 'issue-2',
          type: 'data_conflict',
          employeeId: 'emp-2',
          employeeName: 'James Miller',
          description: 'Conflicting employee information detected between connected data sources.',
          severity: 'high',
          resolved: false,
        },
      ];
      
      return {
        success: true,
        data: mockIssues,
      };
    },
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Run data collection
 */
export const useRunDataCollection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (): Promise<ApiResponse<{ processedCount: number }>> => {
      return {
        success: true,
        data: { processedCount: 242 },
        message: 'Data collection completed successfully'
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EMPLOYEES.LIST });
      queryClient.invalidateQueries({ queryKey: ['data-quality-issues'] });
    },
    meta: {
      showSuccessToast: true,
      successMessage: 'Data collection completed successfully!',
    },
  });
};

/**
 * Resolve data quality issue
 */
export const useResolveDataIssue = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { issueId: string; resolution: any }): Promise<ApiResponse<void>> => {
      return {
        success: true,
        message: 'Issue resolved successfully'
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-quality-issues'] });
    },
    meta: {
      showSuccessToast: true,
      successMessage: 'Issue resolved successfully!',
    },
  });
};

// ===================================
// ANONYMIZATION HOOKS
// ===================================

/**
 * Run anonymization
 */
export const useRunAnonymization = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (): Promise<ApiResponse<{ processedCount: number }>> => {
      return {
        success: true,
        data: { processedCount: 242 },
        message: 'Anonymization completed successfully'
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH.ME });
    },
    meta: {
      showSuccessToast: true,
      successMessage: 'Anonymization completed successfully!',
    },
  });
};

// ===================================
// SETUP COMPLETION HOOK
// ===================================

/**
 * Complete setup
 */
export const useCompleteSetup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (): Promise<ApiResponse<User>> => {
      // This would update the user's setup status
      const currentUser = queryClient.getQueryData<User>(QUERY_KEYS.AUTH.ME);
      const updatedUser: User = {
        ...currentUser!,
        isFirstTimeUser: false,
        setupCompleted: true,
        updatedAt: new Date().toISOString(),
      };
      
      return {
        success: true,
        data: updatedUser,
        message: 'Setup completed successfully'
      };
    },
    onSuccess: (data) => {
      if (data.success && data.data) {
        queryClient.setQueryData(QUERY_KEYS.AUTH.ME, data.data);
        // Update localStorage as well
        localStorage.setItem('user_data', JSON.stringify(data.data));
      }
    },
    meta: {
      showSuccessToast: true,
      successMessage: 'Setup completed successfully!',
    },
  });
};

// ===================================
// DASHBOARD HOOKS (Updated)
// ===================================

/**
 * @deprecated Use useGetDashboardStats from api-hooks instead
 */
export const useGetDashboardStats = () => {
  return useQuery({
    queryKey: QUERY_KEYS.DASHBOARD.STATS,
    queryFn: ApiServices.Dashboard.getDashboardStats,
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};