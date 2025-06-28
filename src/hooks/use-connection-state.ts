// hooks/use-connection-state.ts
'use client';

import { useState, useEffect } from 'react';
import { useConnectDataSource, useDisconnectDataSource } from '@/hooks/api';
import { PlatformConfig, ConfigModal } from '@/types/connection';
import { platformsData } from '@/data/platforms-data';

export function useConnectionState() {
  const [platforms, setPlatforms] = useState<PlatformConfig[]>([]);
  const [connectedSources, setConnectedSources] = useState<PlatformConfig[]>([]);
  const [draggedPlatform, setDraggedPlatform] = useState<PlatformConfig | null>(null);
  const [configModal, setConfigModal] = useState<ConfigModal>({ isOpen: false, platform: null });

  const connectMutation = useConnectDataSource();
  const disconnectMutation = useDisconnectDataSource();

  // Initialize platforms data on mount
  useEffect(() => {
    if (Array.isArray(platformsData)) {
      setPlatforms(platformsData);
    }
  }, []);

  const handleDragStart = (platform: PlatformConfig) => {
    setDraggedPlatform(platform);
  };

  const handleDrop = () => {
    if (draggedPlatform) {
      openConfigModal(draggedPlatform);
    }
  };

  const openConfigModal = (platform: PlatformConfig) => {
    setConfigModal({ isOpen: true, platform });
  };

  const closeConfigModal = () => {
    setConfigModal({ isOpen: false, platform: null });
    setDraggedPlatform(null);
  };

  const handleConnect = async (config: any) => {
    if (!configModal.platform) return;

    try {
      const result = await connectMutation.mutateAsync({
        type: configModal.platform.id,
        config,
      });

      if (result.success && result.data) {
        // Update connected sources
        const connectedPlatform = {
          ...configModal.platform,
          connected: true,
          connectionId: result.data.id,
        };
        
        setConnectedSources(prev => [...prev, connectedPlatform]);
        setPlatforms(prev => prev.filter(p => p.id !== configModal.platform?.id));
        closeConfigModal();
      }
    } catch (error) {
      console.error('Failed to connect:', error);
      throw error;
    }
  };

  const handleDisconnect = async (sourceId: string, platformId: string) => {
    try {
      await disconnectMutation.mutateAsync(sourceId);
      
      // Move back to available platforms
      const disconnectedSource = connectedSources.find(s => s.connectionId === sourceId);
      if (disconnectedSource) {
        const resetPlatform = { 
          ...disconnectedSource, 
          connected: false, 
          connectionId: undefined 
        };
        setPlatforms(prev => [...prev, resetPlatform]);
        setConnectedSources(prev => prev.filter(s => s.connectionId !== sourceId));
      }
    } catch (error) {
      console.error('Failed to disconnect:', error);
      throw error;
    }
  };

  return {
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
    isConnecting: connectMutation.isPending,
    isDisconnecting: disconnectMutation.isPending,
  };
}