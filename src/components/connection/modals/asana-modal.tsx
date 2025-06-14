// components/connection/modals/asana-modal.tsx
'use client';

import React, { useState } from 'react';
import { PlatformConfig } from '@/types/connection';

interface AsanaModalProps {
  platform: PlatformConfig;
  onClose: () => void;
  onConnect: (config: any) => Promise<void>;
}

export default function AsanaModal({ platform, onClose, onConnect }: AsanaModalProps) {
  const [config, setConfig] = useState({
    sourceName: 'Asana Source',
    apiKey: '',
    endpointUrl: 'https://app.asana.com/api/1.0/',
    refreshInterval: 'Manual',
    dataTypes: [] as string[],
  });
  
  const [isConnecting, setIsConnecting] = useState(false);

  const features = [
    { id: 'Tasks', name: 'Tasks', icon: '✅' },
    { id: 'Projects', name: 'Projects', icon: '📊' },
    { id: 'Teams', name: 'Teams', icon: '👥' },
    { id: 'Goals', name: 'Goals', icon: '🎯' },
  ];

  const handleConfigChange = (field: string, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleDataTypeToggle = (dataType: string) => {
    setConfig(prev => ({
      ...prev,
      dataTypes: prev.dataTypes.includes(dataType)
        ? prev.dataTypes.filter(type => type !== dataType)
        : [...prev.dataTypes, dataType]
    }));
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await onConnect(config);
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Configure Asana</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Source Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Source Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={config.sourceName}
              onChange={(e) => handleConfigChange('sourceName', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Asana Source"
            />
          </div>

          {/* API Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={config.apiKey}
                  onChange={(e) => handleConfigChange('apiKey', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your Asana API token"
                />
                <button className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Endpoint URL</label>
              <input
                type="url"
                value={config.endpointUrl}
                onChange={(e) => handleConfigChange('endpointUrl', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://app.asana.com/api/1.0/"
              />
            </div>
          </div>

          {/* Refresh Interval */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Refresh Interval</label>
            <select
              value={config.refreshInterval}
              onChange={(e) => handleConfigChange('refreshInterval', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Manual">Manual</option>
              <option value="Hourly">Every Hour</option>
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
            </select>
          </div>

          {/* Data Types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Select Data Types</label>
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature) => (
                <label key={feature.id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.dataTypes.includes(feature.id)}
                    onChange={() => handleDataTypeToggle(feature.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                  />
                  <div className="flex items-center">
                    <span className="text-lg mr-2">{feature.icon}</span>
                    <span className="text-sm font-medium text-gray-900">{feature.name}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end space-x-3 pt-6 mt-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleConnect}
            disabled={isConnecting || !config.sourceName || !config.apiKey}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isConnecting && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isConnecting ? 'Connecting...' : 'Create Source'}
          </button>
        </div>
      </div>
    </div>
    </div>
  );
}