import { apiClient } from './client';
import { DeviceResponse } from '../types';

export const devicesApi = {
  getDevices: async () => apiClient<{ success: boolean; devices: Array<{
    deviceId: string; balance: number; status: 'ONLINE' | 'OFFLINE';
    lastSeenAt: string | null; lastUpdated: string | null;
  }> }>('/api/owner/devices', { method: 'GET', requireAuth: true }),

  getDevice: async (deviceId: string) =>
    apiClient<DeviceResponse & { readings?: Array<{ id: number; kwhConsumed: number; source: string; recordedAt: string }> }>(
      `/api/owner/devices/${encodeURIComponent(deviceId)}`,
      { method: 'GET', requireAuth: true }
    ),

  getTokens: async (deviceId: string) => {
    return apiClient<{ success: boolean; deviceId: string; tokens: any[] }>(
      `/api/devices/${encodeURIComponent(deviceId)}/tokens`,
      { method: 'GET', requireAuth: true }
    );
  }
};
