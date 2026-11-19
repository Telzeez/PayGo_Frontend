import React from 'react';
import AppShell from '@/components/layout/AppShell';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DeviceProvider } from '@/lib/contexts/DeviceContext';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <DeviceProvider>
        <AppShell>
          {children}
        </AppShell>
      </DeviceProvider>
    </ProtectedRoute>
  );
}
