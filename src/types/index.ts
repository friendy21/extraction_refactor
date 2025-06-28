export interface User {
  id: string;
  email: string;
  name?: string;
  isFirstTimeUser: boolean;
  setupCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id?: string;
  name: string;
  country: string;
  state: string;
  industry: string;
  size: string;
  website?: string;
  phone?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  logo?: string;
}

export interface DataSource {
  id: string;
  name: string;
  type: 'microsoft365' | 'google' | 'dropbox' | 'slack' | 'zoom' | 'jira' | 'analytics';
  connected: boolean;
  lastConnected?: string;
  connectionId?: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  location: string;
  status: 'included' | 'excluded';
  workModel: string;
  age: string;
  gender: string;
  ethnicity: string;
  language: string;
  timezone: string;
  include: boolean;
}

export interface DataQualityIssue {
  id: string;
  type: 'email_alias' | 'data_conflict' | 'missing_data';
  employeeId: string;
  employeeName: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  resolved: boolean;
}

export interface SetupProgress {
  organization: boolean;
  dataSource: boolean;
  employees: boolean;
  dataQuality: boolean;
  anonymization: boolean;
  review: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface DashboardStats {
  totalEmployees: number;
  departments: number;
  locations: number;
  remoteWorkers: number;
  dataCollection: {
    emails: number;
    meetings: number;
    chatMessages: number;
    fileAccesses: number;
  };
}