"use client";

import React, { useState } from 'react';
import { devicesApi } from '@/lib/api/devices';
import PayoutAccountForm from '@/components/admin/PayoutAccountForm';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [assignmentDeviceId, setAssignmentDeviceId] = useState('');
  const [assignmentEmail, setAssignmentEmail] = useState('');
  const [assignmentMessage, setAssignmentMessage] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  const handleAssignMeter = async (event: React.FormEvent) => {
    event.preventDefault();
    setAssignmentMessage('');
    setIsAssigning(true);
    try {
      const result = await devicesApi.linkDeviceToAccount(assignmentDeviceId.trim(), assignmentEmail.trim());
      if (!result.success) {
        throw new Error('Failed to link meter to the account.');
      }
      setAssignmentMessage('Meter linked to the account successfully.');
      setAssignmentDeviceId('');
      setAssignmentEmail('');
    } catch (err) {
      setAssignmentMessage(err instanceof Error ? err.message : 'Failed to link meter.');
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="mx-auto w-full min-w-0 max-w-6xl space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex min-w-0 flex-col justify-between gap-4 border-b border-zinc-200 pb-5 dark:border-zinc-800 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
              OWNER / ADMIN DASHBOARD
            </span>
          </div>
          <h1 className="mt-1 break-words text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
            Platform Hardware & Meter Control
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

      <PayoutAccountForm />

      <section className="min-w-0 rounded-3xl border border-zinc-200/60 bg-white p-5 shadow-sm dark:border-zinc-800/60 dark:bg-[#121214] sm:p-6">
        <h2 className="text-base font-bold text-zinc-900 dark:text-white">Link a registered meter to a customer</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Only existing meters can be linked. Each meter can belong to one account; new assignments do not move existing balances.
        </p>
        <form onSubmit={handleAssignMeter} className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
            <input
              required
              minLength={3}
              value={assignmentDeviceId}
              onChange={(event) => setAssignmentDeviceId(event.target.value)}
              placeholder="Registered meter ID"
              aria-label="Registered meter ID"
              className="w-full min-w-0 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
            <input
              required
              type="email"
              value={assignmentEmail}
              onChange={(event) => setAssignmentEmail(event.target.value)}
              placeholder="Customer account email"
              aria-label="Customer account email"
              className="w-full min-w-0 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
          <button
            type="submit"
            disabled={isAssigning}
            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 sm:col-span-2 lg:col-span-1"
          >
            {isAssigning ? 'Linking…' : 'Link meter'}
          </button>
        </form>
        {assignmentMessage && <p role="status" className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">{assignmentMessage}</p>}
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
