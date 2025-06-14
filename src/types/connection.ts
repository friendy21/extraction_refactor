export interface PlatformConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  features: string[];
  connected: boolean;
  connectionId?: string;
}

export interface ConnectionConfig {
  sourceName: string;
  apiKey: string;
  endpointUrl: string;
  refreshInterval: string;
  dataTypes: string[];
}

export interface ConfigModal {
  isOpen: boolean;
  platform: PlatformConfig | null;
}

export interface DataSource {
  id: string;
  name: string;
  type: string;
  connected: boolean;
  lastConnected?: string;
  connectionId?: string;
  config?: Partial<ConnectionConfig>;
}

export interface PlatformFeature {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

// Platform-specific configurations
export interface GoogleWorkspaceConfig extends ConnectionConfig {
  scopes?: string[];
  serviceAccountKey?: string;
}

export interface MicrosoftConfig extends ConnectionConfig {
  tenantId?: string;
  clientId?: string;
  clientSecret?: string;
}

export interface JiraConfig extends ConnectionConfig {
  projectKeys?: string[];
  issueTypes?: string[];
  customFields?: string[];
}

export interface AsanaConfig extends ConnectionConfig {
  workspaceId?: string;
  projectIds?: string[];
}

export interface SlackConfig extends ConnectionConfig {
  workspaceUrl?: string;
  botToken?: string;
  channels?: string[];
}