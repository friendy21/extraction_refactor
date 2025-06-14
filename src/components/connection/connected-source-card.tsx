// components/connection/connected-source-card.tsx
'use client';

import React from 'react';
import { PlatformConfig } from '@/types/connection';

interface ConnectedSourceCardProps {
  source: PlatformConfig;
  onDisconnect: (sourceId: string, platformId: string) => void;
}

export default function ConnectedSourceCard({ source, onDisconnect }: ConnectedSourceCardProps) {
  const handleDisconnect = () => {
    if (source.connectionId) {
      onDisconnect(source.connectionId, source.id);
    }
  };

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`w-10 h-10 ${source.color} rounded-lg flex items-center justify-center text-white mr-3 shadow-sm`}>
            {source.icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{source.name}</h3>
            <p className="text-sm text-gray-600">{source.description}</p>
            <div className="flex items-center mt-1 space-x-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                Connected
              </span>
              {source.connectionId && (
                <span className="text-xs text-gray-500">
                  ID: {source.connectionId.slice(-8)}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            title="Configure connection"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <button
            onClick={handleDisconnect}
            className="px-3 py-1 text-sm text-red-600 hover:text-red-800 border border-red-300 hover:border-red-500 rounded transition-colors"
          >
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );
}