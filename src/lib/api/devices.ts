import { apiClient } from './client';
import { AccountDevice, DeviceResponse } from '../types';

export const devicesApi = {
  getMyDevices: async () => {
    return apiClient<{
      success: boolean;
      devices: AccountDevice[];
      selectedDeviceId: string | null;
    }>('/api/devices/mine', {
      method: 'GET',
      requireAuth: true,
    });
  },

  getSelectedDevice: async () => {
    const accountDevices = await devicesApi.getMyDevices();
    if (!accountDevices.success) {
      throw new Error('Unable to load your linked meters.');
    }
    if (!accountDevices.selectedDeviceId) {
      return null;
    }
    return devicesApi.getDevice(accountDevices.selectedDeviceId);
  },

  selectMyDevice: async (deviceId: string) => {
    return apiClient<{ success: boolean; selectedDeviceId: string }>(
      '/api/devices/mine/selected',
      {
        method: 'PUT',
        body: JSON.stringify({ deviceId }),
        requireAuth: true,
      }
    );
  },

  getDevice: async (deviceId: string) => {
    return apiClient<DeviceResponse>(`/api/devices/${encodeURIComponent(deviceId)}`, {
      method: 'GET',
      requireAuth: true,
    });
  },

  resetBalance: async (deviceId: string) => {
    return apiClient<{ success: boolean; deviceId: string; balance: number; message: string }>(
      `/api/admin/devices/${encodeURIComponent(deviceId)}/balance/reset`,
      {
        method: 'PUT',
        requireAuth: true,
      }
    );
  }
};
