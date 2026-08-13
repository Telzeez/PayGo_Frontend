import { apiClient } from './client';
import { AuthResponse } from '../types';

export interface LoginParams {
  email: string;
  password: string;
}

export interface RegisterParams {
  email: string;
  password: string;
  phone?: string;
  role: string;
}

export const authApi = {
  login: async (data: LoginParams) => {
    return apiClient<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
      requireAuth: false,
    });
  },

  register: async (data: RegisterParams) => {
    return apiClient<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
      requireAuth: false,
    });
  },

  getMe: async () => {
    return apiClient<{ success: boolean; user: AuthResponse['user'] }>('/api/auth/me', {
      method: 'GET',
      requireAuth: true,
    });
  },

  logout: async () => {
    return apiClient<{ success: boolean; message: string }>('/api/auth/logout', {
      method: 'POST',
      requireAuth: true,
    });
  },

  updateProfile: async (data: { email?: string; phone?: string; newPassword?: string }) => {
    return apiClient<{ success: boolean; message: string; user: AuthResponse['user'] }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
      requireAuth: true,
    });
  }
};
