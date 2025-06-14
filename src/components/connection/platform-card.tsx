'use client';

import React from 'react';
import { PlatformConfig } from '@/types/connection';
import { featureIcons } from '@/data/platforms-data';

interface PlatformCardProps {
  platform: PlatformConfig;
  onDragStart?: (platform: PlatformConfig) => void;
  isDraggable?: boolean;
  isConnected?: boolean;
}

export default function PlatformCard({ 
  platform, 
  onDragStart, 
  isDraggable = false,
  isConnected = false 
}: PlatformCardProps) {
  const handleDragStart = () => {
    if (onDragStart) {
      onDragStart(platform);
    }
  };

  return (
    <div
      draggable={isDraggable}
      onDragStart={handleDragStart}
      className={`
        group relative rounded-lg p-4 transition-all duration-200
        ${isDraggable 
          ? 'bg-gray-50 hover:bg-gray-100 border-2 border-dashed border-gray-200 hover:border-gray-300 cursor-move hover:shadow-md' 
          : isConnected 
            ? 'bg-green-50 border border-green-200'
            : 'bg-gray-50 border border-gray-200'
        }
      `}
    >
      <div className="flex items-start">
        <div className={`w-12 h-12 ${platform.color} rounded-lg flex items-center justify-center text-white text-xl mr-4 shadow-sm`}>
          {platform.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{platform.name}</h3>
            {isDraggable && (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </div>
            )}
            {isConnected && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Connected
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-3">{platform.description}</p>
          <div className="flex flex-wrap gap-2">
            {platform.features.map((feature) => (
              <span
                key={feature}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                <span className="mr-1">{featureIcons[feature] || '📊'}</span>
                {feature}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}