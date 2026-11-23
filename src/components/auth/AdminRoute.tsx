"use client";

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isAdmin = isAuthenticated && user?.role === 'ADMIN';

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!isAdmin) {
      router.replace(user?.isBuyer || user?.isSeller ? '/dashboard' : '/onboarding');
    }
  }, [isLoading, isAuthenticated, isAdmin, user, router, pathname]);

  if (isLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] dark:bg-[#09090B]">
        <p className="text-sm font-medium text-zinc-500">
          {isLoading ? 'Verifying administrator access…' : 'Redirecting…'}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
