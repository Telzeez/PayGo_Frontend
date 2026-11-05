import { apiClient } from './client';
import { DeviceResponse } from '../types';

export const devicesApi = {
  getDevice: async (deviceId: string) => {
    return apiClient<DeviceResponse>(`/api/devices/${encodeURIComponent(deviceId)}`, {
      method: 'GET',
      requireAuth: true,
    });
  },

  getTokens: async (deviceId: string) => {
    return apiClient<{ success: boolean; deviceId: string; tokens: any[] }>(`/api/devices/${encodeURIComponent(deviceId)}/tokens`, {
      method: 'GET',
      requireAuth: true,
    });
  }
};
