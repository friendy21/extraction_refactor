// components/connection/configuration-modal.tsx
'use client';

import React from 'react';
import { PlatformConfig } from '@/types/connection';
import GoogleWorkspaceModal from './modals/google-workspace-modal';
import MicrosoftModal from './modals/microsoft-modal';
import JiraModal from './modals/jira-modal';
import AsanaModal from './modals/asana-modal';
import SlackModal from './modals/slack-modal';

interface ConfigurationModalProps {
  platform: PlatformConfig;
  onClose: () => void;
  onConnect: (config: any) => Promise<void>;
}

export default function ConfigurationModal({ platform, onClose, onConnect }: ConfigurationModalProps) {
  // Render platform-specific modal based on platform type
  const renderModalContent = () => {
    switch (platform.id) {
      case 'google':
        return <GoogleWorkspaceModal platform={platform} onClose={onClose} onConnect={onConnect} />;
      case 'microsoft365':
        return <MicrosoftModal platform={platform} onClose={onClose} onConnect={onConnect} />;
      case 'jira':
        return <JiraModal platform={platform} onClose={onClose} onConnect={onConnect} />;
      case 'asana':
        return <AsanaModal platform={platform} onClose={onClose} onConnect={onConnect} />;
      case 'slack':
        return <SlackModal platform={platform} onClose={onClose} onConnect={onConnect} />;
      default:
        return <DefaultModal platform={platform} onClose={onClose} onConnect={onConnect} />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {renderModalContent()}
    </div>
  );
}

// Default modal for platforms without specific implementations
function DefaultModal({ platform, onClose, onConnect }: ConfigurationModalProps) {
  return (
    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Configure {platform.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="text-center py-8">
          <div className={`w-16 h-16 ${platform.color} rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-4`}>
            {platform.icon}
          </div>
          <p className="text-gray-600">
            Configuration modal for {platform.name} will be implemented soon.
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-6 mt-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={() => onConnect({})}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
          >
            Connect
          </button>
        </div>
      </div>
    </div>
  );
}