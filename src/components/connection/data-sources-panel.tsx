// components/connection/data-sources-panel.tsx
'use client';

import React from 'react';
import { PlatformConfig } from '@/types/connection';
import ConnectedSourceCard from './connected-source-card';

interface DataSourcesPanelProps {
  connectedSources: PlatformConfig[];
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDisconnect: (sourceId: string, platformId: string) => void;
}

export default function DataSourcesPanel({ 
  connectedSources, 
  onDragOver, 
  onDrop, 
  onDisconnect 
}: DataSourcesPanelProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="p-2 bg-green-100 rounded-lg mr-3">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Data Sources ({connectedSources.length})</h2>
            <p className="text-sm text-gray-600">Configured extraction sources</p>
          </div>
        </div>
      </div>

      <div
        onDragOver={onDragOver}
        onDrop={onDrop}
        className={`flex-1 ${
          connectedSources.length === 0
            ? 'border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center min-h-96'
            : 'overflow-y-auto max-h-96 pr-2 -mr-2'
        }`}
      >
        {connectedSources.length === 0 ? (
          <DropZone />
        ) : (
          <div className="space-y-4">
            {connectedSources.map((source) => (
              <ConnectedSourceCard
                key={source.connectionId}
                source={source}
                onDisconnect={onDisconnect}
              />
            ))}
          </div>
        )}
      </div>

      {/* Connection Count */}
      {connectedSources.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            {connectedSources.length} connected source{connectedSources.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}

function DropZone() {
  return (
    <div className="text-center p-8">
      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Drop platforms here to create data sources</h3>
      <p className="text-sm text-gray-500 mb-4">
        Drag and drop platforms from the left panel to configure connections
      </p>
      <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Tip: Click and drag any platform card
      </div>
    </div>
  );
}