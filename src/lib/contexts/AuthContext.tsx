"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile } from '../types';
import { authApi, LoginParams, RegisterParams } from '../api/auth';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (params: LoginParams) => Promise<void>;
  register: (params: RegisterParams) => Promise<void>;
  updateProfile: (data: { email?: string; phone?: string; newPassword?: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('paygo_token');
      if (token) {
        try {
          const res = await authApi.getMe();
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            localStorage.removeItem('paygo_token');
          }
        } catch (error) {
          console.error("Failed to restore session:", error);
          localStorage.removeItem('paygo_token');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (params: LoginParams) => {
    const res = await authApi.login(params);
    if (res.success && res.token && res.user) {
      localStorage.setItem('paygo_token', res.token);
      setUser(res.user);
    }
  };

  const register = async (params: RegisterParams) => {
    const res = await authApi.register(params);
    if (res.success && res.token && res.user) {
      localStorage.setItem('paygo_token', res.token);
      setUser(res.user);
    }
  };

  const updateProfile = async (data: { email?: string; phone?: string; newPassword?: string }) => {
    const res = await authApi.updateProfile(data);
    if (res.success && res.user) {
      setUser(res.user);
    }
  };

  const logout = () => {
    localStorage.removeItem('paygo_token');
    setUser(null);
    authApi.logout().catch(console.error);
    window.location.href = '/login';
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    updateProfile,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
