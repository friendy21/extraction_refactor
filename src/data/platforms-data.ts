// data/platforms-data.ts
import { PlatformConfig } from '@/types/connection';

export const platformsData: PlatformConfig[] = [
  {
    id: 'microsoft365',
    name: 'Microsoft 365',
    description: 'Outlook, Teams, SharePoint, OneDrive',
    icon: '🏢',
    color: 'bg-blue-500',
    features: ['Emails', 'Calendar Events', 'Documents', 'Team Chats'],
    connected: false,
  },
  {
    id: 'google',
    name: 'Google Workspace',
    description: 'Gmail, Drive, Calendar, Meet',
    icon: '📧',
    color: 'bg-green-500',
    features: ['Gmail', 'Google Drive', 'Calendar', 'Meet Recordings'],
    connected: false,
  },
  {
    id: 'jira',
    name: 'Jira',
    description: 'Issues, Projects, Workflows',
    icon: '🎯',
    color: 'bg-blue-600',
    features: ['Issues', 'Projects', 'Sprints', 'Workflows'],
    connected: false,
  },
  {
    id: 'asana',
    name: 'Asana',
    description: 'Tasks, Projects, Teams',
    icon: '✅',
    color: 'bg-pink-500',
    features: ['Tasks', 'Projects', 'Teams', 'Goals'],
    connected: false,
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Messages, Channels, Files',
    icon: '💬',
    color: 'bg-purple-500',
    features: ['Messages', 'Channels', 'Files', 'User Activity'],
    connected: false,
  },
];

// Platform-specific feature icons mapping
export const featureIcons: Record<string, string> = {
  // Google Workspace
  'Gmail': '📧',
  'Google Drive': '📁',
  'Calendar': '📅',
  'Meet Recordings': '📹',
  
  // Microsoft 365
  'Emails': '📧',
  'Calendar Events': '📅',
  'Documents': '📄',
  'Team Chats': '💬',
  
  // Jira
  'Issues': '🎫',
  'Projects': '📋',
  'Sprints': '🏃',
  'Workflows': '⚡',
  
  // Asana
  'Tasks': '✅',
  'Teams': '👥',
  'Goals': '🎯',
  
  // Slack
  'Messages': '💬',
  'Channels': '📺',
  'Files': '📁',
  'User Activity': '👤',
};