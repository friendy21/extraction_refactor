// components/connection/available-platforms.tsx
'use client';

import React, { useState } from 'react';
import { PlatformConfig } from '@/types/connection';
import PlatformCard from './platform-card';

interface AvailablePlatformsProps {
  platforms: PlatformConfig[];
  onDragStart: (platform: PlatformConfig) => void;
}

export default function AvailablePlatforms({ platforms = [], onDragStart }: AvailablePlatformsProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Guard clause to ensure platforms is always an array
  const safePlatforms = Array.isArray(platforms) ? platforms : [];

  const filteredPlatforms = safePlatforms.filter(platform =>
    platform.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    platform.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    platform.features.some(feature => 
      feature.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-full flex flex-col">
      <div className="flex items-center mb-6">
        <div className="p-2 bg-blue-100 rounded-lg mr-3">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Available Platforms</h2>
          <p className="text-sm text-gray-600">Drag platforms to create data sources</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search platforms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
      </div>

      {/* Platforms List with Scrollbar */}
      <div className="flex-1 overflow-y-auto max-h-96 pr-2 -mr-2">
        <div className="space-y-4">
          {filteredPlatforms.map((platform) => (
            <PlatformCard
              key={platform.id}
              platform={platform}
              onDragStart={onDragStart}
              isDraggable={true}
            />
          ))}
        </div>

        {/* No Results Message */}
        {filteredPlatforms.length === 0 && searchTerm && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No platforms found</h3>
            <p className="text-sm text-gray-500">
              Try searching with different keywords or browse all available platforms.
            </p>
            <button
              onClick={() => setSearchTerm('')}
              className="mt-3 text-blue-600 hover:text-blue-500 text-sm font-medium"
            >
              Clear search
            </button>
          </div>
        )}

        {/* All Connected Message */}
        {safePlatforms.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">All platforms connected!</h3>
            <p className="text-sm text-gray-500">
              You have successfully connected all available platforms. You can manage them in the Data Sources panel.
            </p>
          </div>
        )}
      </div>

      {/* Platform Count */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          {searchTerm 
            ? `${filteredPlatforms.length} of ${safePlatforms.length} platforms`
            : `${safePlatforms.length} available platforms`
          }
        </p>
      </div>
    </div>
  );
}