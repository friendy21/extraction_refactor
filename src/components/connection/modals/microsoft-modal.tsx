// src/components/connection/modals/microsoft-modal.tsx
'use client';

import React, { useState } from 'react';
import { PlatformConfig } from '@/types/connection';
import { 
  useStartUserExtraction,
  useStartCalendarExtraction,
  useStartTeamsExtraction,
  useStartOneDriveExtraction,
  useStartOutlookBatchExtraction,
  useStartSharePointExtraction,
  useAllServicesHealth
} from '@/hooks/use-microsoft-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface MicrosoftModalProps {
  platform: PlatformConfig;
  onClose: () => void;
  onConnect: (config: any) => Promise<void>;
}

type ServiceType = 'user' | 'calendar' | 'teams' | 'onedrive' | 'outlook' | 'sharepoint';

interface ServiceConfig {
  enabled: boolean;
  connectionId: string;
}

const MICROSOFT_SERVICES = [
  {
    id: 'user' as ServiceType,
    name: 'User Extraction',
    description: 'Extract user profiles from Azure AD',
    icon: '👥',
    requiresUserUpns: false,
  },
  {
    id: 'calendar' as ServiceType,
    name: 'Calendar Activity',
    description: 'Extract calendar events and meetings',
    icon: '📅',
    requiresUserUpns: true,
  },
  {
    id: 'teams' as ServiceType,
    name: 'Teams Chat',
    description: 'Extract Teams messages and conversations',
    icon: '💬',
    requiresUserUpns: true,
  },
  {
    id: 'onedrive' as ServiceType,
    name: 'OneDrive Activity',
    description: 'Extract file activities from OneDrive',
    icon: '📁',
    requiresUserUpns: true,
  },
  {
    id: 'outlook' as ServiceType,
    name: 'Outlook Mail',
    description: 'Extract emails from Outlook',
    icon: '📧',
    requiresUserUpns: true,
  },
  {
    id: 'sharepoint' as ServiceType,
    name: 'SharePoint',
    description: 'Extract documents from SharePoint',
    icon: '📊',
    requiresUserUpns: false,
  },
];

export default function MicrosoftModal({ platform, onClose, onConnect }: MicrosoftModalProps) {
  const [config, setConfig] = useState({
    sourceName: 'Microsoft 365 Source',
    tenantId: '',
    clientId: '',
    clientSecret: '',
    userUpns: [] as string[],
    refreshInterval: 'Manual',
  });

  const [services, setServices] = useState<Record<ServiceType, ServiceConfig>>({
    user: { enabled: true, connectionId: '' },
    calendar: { enabled: false, connectionId: '' },
    teams: { enabled: false, connectionId: '' },
    onedrive: { enabled: false, connectionId: '' },
    outlook: { enabled: false, connectionId: '' },
    sharepoint: { enabled: false, connectionId: '' },
  });

  const [userUpnInput, setUserUpnInput] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [activeTab, setActiveTab] = useState('config');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // API hooks
  const userExtractionMutation = useStartUserExtraction();
  const calendarExtractionMutation = useStartCalendarExtraction();
  const teamsExtractionMutation = useStartTeamsExtraction();
  const oneDriveExtractionMutation = useStartOneDriveExtraction();
  const outlookExtractionMutation = useStartOutlookBatchExtraction();
  const sharePointExtractionMutation = useStartSharePointExtraction();
  
  const { data: healthData, isLoading: healthLoading } = useAllServicesHealth();

  const handleConfigChange = (field: string, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleServiceToggle = (serviceId: ServiceType, enabled: boolean) => {
    setServices(prev => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        enabled,
        connectionId: enabled ? generateConnectionId(serviceId) : '',
      },
    }));
  };

  const handleServiceConnectionIdChange = (serviceId: ServiceType, connectionId: string) => {
    setServices(prev => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        connectionId,
      },
    }));
  };

  const generateConnectionId = (serviceId: ServiceType): string => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `microsoft-${serviceId}-${timestamp}`;
  };

  const addUserUpn = () => {
    if (userUpnInput.trim() && !config.userUpns.includes(userUpnInput.trim())) {
      setConfig(prev => ({
        ...prev,
        userUpns: [...prev.userUpns, userUpnInput.trim()],
      }));
      setUserUpnInput('');
    }
  };

  const removeUserUpn = (upn: string) => {
    setConfig(prev => ({
      ...prev,
      userUpns: prev.userUpns.filter(u => u !== upn),
    }));
  };

  const validateConfig = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!config.tenantId.trim()) {
      newErrors.tenantId = 'Tenant ID is required';
    } else if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(config.tenantId)) {
      newErrors.tenantId = 'Invalid Tenant ID format (must be a UUID)';
    }

    if (!config.clientId.trim()) {
      newErrors.clientId = 'Client ID is required';
    } else if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(config.clientId)) {
      newErrors.clientId = 'Invalid Client ID format (must be a UUID)';
    }

    if (!config.clientSecret.trim()) {
      newErrors.clientSecret = 'Client Secret is required';
    }

    const enabledServices = Object.entries(services).filter(([_, service]) => service.enabled);
    if (enabledServices.length === 0) {
      newErrors.services = 'At least one service must be enabled';
    }

    // Check if services requiring user UPNs have them
    const servicesRequiringUpns = enabledServices.filter(([serviceId]) => 
      MICROSOFT_SERVICES.find(s => s.id === serviceId)?.requiresUserUpns
    );
    
    if (servicesRequiringUpns.length > 0 && config.userUpns.length === 0) {
      newErrors.userUpns = 'User UPNs are required for the selected services';
    }

    // Validate connection IDs
    enabledServices.forEach(([serviceId, service]) => {
      if (!service.connectionId.trim()) {
        newErrors[`${serviceId}ConnectionId`] = 'Connection ID is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConnect = async () => {
    if (!validateConfig()) {
      setActiveTab('config');
      return;
    }

    setIsConnecting(true);
    
    try {
      const baseConfig = {
        tenant_id: config.tenantId,
        client_id: config.clientId,
        client_secret: config.clientSecret,
      };

      const userUpnsConfig = config.userUpns.length > 0 ? { user_upns: config.userUpns } : {};
      
      const promises: Promise<any>[] = [];

      // Start extractions for enabled services
      Object.entries(services).forEach(([serviceId, service]) => {
        if (!service.enabled) return;

        switch (serviceId as ServiceType) {
          case 'user':
            promises.push(
              userExtractionMutation.mutateAsync({
                connectionId: service.connectionId,
                config: baseConfig,
              })
            );
            break;

          case 'calendar':
            promises.push(
              calendarExtractionMutation.mutateAsync({
                connectionId: service.connectionId,
                config: { ...baseConfig, ...userUpnsConfig },
              })
            );
            break;

          case 'teams':
            promises.push(
              teamsExtractionMutation.mutateAsync({
                connectionId: service.connectionId,
                config: { ...baseConfig, ...userUpnsConfig },
              })
            );
            break;

          case 'onedrive':
            promises.push(
              oneDriveExtractionMutation.mutateAsync({
                ...baseConfig,
                ...userUpnsConfig,
                connection_id: service.connectionId,
              })
            );
            break;

          case 'outlook':
            promises.push(
              outlookExtractionMutation.mutateAsync({
                batchTaskId: service.connectionId,
                config: {
                  ...baseConfig,
                  outlook_client_id: config.clientId,
                  outlook_client_secret: config.clientSecret,
                  ...userUpnsConfig,
                },
              })
            );
            break;

          case 'sharepoint':
            promises.push(
              sharePointExtractionMutation.mutateAsync({
                connectionId: service.connectionId,
                config: baseConfig,
              })
            );
            break;
        }
      });

      await Promise.all(promises);

      // Call the parent onConnect function
      await onConnect({
        ...config,
        services: services,
        type: 'microsoft',
      });

    } catch (error) {
      console.error('Connection failed:', error);
      setErrors({ general: error instanceof Error ? error.message : 'Connection failed' });
    } finally {
      setIsConnecting(false);
    }
  };

  const getServiceHealthStatus = (serviceId: ServiceType) => {
    if (healthLoading) return 'loading';
    if (!healthData) return 'unknown';
    
    const serviceHealth = healthData[serviceId === 'user' ? 'user' : serviceId];
    return serviceHealth?.status || 'unknown';
  };

  const renderHealthBadge = (serviceId: ServiceType) => {
    const status = getServiceHealthStatus(serviceId);
    
    switch (status) {
      case 'healthy':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Healthy</Badge>;
      case 'unhealthy':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Unhealthy</Badge>;
      case 'loading':
        return <Badge variant="secondary"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Checking...</Badge>;
      default:
        return <Badge variant="outline"><AlertCircle className="w-3 h-3 mr-1" />Unknown</Badge>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Configure Microsoft 365</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {errors.general && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="config">Configuration</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="users">User UPNs</TabsTrigger>
            </TabsList>

            <TabsContent value="config" className="space-y-6">
              <div className="space-y-4">
                {/* Source Name */}
                <div>
                  <Label htmlFor="sourceName" className="text-sm font-semibold text-gray-900">
                    Source Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="sourceName"
                    value={config.sourceName}
                    onChange={(e) => handleConfigChange('sourceName', e.target.value)}
                    placeholder="Microsoft 365 Source"
                    className="mt-1"
                  />
                </div>

                {/* Azure AD Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tenantId" className="text-sm font-semibold text-gray-900">
                      Tenant ID <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="tenantId"
                      value={config.tenantId}
                      onChange={(e) => handleConfigChange('tenantId', e.target.value)}
                      placeholder="12345678-1234-1234-1234-123456789012"
                      className={`mt-1 ${errors.tenantId ? 'border-red-500' : ''}`}
                    />
                    {errors.tenantId && (
                      <p className="text-red-500 text-sm mt-1">{errors.tenantId}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="clientId" className="text-sm font-semibold text-gray-900">
                      Client ID <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="clientId"
                      value={config.clientId}
                      onChange={(e) => handleConfigChange('clientId', e.target.value)}
                      placeholder="87654321-4321-4321-4321-210987654321"
                      className={`mt-1 ${errors.clientId ? 'border-red-500' : ''}`}
                    />
                    {errors.clientId && (
                      <p className="text-red-500 text-sm mt-1">{errors.clientId}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="clientSecret" className="text-sm font-semibold text-gray-900">
                    Client Secret <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="clientSecret"
                    type="password"
                    value={config.clientSecret}
                    onChange={(e) => handleConfigChange('clientSecret', e.target.value)}
                    placeholder="Enter your Microsoft Graph API client secret"
                    className={`mt-1 ${errors.clientSecret ? 'border-red-500' : ''}`}
                  />
                  {errors.clientSecret && (
                    <p className="text-red-500 text-sm mt-1">{errors.clientSecret}</p>
                  )}
                </div>

                {/* Refresh Interval */}
                <div>
                  <Label htmlFor="refreshInterval" className="text-sm font-semibold text-gray-900">
                    Refresh Interval
                  </Label>
                  <select
                    id="refreshInterval"
                    value={config.refreshInterval}
                    onChange={(e) => handleConfigChange('refreshInterval', e.target.value)}
                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Manual">Manual</option>
                    <option value="Hourly">Every Hour</option>
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                  </select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="services" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Select Microsoft 365 Services</h3>
                  {healthLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                </div>
                
                {errors.services && (
                  <p className="text-red-500 text-sm">{errors.services}</p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {MICROSOFT_SERVICES.map((service) => (
                    <div key={service.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id={service.id}
                            checked={services[service.id].enabled}
                            onCheckedChange={(checked) => 
                              handleServiceToggle(service.id, checked as boolean)
                            }
                          />
                          <div>
                            <label htmlFor={service.id} className="text-sm font-medium cursor-pointer flex items-center">
                              <span className="text-lg mr-2">{service.icon}</span>
                              {service.name}
                            </label>
                            <p className="text-xs text-gray-500">{service.description}</p>
                          </div>
                        </div>
                        {renderHealthBadge(service.id)}
                      </div>

                      {services[service.id].enabled && (
                        <div>
                          <Label htmlFor={`${service.id}ConnectionId`} className="text-xs text-gray-600">
                            Connection ID
                          </Label>
                          <Input
                            id={`${service.id}ConnectionId`}
                            value={services[service.id].connectionId}
                            onChange={(e) => handleServiceConnectionIdChange(service.id, e.target.value)}
                            placeholder={`microsoft-${service.id}-connection`}
                            className={`mt-1 text-sm ${errors[`${service.id}ConnectionId`] ? 'border-red-500' : ''}`}
                          />
                          {errors[`${service.id}ConnectionId`] && (
                            <p className="text-red-500 text-xs mt-1">{errors[`${service.id}ConnectionId`]}</p>
                          )}
                          
                          {service.requiresUserUpns && (
                            <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                              <AlertCircle className="w-3 h-3 inline mr-1" />
                              This service requires User UPNs to be configured.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">User Principal Names (UPNs)</h3>
                  <p className="text-sm text-gray-600">
                    Add user email addresses for services that require specific user data extraction.
                  </p>
                </div>

                {errors.userUpns && (
                  <p className="text-red-500 text-sm">{errors.userUpns}</p>
                )}

                <div className="flex space-x-2">
                  <Input
                    value={userUpnInput}
                    onChange={(e) => setUserUpnInput(e.target.value)}
                    placeholder="user@company.com"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addUserUpn();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button onClick={addUserUpn} variant="outline">
                    Add
                  </Button>
                </div>

                {config.userUpns.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Added Users ({config.userUpns.length})</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {config.userUpns.map((upn, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{upn}</span>
                          <Button
                            onClick={() => removeUserUpn(upn)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0" />
                    <div className="text-sm text-yellow-700">
                      <p className="font-medium">Required Permissions</p>
                      <ul className="mt-1 list-disc list-inside space-y-1">
                        <li>User.Read.All (for User Extraction)</li>
                        <li>Calendars.Read (for Calendar Activity)</li>
                        <li>Chat.Read.All (for Teams Chat)</li>
                        <li>Files.Read.All (for OneDrive Activity)</li>
                        <li>Mail.Read (for Outlook Mail)</li>
                        <li>Sites.Read.All (for SharePoint)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Modal Actions */}
          <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-200">
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="min-w-[120px]"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Connecting...
                </>
              ) : (
                'Create Sources'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}