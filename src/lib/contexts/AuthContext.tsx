"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile } from '../types';
import { authApi } from '../api/auth';
import {
  clearFirebaseSession,
  createFirebaseAccount,
  getFirebaseAccount,
  getFirebaseIdToken,
  getPendingAccountRole,
  sendFirebasePasswordReset,
  sendFirebaseVerificationEmail,
  signInFirebase,
  signInFirebaseWithGoogle,
  updateFirebaseCredentials,
  verifyFirebaseEmailCode,
  setPendingAccountRole,
} from '../firebase/auth';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (params: { email: string; password: string }) => Promise<void>;
  loginWithGoogle: (token: string, role?: string) => Promise<{ needsRegistration?: boolean; registrationToken?: string } | void>;
  registerGoogle: (params: { registrationToken: string; phone?: string; role: string }) => Promise<void>;
  register: (params: { email: string; password: string; phone?: string; role: string }) => Promise<{ requiresEmailVerification?: boolean; email?: string }>;
  verifyEmail: (oobCode: string) => Promise<string | undefined>;
  resendVerification: (email: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (data: { email?: string; phone?: string; newPassword?: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const syncProfile = async (phone?: string, role?: string) => {
    const result = await authApi.syncFirebaseProfile({ phone, role });
    setUser(result.user);
    return result.user;
  };

  useEffect(() => {
    let active = true;
    const initialize = async () => {
      try {
        const idToken = await getFirebaseIdToken();
        if (!idToken) return;
        const account = await getFirebaseAccount(idToken);
        if (!account.emailVerified) return;
        const result = await authApi.getMe().catch(async () => authApi.syncFirebaseProfile({}));
        if (active && result.success) setUser(result.user);
      } catch (error) {
        console.error('Failed to restore Firebase session:', error);
        if (active) setUser(null);
      } finally {
        if (active) setIsLoading(false);
      }
    };
    initialize();
    return () => { active = false; };
  }, []);

  const login = async ({ email, password }: { email: string; password: string }) => {
    const session = await signInFirebase(email, password);
    const account = await getFirebaseAccount(session.idToken);
    if (!account.emailVerified) {
      await sendFirebaseVerificationEmail(session.idToken);
      const error: any = new Error('Your account is not verified yet. We have sent you a new verification email.');
      error.status = 403;
      error.data = { code: 'EMAIL_NOT_VERIFIED' };
      throw error;
    }
    await syncProfile();
  };

  const loginWithGoogle = async (googleCredential: string, role?: string) => {
    const session = await signInFirebaseWithGoogle(googleCredential);
    const account = await getFirebaseAccount(session.idToken);
    if (!account.emailVerified) {
      await sendFirebaseVerificationEmail(session.idToken);
      throw new Error('Please verify your Google account email before continuing.');
    }
    await syncProfile(undefined, role);
  };

  const registerGoogle = async (_params: { registrationToken: string; phone?: string; role: string }) => {
    throw new Error('Google account registration is now completed through Firebase. Please use Continue with Google again.');
  };

  const register = async (params: { email: string; password: string; phone?: string; role: string }) => {
    setPendingAccountRole(params.role);
    const session = await createFirebaseAccount(params.email, params.password);
    await sendFirebaseVerificationEmail(session.idToken);
    return { requiresEmailVerification: true, email: params.email.trim().toLowerCase() };
  };

  const verifyEmail = async (oobCode: string): Promise<string | undefined> => {
    const session = await verifyFirebaseEmailCode(oobCode);
    const account = await getFirebaseAccount(session.idToken);
    if (!account.emailVerified) throw new Error('Firebase has not confirmed this email address yet.');
    const profile = await syncProfile(undefined, getPendingAccountRole());
    return profile.role;
  };

  const resendVerification = async (_email: string) => {
    const idToken = await getFirebaseIdToken();
    if (!idToken) throw new Error('Please sign in with your email and password first, then request another verification email.');
    await sendFirebaseVerificationEmail(idToken);
  };

  const sendPasswordReset = async (email: string) => {
    await sendFirebasePasswordReset(email);
  };

  const refreshUser = async () => {
    const idToken = await getFirebaseIdToken();
    if (!idToken) {
      setUser(null);
      return;
    }
    const account = await getFirebaseAccount(idToken);
    if (!account.emailVerified) {
      setUser(null);
      return;
    }
    const result = await authApi.syncFirebaseProfile({});
    setUser(result.user);
  };

  const updateProfile = async (data: { email?: string; phone?: string; newPassword?: string }) => {
    if (data.phone !== undefined) {
      const result = await authApi.updateProfile({ phone: data.phone });
      setUser(result.user);
    }

    if (data.email || data.newPassword) {
      const session = await updateFirebaseCredentials({
        email: data.email,
        password: data.newPassword,
      });
      if (data.email) {
        await sendFirebaseVerificationEmail(session.idToken);
        setUser(null);
        throw new Error('A verification email has been sent to your new address. Verify it before continuing to use PAYGO.');
      }
    }
  };

  const logout = () => {
    clearFirebaseSession();
    setUser(null);
    window.location.href = '/login';
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    loginWithGoogle,
    register,
    registerGoogle,
    verifyEmail,
    resendVerification,
    sendPasswordReset,
    refreshUser,
    updateProfile,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
