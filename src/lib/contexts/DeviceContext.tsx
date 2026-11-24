"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/lib/api/client';

export interface OwnerDevice {
  deviceId: string;
  balance: number;
  status: 'ONLINE' | 'OFFLINE';
  lastSeenAt: string | null;
  lastUpdated: string | null;
  assignmentStatus?: 'UNASSIGNED' | 'ASSIGNED' | 'ACTIVATED' | 'SUSPENDED';
  meterPurpose?: 'GENERATION' | 'RECEIVING';
  isShared?: boolean;
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
      const response = await apiClient<{
        success: boolean;
        ownedMeters: Array<{
          deviceId: string; balance: number; status: 'ONLINE' | 'OFFLINE';
          lastSeenAt: string | null; lastUpdated: string | null;
          purpose: 'GENERATION' | 'RECEIVING';
          assignmentStatus: 'UNASSIGNED' | 'ASSIGNED' | 'ACTIVATED' | 'SUSPENDED';
        }>;
        customerMeters: Array<{
          deviceId: string; balance: number; status: 'ONLINE' | 'OFFLINE';
          lastSeenAt: string | null; lastUpdated: string | null; purpose: 'GENERATION' | 'RECEIVING';
          assignmentStatus: 'UNASSIGNED' | 'ASSIGNED' | 'ACTIVATED' | 'SUSPENDED';
        }>;
      }>('/api/meters/me');
      const combined = [
        ...(response.ownedMeters || []).map((meter) => ({ ...meter, meterPurpose: meter.purpose, isShared: false })),
        ...(response.customerMeters || []).map((meter) => ({
          deviceId: meter.deviceId,
          balance: meter.balance,
          status: meter.status,
          lastSeenAt: meter.lastSeenAt,
          lastUpdated: meter.lastUpdated || meter.lastSeenAt,
          assignmentStatus: meter.assignmentStatus,
          meterPurpose: meter.purpose,
          isShared: true,
        })),
      ];
      const unique = new Map(combined.map((device) => [device.deviceId, device]));
      const available = Array.from(unique.values()).filter((device) => device.assignmentStatus === 'ACTIVATED');
      setDevices((current) => {
        const unchanged = current.length === available.length && current.every((device, index) => {
          const next = available[index];
          return device.deviceId === next.deviceId &&
            device.balance === next.balance &&
            device.status === next.status &&
            device.lastSeenAt === next.lastSeenAt &&
            device.lastUpdated === next.lastUpdated &&
            device.assignmentStatus === next.assignmentStatus &&
            device.meterPurpose === next.meterPurpose &&
            device.isShared === next.isShared;
        });
        return unchanged ? current : available;
      });
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

  useEffect(() => {
    void refreshDevices();
    const interval = window.setInterval(() => { void refreshDevices(); }, 15000);
    return () => window.clearInterval(interval);
  }, [refreshDevices]);

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
