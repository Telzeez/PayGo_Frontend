"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { devicesApi } from '@/lib/api/devices';
import { DeviceResponse } from '@/lib/types';

const DEVICE_ID = 'DEVICE-001';

export default function ResetDeviceBalancePage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [device, setDevice] = useState<DeviceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isAuthLoading || user?.role !== 'OWNER') return;

    let active = true;

    devicesApi.getDevice(DEVICE_ID)
      .then((response) => {
        if (active && response.success) {
          setDevice(response);
        }
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load device balance.');
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isAuthLoading, user?.role]);

  const handleReset = async () => {
    if (confirmation !== DEVICE_ID || isResetting) return;

    setIsResetting(true);
    setError('');
    setSuccess('');

    try {
      const response = await devicesApi.resetBalance(DEVICE_ID);
      if (!response.success) {
        throw new Error('Unable to reset device balance.');
      }
      setDevice((current) => current ? { ...current, balance: response.balance } : current);
      setSuccess(response.message);
      setConfirmation('');
    } catch (resetError: unknown) {
      setError(resetError instanceof Error ? resetError.message : 'Unable to reset device balance.');
    } finally {
      setIsResetting(false);
    }
  };

  if (isAuthLoading) {
    return <p className="p-6 text-sm text-zinc-500">Checking administrator access…</p>;
  }

  if (user?.role !== 'OWNER') {
    return (
      <section className="max-w-xl mx-auto p-6 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-3xl">
        <h1 className="text-lg font-bold text-zinc-900 dark:text-white">Administrator access required</h1>
        <p className="mt-2 text-sm text-zinc-500">This page is available only to owner accounts.</p>
        <Link href="/dashboard" className="inline-block mt-5 text-sm font-semibold text-amber-600">Return to dashboard</Link>
      </section>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
      <div>
        <Link href="/admin" className="text-sm font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
          ← Admin dashboard
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-zinc-900 dark:text-white">Reset Device Balance</h1>
        <p className="mt-1 text-sm text-zinc-500">Hidden owner tool for clearing a device’s server-side energy balance.</p>
      </div>

      <section className="rounded-3xl border border-red-200 dark:border-red-500/30 bg-white dark:bg-[#121214] p-6 space-y-5">
        <div className="rounded-2xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-300">
          This sets the backend balance to 0 kWh and marks the meter offline. Transaction history is preserved. It does not send a reset command to the physical meter, so a later hardware heartbeat may restore the meter-reported balance.
        </div>

        <div className="space-y-1">
          <label htmlFor="device-id" className="block text-xs font-semibold text-zinc-500">Select device</label>
          <select
            id="device-id"
            value={DEVICE_ID}
            disabled
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-4 py-3 text-sm font-mono text-zinc-900 dark:text-white"
          >
            <option value={DEVICE_ID}>{DEVICE_ID}</option>
          </select>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-zinc-50 dark:bg-zinc-900 p-4">
          <span className="text-sm text-zinc-500">Current server balance</span>
          <span className="text-lg font-bold text-zinc-900 dark:text-white">
            {isLoading ? 'Loading…' : `${Number(device?.balance ?? 0).toFixed(2)} kWh`}
          </span>
        </div>

        {error && <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}
        {success && <p role="status" className="text-sm font-medium text-emerald-700 dark:text-emerald-400">{success}</p>}

        <div className="space-y-2">
          <label htmlFor="reset-confirmation" className="block text-xs font-semibold text-zinc-500">
            Type {DEVICE_ID} to confirm
          </label>
          <input
            id="reset-confirmation"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            autoComplete="off"
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-3 text-sm font-mono text-zinc-900 dark:text-white"
          />
        </div>

        <button
          type="button"
          onClick={handleReset}
          disabled={isLoading || isResetting || confirmation !== DEVICE_ID}
          className="w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isResetting ? 'Resetting…' : 'Reset balance to 0 kWh'}
        </button>
      </section>
    </div>
  );
}
