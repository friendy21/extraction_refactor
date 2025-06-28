// app/setup/connection/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import SetupLayout from '@/components/setup/setup-layout';
import AvailablePlatforms from '@/components/connection/available-platform';
import DataSourcesPanel from '@/components/connection/data-sources-panel';
import ConfigurationModal from '@/components/connection/configuration-modal';
import { useConnectionState } from '@/hooks/use-connection-state';

export default function ConnectionSetupPage() {
  const router = useRouter();
  const {
    platforms,
    connectedSources,
    draggedPlatform,
    configModal,
    handleDragStart,
    handleDrop,
    handleConnect,
    handleDisconnect,
    openConfigModal,
    closeConfigModal,
    setDraggedPlatform,
  } = useConnectionState();

  const handleContinue = () => {
    router.push('/setup/employees');
  };

  const handleBack = () => {
    router.push('/setup/organization');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropWrapper = (e: React.DragEvent) => {
    e.preventDefault();
    handleDrop();
    setDraggedPlatform(null);
  };

  // Show loading state while platforms are initializing
  if (!platforms && !connectedSources) {
    return (
      <SetupLayout>
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Data Source Connection</h1>
            <p className="text-lg text-gray-600">
              Connect to your workplace platforms to collect data for analysis.
            </p>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </SetupLayout>
    );
  }

  return (
    <SetupLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Data Source Connection</h1>
          <p className="text-lg text-gray-600">
            Connect to your workplace platforms to collect data for analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[600px]">
          {/* Available Platforms */}
          <AvailablePlatforms 
            platforms={platforms || []}
            onDragStart={handleDragStart}
          />

          {/* Data Sources */}
          <DataSourcesPanel
            connectedSources={connectedSources || []}
            onDragOver={handleDragOver}
            onDrop={handleDropWrapper}
            onDisconnect={handleDisconnect}
          />
        </div>

        {/* Configuration Modal */}
        {configModal.isOpen && configModal.platform && (
          <ConfigurationModal
            platform={configModal.platform}
            onClose={closeConfigModal}
            onConnect={handleConnect}
          />
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={handleBack}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            ← Back
          </button>
          
          <button
            type="button"
            onClick={handleContinue}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            Continue →
          </button>
        </div>
      </div>
    </SetupLayout>
  );
}