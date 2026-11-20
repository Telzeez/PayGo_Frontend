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
