"use client";

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { reauthenticateFirebase } from '@/lib/firebase/auth';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isAdmin = isAuthenticated && user?.role === 'ADMIN';
  const [password, setPassword] = useState('');
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');

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

  const handleReauthentication = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?.email || !password || verifying) return;

    setVerifying(true);
    setError('');
    try {
      await reauthenticateFirebase(user.email, password);
      setPassword('');
      setVerified(true);
    } catch (verificationError: any) {
      setError(verificationError?.message || 'Password verification failed. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  if (isLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] dark:bg-[#09090B]">
        <p className="text-sm font-medium text-zinc-500">
          {isLoading ? 'Verifying administrator access…' : 'Redirecting…'}
        </p>
      </div>
    );
  }

  if (!verified) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#F9FAFB] px-4 dark:bg-[#09090B]">
        <section className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-600">PAYGO administrator</p>
          <h1 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">Verify it’s you</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Re-enter your PAYGO password to continue to the admin dashboard.
          </p>
          <form onSubmit={handleReauthentication} className="mt-6 space-y-4">
            <div>
              <label htmlFor="admin-email" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Email address</label>
              <input
                id="admin-email"
                type="email"
                value={user?.email || ''}
                readOnly
                autoComplete="username"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-100 px-3 py-3 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
              />
            </div>
            <div>
              <label htmlFor="admin-password" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
                autoFocus
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                placeholder="Enter your PAYGO password"
              />
            </div>
            {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">{error}</p>}
            <button
              type="submit"
              disabled={verifying || !password}
              className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {verifying ? 'Verifying…' : 'Continue to admin dashboard'}
            </button>
          </form>
          <button
            type="button"
            onClick={() => router.replace('/dashboard')}
            className="mt-4 w-full text-center text-sm font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          >
            Cancel and return to dashboard
          </button>
        </section>
      </main>
    );
  }

  return <>{children}</>;
}
