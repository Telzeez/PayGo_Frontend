import { apiClient } from './client';
import { DeviceResponse } from '../types';

export const devicesApi = {
  claimRegisteredMeter: async (deviceId: string, claimCode: string) =>
    apiClient<{ success: boolean; deviceId: string; purpose: 'GENERATION' | 'RECEIVING'; assignmentStatus: string; message: string }>(
      '/api/meters/claim',
      { method: 'POST', requireAuth: true, body: JSON.stringify({ deviceId, claimCode }) }
    ),

  getMeterRegistry: async () =>
    apiClient<{ success: boolean; ownedMeters: Array<{
      deviceId: string; purpose: 'GENERATION' | 'RECEIVING'; assignmentStatus: string;
      status: 'ONLINE' | 'OFFLINE'; balance: number; lastSeenAt: string | null; lastUpdated: string | null;
    }>; customerMeters: Array<{ deviceId: string; purpose: string; assignmentStatus: string; status: 'ONLINE' | 'OFFLINE'; balance: number; lastSeenAt: string | null; lastUpdated: string | null }> }>(
      '/api/meters/me', { method: 'GET', requireAuth: true }
    ),

  provisionMeter: async (deviceId: string, ownerId: number, purpose: 'GENERATION' | 'RECEIVING', connectionId?: number) =>
    apiClient<{ success: boolean; deviceId: string; ownerId: number; activationEmailSent: boolean; activationCode?: string | null; expiresInHours: number; message: string }>(
      `/api/owner/devices/${encodeURIComponent(deviceId)}/provision`,
      { method: 'POST', requireAuth: true, body: JSON.stringify({ ownerId, purpose, ...(connectionId ? { connectionId } : {}) }) }
    ),

  resendActivationCode: async (deviceId: string) =>
    apiClient<{ success: boolean; deviceId: string; activationEmailSent: boolean; activationCode?: string | null; expiresInHours: number; message: string }>(
      `/api/owner/devices/${encodeURIComponent(deviceId)}/resend-activation`,
      { method: 'POST', requireAuth: true, body: JSON.stringify({}) }
    ),

  activateAssignedMeter: async (deviceId: string, activationCode: string) =>
    apiClient<{ success: boolean; deviceId: string; message: string }>(
      '/api/owner/devices/activate',
      { method: 'POST', requireAuth: true, body: JSON.stringify({ deviceId, activationCode }) }
    ),

  getDevices: async () => apiClient<{ success: boolean; devices: Array<{
    deviceId: string; balance: number; status: 'ONLINE' | 'OFFLINE'; assignmentStatus: 'UNASSIGNED' | 'ASSIGNED' | 'ACTIVATED' | 'SUSPENDED'; meterPurpose: 'GENERATION' | 'RECEIVING';
    lastSeenAt: string | null; lastUpdated: string | null;
  }> }>('/api/owner/devices', { method: 'GET', requireAuth: true }),

  rotateDeviceApiKey: async (deviceId: string) =>
    apiClient<{ success: boolean; deviceId: string; deviceApiKey: string; message: string }>(
      `/api/owner/devices/${encodeURIComponent(deviceId)}/rotate-api-key`,
      { method: 'POST', requireAuth: true, body: JSON.stringify({}) }
    ),

  getPlatformDevice: async (deviceId: string) =>
    apiClient<DeviceResponse>(`/api/devices/${encodeURIComponent(deviceId)}`, { method: 'GET', requireAuth: true }),

  getDeviceSummary: async (deviceId: string) =>
    apiClient<{
      success: boolean;
      meter: {
        deviceId: string;
        balance: number;
        status: 'ONLINE' | 'OFFLINE';
        lastSeenAt: string | null;
        lastUpdated: string | null;
      };
    }>(`/api/meters/${encodeURIComponent(deviceId)}/summary`, { method: 'GET', requireAuth: true }),

  getDevice: async (deviceId: string) => {
    const response = await apiClient<{
      success: boolean;
      meter: {
        deviceId: string; balance: number; status: 'ONLINE' | 'OFFLINE';
        lastSeenAt: string | null; lastUpdated: string | null;
      };
      transactions: DeviceResponse['transactions'];
      readings: Array<{ id: number; kwhConsumed: number; source: string; recordedAt: string }>;
    }>(`/api/meters/${encodeURIComponent(deviceId)}`, { method: 'GET', requireAuth: true });
    return {
      success: response.success,
      deviceId: response.meter.deviceId,
      balance: response.meter.balance,
      status: response.meter.status,
      lastSeenAt: response.meter.lastSeenAt,
      lastUpdated: response.meter.lastUpdated || response.meter.lastSeenAt || '',
      transactions: response.transactions,
      readings: response.readings,
    } as DeviceResponse & { readings: Array<{ id: number; kwhConsumed: number; source: string; recordedAt: string }> };
  },

  resetBalance: async (deviceId: string) => apiClient<{ success: boolean; deviceId: string; balance: number; previousBalance: number; message: string }>(
    `/api/owner/devices/${encodeURIComponent(deviceId)}/reset-balance`,
    { method: 'POST', requireAuth: true, body: JSON.stringify({}) }
  ),

  getConsumption: async (deviceId: string, period: 'day' | 'week' | 'month' | 'year') =>
    apiClient<{ success: boolean; deviceId: string; period: string; readings: Array<{ date: string; kwhConsumed: number }> }>(
      `/api/owner/devices/${encodeURIComponent(deviceId)}/consumption?period=${period}`,
      { method: 'GET', requireAuth: true }
    ),

  getTokens: async (deviceId: string) => apiClient<{ success: boolean; deviceId: string; tokens: any[] }>(
    `/api/devices/${encodeURIComponent(deviceId)}/tokens`,
    { method: 'GET', requireAuth: true }
  )
};
