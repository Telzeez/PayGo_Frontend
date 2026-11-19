"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/lib/api/client';

export interface OwnerDevice {
  deviceId: string;
  balance: number;
  status: 'ONLINE' | 'OFFLINE';
  lastSeenAt: string | null;
  lastUpdated: string | null;
}

interface DeviceContextValue {
  devices: OwnerDevice[];
  selectedDeviceId: string | null;
  selectedDevice: OwnerDevice | null;
  loadingDevices: boolean;
  deviceError: string;
  selectDevice: (deviceId: string) => void;
  refreshDevices: () => Promise<void>;
}

const DeviceContext = createContext<DeviceContextValue | undefined>(undefined);
const STORAGE_KEY = 'paygo_selected_device';

export function DeviceProvider({ children }: { children: React.ReactNode }) {
  const [devices, setDevices] = useState<OwnerDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [deviceError, setDeviceError] = useState('');

  const refreshDevices = useCallback(async () => {
    try {
      setDeviceError('');
      const response = await apiClient<{ success: boolean; devices: OwnerDevice[] }>('/api/owner/devices');
      const available = response.devices || [];
      setDevices(available);
      setSelectedDeviceId((current) => {
        const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
        const preferred = current || saved;
        const next = preferred && available.some((d) => d.deviceId === preferred)
          ? preferred
          : available[0]?.deviceId || null;
        if (typeof window !== 'undefined' && next) localStorage.setItem(STORAGE_KEY, next);
        return next;
      });
    } catch (error: any) {
      setDeviceError(error.message || 'Unable to load your meters');
      setDevices([]);
      setSelectedDeviceId(null);
    } finally {
      setLoadingDevices(false);
    }
  }, []);

  useEffect(() => { void refreshDevices(); }, [refreshDevices]);

  const selectDevice = useCallback((deviceId: string) => {
    if (!devices.some((device) => device.deviceId === deviceId)) return;
    setSelectedDeviceId(deviceId);
    localStorage.setItem(STORAGE_KEY, deviceId);
  }, [devices]);

  const selectedDevice = useMemo(
    () => devices.find((device) => device.deviceId === selectedDeviceId) || null,
    [devices, selectedDeviceId]
  );

  return (
    <DeviceContext.Provider value={{
      devices, selectedDeviceId, selectedDevice, loadingDevices, deviceError,
      selectDevice, refreshDevices,
    }}>
      {children}
    </DeviceContext.Provider>
  );
}

export function useDevices() {
  const value = useContext(DeviceContext);
  if (!value) throw new Error('useDevices must be used within DeviceProvider');
  return value;
}
