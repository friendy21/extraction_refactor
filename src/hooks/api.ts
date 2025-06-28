// hooks/api.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
  User, 
  LoginCredentials, 
  RegisterData, 
  Organization, 
  DataSource, 
  Employee, 
  DataQualityIssue, 
  ApiResponse,
  DashboardStats 
} from '@/types';
import { PlatformConfig } from '@/types/connection';

// Authentication hooks
export const useLogin = () => {
  return useMutation({
    mutationFn: async (credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> => {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success && data.data) {
        localStorage.setItem('auth_token', data.data.token);
        localStorage.setItem('user_data', JSON.stringify(data.data.user));
      }
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: async (userData: RegisterData): Promise<ApiResponse<{ user: User; token: string }>> => {
      const response = await api.post('/auth/register', userData);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success && data.data) {
        localStorage.setItem('auth_token', data.data.token);
        localStorage.setItem('user_data', JSON.stringify(data.data.user));
      }
    },
  });
};

export const useVerifyToken = () => {
  return useQuery({
    queryKey: ['verify-token'],
    queryFn: async (): Promise<ApiResponse<User>> => {
      const response = await api.get('/auth/verify');
      return response.data;
    },
    enabled: !!localStorage.getItem('auth_token'),
  });
};

// Organization hooks
export const useCreateOrganization = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (orgData: Organization): Promise<ApiResponse<Organization>> => {
      const response = await api.post('/organization', orgData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

export const useGetOrganization = () => {
  return useQuery({
    queryKey: ['organization'],
    queryFn: async (): Promise<ApiResponse<Organization>> => {
      const response = await api.get('/organization');
      return response.data;
    },
  });
};

// Platform and Data source hooks
export const useGetAvailablePlatforms = () => {
  return useQuery({
    queryKey: ['available-platforms'],
    queryFn: async (): Promise<ApiResponse<PlatformConfig[]>> => {
      const response = await api.get('/platforms/available');
      return response.data;
    },
  });
};

export const useGetConnectedSources = () => {
  return useQuery({
    queryKey: ['connected-sources'],
    queryFn: async (): Promise<ApiResponse<PlatformConfig[]>> => {
      const response = await api.get('/platforms/connected');
      return response.data;
    },
  });
};

export const useConnectDataSource = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { type: string; config: any }): Promise<ApiResponse<DataSource>> => {
      const response = await api.post('/platforms/connect', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['available-platforms'] });
      queryClient.invalidateQueries({ queryKey: ['connected-sources'] });
    },
  });
};

export const useDisconnectDataSource = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (sourceId: string): Promise<ApiResponse<void>> => {
      const response = await api.delete(`/platforms/${sourceId}/disconnect`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['available-platforms'] });
      queryClient.invalidateQueries({ queryKey: ['connected-sources'] });
    },
  });
};

// Employee hooks
export const useGetEmployees = () => {
  return useQuery({
    queryKey: ['employees'],
    queryFn: async (): Promise<ApiResponse<Employee[]>> => {
      const response = await api.get('/employees');
      return response.data;
    },
  });
};

export const useRunEmployeeDiscovery = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (): Promise<ApiResponse<{ count: number }>> => {
      const response = await api.post('/employees/discover');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { id: string; updates: Partial<Employee> }): Promise<ApiResponse<Employee>> => {
      const response = await api.patch(`/employees/${data.id}`, data.updates);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

export const useAddEmployee = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (employeeData: Omit<Employee, 'id'>): Promise<ApiResponse<Employee>> => {
      const response = await api.post('/employees', employeeData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

// Data quality hooks
export const useGetDataQualityIssues = () => {
  return useQuery({
    queryKey: ['data-quality-issues'],
    queryFn: async (): Promise<ApiResponse<DataQualityIssue[]>> => {
      const response = await api.get('/data-quality/issues');
      return response.data;
    },
  });
};

export const useRunDataCollection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (): Promise<ApiResponse<{ processedCount: number }>> => {
      const response = await api.post('/data-quality/collect');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['data-quality-issues'] });
    },
  });
};

export const useResolveDataIssue = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { issueId: string; resolution: any }): Promise<ApiResponse<void>> => {
      const response = await api.post(`/data-quality/issues/${data.issueId}/resolve`, data.resolution);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-quality-issues'] });
    },
  });
};

// Anonymization hooks
export const useRunAnonymization = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (): Promise<ApiResponse<{ processedCount: number }>> => {
      const response = await api.post('/anonymization/run');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

// Setup completion hook
export const useCompleteSetup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (): Promise<ApiResponse<User>> => {
      const response = await api.post('/setup/complete');
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success && data.data) {
        localStorage.setItem('user_data', JSON.stringify(data.data));
        queryClient.invalidateQueries({ queryKey: ['user'] });
      }
    },
  });
};

// Dashboard hooks
export const useGetDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<ApiResponse<DashboardStats>> => {
      const response = await api.get('/dashboard/stats');
      return response.data;
    },
  });
};