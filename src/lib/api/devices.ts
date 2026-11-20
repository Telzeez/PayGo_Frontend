import { apiClient } from './client';
import { DeviceResponse } from '../types';

export const devicesApi = {
  activateAssignedMeter: async (deviceId: string, activationCode: string) =>
    apiClient<{ success: boolean; deviceId: string; message: string }>(
      '/api/owner/devices/activate',
      { method: 'POST', requireAuth: true, body: JSON.stringify({ deviceId, activationCode }) }
    ),

  getDevices: async () => apiClient<{ success: boolean; devices: Array<{
    deviceId: string; balance: number; status: 'ONLINE' | 'OFFLINE'; assignmentStatus: 'UNASSIGNED' | 'ASSIGNED' | 'ACTIVATED' | 'SUSPENDED'; meterPurpose: 'GENERATION' | 'RECEIVING';
    lastSeenAt: string | null; lastUpdated: string | null;
  }> }>('/api/owner/devices', { method: 'GET', requireAuth: true }),

  getPlatformDevice: async (deviceId: string) =>
    apiClient<DeviceResponse>(`/api/devices/${encodeURIComponent(deviceId)}`, { method: 'GET', requireAuth: true }),

  getDevice: async (deviceId: string) =>
    apiClient<DeviceResponse & { readings?: Array<{ id: number; kwhConsumed: number; source: string; recordedAt: string }> }>(
      `/api/owner/devices/${encodeURIComponent(deviceId)}`,
      { method: 'GET', requireAuth: true }
    ),

  resetBalance: async (deviceId: string) => apiClient<{ success: boolean; deviceId: string; balance: number; previousBalance: number; message: string }>(
    `/api/owner/devices/${encodeURIComponent(deviceId)}/reset-balance`,
    { method: 'POST', requireAuth: true, body: JSON.stringify({}) }
  ),

  getConsumption: async (deviceId: string, period: 'day' | 'week' | 'month') =>
    apiClient<{ success: boolean; deviceId: string; period: string; readings: Array<{ date: string; kwhConsumed: number }> }>(
      `/api/owner/devices/${encodeURIComponent(deviceId)}/consumption?period=${period}`,
      { method: 'GET', requireAuth: true }
    ),

  getTokens: async (deviceId: string) => {
    return apiClient<{ success: boolean; deviceId: string; tokens: any[] }>(
      `/api/devices/${encodeURIComponent(deviceId)}/tokens`,
      { method: 'GET', requireAuth: true }
    );
  }
};
