// src/services/api-services.ts
import { apiClient } from '@/lib/api-client';
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
import type { PlatformConfig } from '@/types/connection';

/**
 * Service class for authentication operations
 */
export class AuthService {
  private static readonly BASE_PATH = '/v2/auth';

  /**
   * Login user with credentials
   */
  static async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await apiClient.post(`${this.BASE_PATH}/login/`, credentials);
      
      // Store token if login successful
      if (response.success && response.data?.token) {
        apiClient.setAuthToken(response.data.token);
        
        // Store user data
        if (typeof window !== 'undefined') {
          localStorage.setItem('user_data', JSON.stringify(response.data.user));
        }
      }
      
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  }

  /**
   * Register new user
   */
  static async register(userData: RegisterData): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await apiClient.post(`${this.BASE_PATH}/register/`, userData);
      
      // Store token if registration successful
      if (response.success && response.data?.token) {
        apiClient.setAuthToken(response.data.token);
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('user_data', JSON.stringify(response.data.user));
        }
      }
      
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  }

  /**
   * Logout user
   */
  static async logout(): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.post(`${this.BASE_PATH}/logout/`);
      
      // Clear local storage
      apiClient.setAuthToken(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user_data');
      }
      
      return response;
    } catch (error: any) {
      // Even if logout fails on server, clear local data
      apiClient.setAuthToken(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user_data');
      }
      throw new Error(error.message || 'Logout failed');
    }
  }

  /**
   * Refresh authentication token
   */
  static async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    try {
      return await apiClient.post(`${this.BASE_PATH}/refresh/`);
    } catch (error: any) {
      throw new Error(error.message || 'Token refresh failed');
    }
  }

  /**
   * Get current user profile
   */
  static async getMe(): Promise<ApiResponse<User>> {
    try {
      return await apiClient.get(`${this.BASE_PATH}/me/`);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch user profile');
    }
  }

  /**
   * Verify email with token
   */
  static async verifyEmail(token: string): Promise<ApiResponse<void>> {
    try {
      return await apiClient.get(`${this.BASE_PATH}/email-verify/${token}/`);
    } catch (error: any) {
      throw new Error(error.message || 'Email verification failed');
    }
  }

  /**
   * Request password reset
   */
  static async requestPasswordReset(email: string): Promise<ApiResponse<void>> {
    try {
      return await apiClient.post(`${this.BASE_PATH}/password-reset/`, { email });
    } catch (error: any) {
      throw new Error(error.message || 'Password reset request failed');
    }
  }
}

/**
 * Service class for organization operations
 */
export class OrganizationService {
  private static readonly BASE_PATH = '/v2/org';

  /**
   * Create organization
   */
  static async create(orgData: Organization): Promise<ApiResponse<Organization>> {
    try {
      return await apiClient.post(`${this.BASE_PATH}/organizations/`, orgData);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create organization');
    }
  }

  /**
   * Get organizations list
   */
  static async getOrganizations(): Promise<ApiResponse<Organization[]>> {
    try {
      return await apiClient.get(`${this.BASE_PATH}/organizations/`);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch organizations');
    }
  }

  /**
   * Get accounts list
   */
  static async getAccounts(): Promise<ApiResponse<any[]>> {
    try {
      return await apiClient.get(`${this.BASE_PATH}/accounts/`);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch accounts');
    }
  }

  /**
   * Create new account
   */
  static async createAccount(accountData: any): Promise<ApiResponse<any>> {
    try {
      return await apiClient.post(`${this.BASE_PATH}/accounts/`, accountData);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create account');
    }
  }

  /**
   * Get users list
   */
  static async getUsers(): Promise<ApiResponse<User[]>> {
    try {
      return await apiClient.get(`${this.BASE_PATH}/users/`);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch users');
    }
  }

  /**
   * Create new user
   */
  static async createUser(userData: any): Promise<ApiResponse<User>> {
    try {
      return await apiClient.post(`${this.BASE_PATH}/users/`, userData);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create user');
    }
  }
}

/**
 * Service class for data source operations
 */
export class DataSourceService {
  private static readonly BASE_PATH = '/v2/org';

  /**
   * Get data sources list
   */
  static async getDataSources(): Promise<ApiResponse<any[]>> {
    try {
      return await apiClient.get(`${this.BASE_PATH}/datasources/`);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch data sources');
    }
  }

  /**
   * Create data source
   */
  static async createDataSource(dataSourceData: any): Promise<ApiResponse<any>> {
    try {
      return await apiClient.post(`${this.BASE_PATH}/datasources/`, dataSourceData);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create data source');
    }
  }

  /**
   * Connect to data source
   */
  static async connectDataSource(dataSourceId: string, config: any): Promise<ApiResponse<any>> {
    try {
      return await apiClient.post(`${this.BASE_PATH}/datasources/${dataSourceId}/connect/`, config);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to connect data source');
    }
  }

  /**
   * Start data extraction
   */
  static async startExtraction(extractionConfig: any): Promise<ApiResponse<any>> {
    try {
      return await apiClient.post(`${this.BASE_PATH}/extractions/start/`, extractionConfig);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to start extraction');
    }
  }

  /**
   * Get extraction status
   */
  static async getExtractionStatus(extractionId: string): Promise<ApiResponse<any>> {
    try {
      return await apiClient.get(`${this.BASE_PATH}/extractions/${extractionId}/status/`);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get extraction status');
    }
  }

  /**
   * Get extractions list
   */
  static async getExtractions(): Promise<ApiResponse<any[]>> {
    try {
      return await apiClient.get(`${this.BASE_PATH}/extractions/`);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch extractions');
    }
  }
}

/**
 * Service class for employee operations
 */
export class EmployeeService {
  private static readonly BASE_PATH = '/v2/data/employees';

  /**
   * Get employees list
   */
  static async getEmployees(): Promise<ApiResponse<Employee[]>> {
    try {
      return await apiClient.get(`${this.BASE_PATH}/employees/`);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch employees');
    }
  }

  /**
   * Create employee
   */
  static async createEmployee(employeeData: Omit<Employee, 'id'>): Promise<ApiResponse<Employee>> {
    try {
      return await apiClient.post(`${this.BASE_PATH}/employees/`, employeeData);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create employee');
    }
  }

  /**
   * Get employee by ID
   */
  static async getEmployee(employeeId: string): Promise<ApiResponse<Employee>> {
    try {
      return await apiClient.get(`${this.BASE_PATH}/employees/${employeeId}/`);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch employee');
    }
  }

  /**
   * Update employee
   */
  static async updateEmployee(employeeId: string, updates: Partial<Employee>): Promise<ApiResponse<Employee>> {
    try {
      return await apiClient.put(`${this.BASE_PATH}/employees/${employeeId}/`, updates);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update employee');
    }
  }

  /**
   * Delete employee
   */
  static async deleteEmployee(employeeId: string): Promise<ApiResponse<void>> {
    try {
      return await apiClient.delete(`${this.BASE_PATH}/employees/${employeeId}/`);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete employee');
    }
  }

  /**
   * Get employee verification status
   */
  static async getEmployeeVerification(employeeId: string): Promise<ApiResponse<any>> {
    try {
      return await apiClient.get(`${this.BASE_PATH}/employees/${employeeId}/verified/`);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get employee verification');
    }
  }
}

/**
 * Service class for department operations
 */
export class DepartmentService {
  private static readonly BASE_PATH = '/v2/data/departments';

  /**
   * Get departments list
   */
  static async getDepartments(): Promise<ApiResponse<any[]>> {
    try {
      return await apiClient.get(`${this.BASE_PATH}/departments/`);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch departments');
    }
  }

  /**
   * Create department
   */
  static async createDepartment(departmentData: any): Promise<ApiResponse<any>> {
    try {
      return await apiClient.post(`${this.BASE_PATH}/departments/`, departmentData);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create department');
    }
  }

  /**
   * Get department by ID
   */
  static async getDepartment(departmentId: string): Promise<ApiResponse<any>> {
    try {
      return await apiClient.get(`${this.BASE_PATH}/departments/${departmentId}/`);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch department');
    }
  }

  /**
   * Update department
   */
  static async updateDepartment(departmentId: string, updates: any): Promise<ApiResponse<any>> {
    try {
      return await apiClient.put(`${this.BASE_PATH}/departments/${departmentId}/`, updates);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update department');
    }
  }

  /**
   * Delete department
   */
  static async deleteDepartment(departmentId: string): Promise<ApiResponse<void>> {
    try {
      return await apiClient.delete(`${this.BASE_PATH}/departments/${departmentId}/`);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete department');
    }
  }

  /**
   * Get department hierarchy
   */
  static async getDepartmentHierarchy(departmentId: string): Promise<ApiResponse<any>> {
    try {
      return await apiClient.get(`${this.BASE_PATH}/departments/${departmentId}/hierarchy/`);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get department hierarchy');
    }
  }
}

/**
 * Service class for communication data operations
 */
export class CommunicationService {
  private static readonly BASE_PATH = '/v2/data/communications';

  /**
   * Get emails list
   */
  static async getEmails(params?: any): Promise<ApiResponse<any[]>> {
    try {
      const queryParams = params ? `?${new URLSearchParams(params)}` : '';
      return await apiClient.get(`${this.BASE_PATH}/emails/${queryParams}`);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch emails');
    }
  }

  /**
   * Get email threads
   */
  static async getEmailThreads(threadId: string): Promise<ApiResponse<any[]>> {
    try {
      return await apiClient.get(`${this.BASE_PATH}/emails/threads/${threadId}/`);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch email threads');
    }
  }

  /**
   * Get Teams direct messages
   */
  static async getTeamsDirectMessages(): Promise<ApiResponse<any[]>> {
    try {
      return await apiClient.get(`${this.BASE_PATH}/teams/direct/`);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch Teams direct messages');
    }
  }

  /**
   * Get Teams group messages
   */
  static async getTeamsGroupMessages(): Promise<ApiResponse<any[]>> {
    try {
      return await apiClient.get(`${this.BASE_PATH}/teams/group/`);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch Teams group messages');
    }
  }

  /**
   * Get Teams channels
   */
  static async getTeamsChannels(): Promise<ApiResponse<any[]>> {
    try {
      return await apiClient.get(`${this.BASE_PATH}/teams/channels/`);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch Teams channels');
    }
  }

  /**
   * Search communications
   */
  static async searchCommunications(searchData: any): Promise<ApiResponse<any[]>> {
    try {
      return await apiClient.post(`${this.BASE_PATH}/search/`, searchData);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to search communications');
    }
  }
}

/**
 * Service class for file operations
 */
export class FileService {
  private static readonly BASE_PATH = '/v2/data/files';

  /**
   * Get files list
   */
  static async getFiles(): Promise<ApiResponse<any[]>> {
    try {
      return await apiClient.get(`${this.BASE_PATH}/files/`);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch files');
    }
  }

  /**
   * Get OneDrive files
   */
  static async getOneDriveFiles(): Promise<ApiResponse<any[]>> {
    try {
      return await apiClient.get(`${this.BASE_PATH}/files/onedrive/`);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch OneDrive files');
    }
  }

  /**
   * Get Dropbox files
   */
  static async getDropboxFiles(): Promise<ApiResponse<any[]>> {
    try {
      return await apiClient.get(`${this.BASE_PATH}/files/dropbox/`);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch Dropbox files');
    }
  }

  /**
   * Get Google Drive files
   */
  static async getGoogleDriveFiles(): Promise<ApiResponse<any[]>> {
    try {
      return await apiClient.get(`${this.BASE_PATH}/files/google-drive/`);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch Google Drive files');
    }
  }

  /**
   * Get file activities
   */
  static async getFileActivities(fileId: string): Promise<ApiResponse<any[]>> {
    try {
      return await apiClient.get(`${this.BASE_PATH}/files/${fileId}/activities/`);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch file activities');
    }
  }

  /**
   * Get file permissions
   */
  static async getFilePermissions(fileId: string): Promise<ApiResponse<any[]>> {
    try {
      return await apiClient.get(`${this.BASE_PATH}/files/${fileId}/permissions/`);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch file permissions');
    }
  }
}

/**
 * Service class for meeting operations
 */
export class MeetingService {
  private static readonly BASE_PATH = '/v2/data/meetings';

  /**
   * Get meetings list
   */
  static async getMeetings(): Promise<ApiResponse<any[]>> {
    try {
      return await apiClient.get(`${this.BASE_PATH}/meetings/`);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch meetings');
    }
  }

  /**
   * Get meeting by ID
   */
  static async getMeeting(meetingId: string): Promise<ApiResponse<any>> {
    try {
      return await apiClient.get(`${this.BASE_PATH}/meetings/${meetingId}/`);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch meeting');
    }
  }

  /**
   * Get calendar activities
   */
  static async getCalendarActivities(): Promise<ApiResponse<any[]>> {
    try {
      return await apiClient.get(`${this.BASE_PATH}/calendar/`);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch calendar activities');
    }
  }

  /**
   * Get meeting participants
   */
  static async getMeetingParticipants(meetingId: string): Promise<ApiResponse<any[]>> {
    try {
      return await apiClient.get(`${this.BASE_PATH}/meetings/${meetingId}/participants/`);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch meeting participants');
    }
  }

  /**
   * Get meeting analytics
   */
  static async getMeetingAnalytics(meetingId: string): Promise<ApiResponse<any>> {
    try {
      return await apiClient.get(`${this.BASE_PATH}/meetings/${meetingId}/analytics/`);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch meeting analytics');
    }
  }
}

/**
 * Service class for analytics operations
 */
export class AnalyticsService {
  private static readonly BASE_PATH = '/v2/analytics';

  /**
   * Get Glynac score
   */
  static async getGlynacScore(): Promise<ApiResponse<any>> {
    try {
      return await apiClient.get(`${this.BASE_PATH}/glynac-score/`);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch Glynac score');
    }
  }

  /**
   * Get trends
   */
  static async getTrends(): Promise<ApiResponse<any[]>> {
    try {
      return await apiClient.get(`${this.BASE_PATH}/trends/`);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch trends');
    }
  }

  /**
   * Get collaboration analytics
   */
  static async getCollaborationAnalytics(): Promise<ApiResponse<any>> {
    try {
      return await apiClient.get(`${this.BASE_PATH}/collaboration/`);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch collaboration analytics');
    }
  }

  /**
   * Get productivity analytics
   */
  static async getProductivityAnalytics(): Promise<ApiResponse<any>> {
    try {
      return await apiClient.get(`${this.BASE_PATH}/productivity/`);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch productivity analytics');
    }
  }

  /**
   * Get communication analytics
   */
  static async getCommunicationAnalytics(): Promise<ApiResponse<any>> {
    try {
      return await apiClient.get(`${this.BASE_PATH}/communication/`);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch communication analytics');
    }
  }

  /**
   * Create forecast
   */
  static async createForecast(forecastData: any): Promise<ApiResponse<any>> {
    try {
      return await apiClient.post(`${this.BASE_PATH}/forecast/`, forecastData);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create forecast');
    }
  }
}

/**
 * Service class for dashboard operations
 */
export class DashboardService {
  /**
   * Get dashboard stats
   */
  static async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    try {
      return await apiClient.get('/dashboard/stats');
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch dashboard stats');
    }
  }
}

// Export all services as a single object for easy importing
export const ApiServices = {
  Auth: AuthService,
  Organization: OrganizationService,
  DataSource: DataSourceService,
  Employee: EmployeeService,
  Department: DepartmentService,
  Communication: CommunicationService,
  File: FileService,
  Meeting: MeetingService,
  Analytics: AnalyticsService,
  Dashboard: DashboardService,
};