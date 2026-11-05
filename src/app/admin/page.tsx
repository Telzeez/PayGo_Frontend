"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function AdminDashboardPage() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const isOwner = user?.role?.toUpperCase() === 'OWNER';

  useEffect(() => {
    if (isAuthLoading) return;
    if (!isAuthenticated) {
      router.replace('/login?redirect=%2Fadmin');
      return;
    }
    if (!isOwner) {
      router.replace('/dashboard');
    }
  }, [isAuthLoading, isAuthenticated, isOwner, router]);

  if (isAuthLoading || (isAuthenticated && isOwner === false)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-zinc-500">
        {isAuthLoading ? 'Checking administrator access…' : 'Redirecting…'}
      </div>
    );
  }

  if (!isAuthenticated || !isOwner) {
    return null;
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-6xl space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex min-w-0 flex-col justify-between gap-4 border-b border-zinc-200 pb-5 dark:border-zinc-800 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
              LEGACY OWNER TOOLS
            </span>
          </div>
          <h1 className="mt-1 break-words text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
            Meter Assignment Tools
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/reset-balance"
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-semibold text-zinc-700 shadow-sm transition-all hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700/50"
          >
            Reset Balance
          </Link>
          <Link
            href="/dashboard"
            className="rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            Customer View
          </Link>
        </div>
      </div>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
        This is the legacy owner meter-management page, not the dedicated platform-admin portal. A separate PLATFORM_ADMIN sign-in, MFA, and staff dashboard are not available yet.
      </section>

      <section className="min-w-0 rounded-3xl border border-zinc-200/60 bg-white p-5 shadow-sm dark:border-zinc-800/60 dark:bg-[#121214] sm:p-6">
        <h2 className="text-base font-bold text-zinc-900 dark:text-white">Meter assignment is paused</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Meter-to-account assignment is disabled for this prototype. You do not need to enter a hardware ID or customer email here.
        </p>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          The shared demo meter remains available as prototype hardware and is not automatically assigned to any account.
        </p>
      </section>

      <section className="min-w-0 rounded-3xl border border-zinc-200/60 bg-white p-5 shadow-sm dark:border-zinc-800/60 dark:bg-[#121214] sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">Meter Telemetry</h2>
        </div>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Live meter status, balances, and delivery alerts are not available to owner accounts through the current admin API. Meter access is not exposed by the customer meter endpoint.
        </p>
      </section>
    </div>
  );
}
