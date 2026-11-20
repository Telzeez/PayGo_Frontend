import { apiClient } from './client';
import { UserProfile } from '../types';

export const authApi = {
  syncFirebaseProfile: async (data: { phone?: string; role?: string }) => {
    return apiClient<{ success: boolean; user: UserProfile }>('/api/auth/sync', {
      method: 'POST',
      body: JSON.stringify(data),
      requireAuth: true,
    });
  },

  activateCapability: async (capability: 'BUYER' | 'SELLER') => {
    return apiClient<{ success: boolean; user: UserProfile }>('/api/auth/capabilities', {
      method: 'POST',
      body: JSON.stringify({ capability }),
      requireAuth: true,
    });
  },

  getMe: async () => {
    return apiClient<{ success: boolean; user: UserProfile }>('/api/auth/me', {
      method: 'GET',
      requireAuth: true,
    });
  },

  updateProfile: async (data: { phone?: string }) => {
    return apiClient<{ success: boolean; message: string; user: UserProfile }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
      requireAuth: true,
    });
  },
};
