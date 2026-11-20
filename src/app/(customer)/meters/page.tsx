"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { devicesApi } from '@/lib/api/devices';
import { useDevices } from '@/lib/contexts/DeviceContext';

export default function MeterSetupPage() {
  const [deviceId, setDeviceId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { devices, refreshDevices } = useDevices();

  const handleConnect = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const response = await devicesApi.claimDevice(deviceId.trim());
      setSuccess(response.message || 'Meter connected successfully.');
      setDeviceId('');
      await refreshDevices();
    } catch (err: any) {
      setError(err.message || 'Unable to connect this meter.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">Meter setup</p>
        <h1 className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">Connect your PAYGO meter</h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          Enter the device ID printed on your PAYGO meter. The meter must have connected to the PAYGO server at least once before it can be linked.
        </p>
      </div>

      {error && <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">{error}</div>}
      {success && <div role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">{success}</div>}

      <section className="rounded-3xl border border-zinc-200/70 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#121214]">
        <form onSubmit={handleConnect} className="space-y-4">
          <div>
            <label htmlFor="meter-device-id" className="mb-2 block text-sm font-semibold text-zinc-800 dark:text-zinc-200">Meter device ID</label>
            <input
              id="meter-device-id"
              value={deviceId}
              onChange={(event) => setDeviceId(event.target.value)}
              required
              minLength={3}
              maxLength={50}
              pattern="[A-Za-z0-9][A-Za-z0-9_-]{2,49}"
              placeholder="e.g. PAYGO-001"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 font-mono text-sm text-zinc-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
            <p className="mt-2 text-xs text-zinc-400">Use the exact ID configured in the ESP32 firmware.</p>
          </div>
          <button type="submit" disabled={submitting || !deviceId.trim()} className="w-full rounded-xl bg-amber-500 px-4 py-3 font-bold text-zinc-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50">
            {submitting ? 'Connecting meter…' : 'Connect meter to my account'}
          </button>
        </form>
      </section>

      <section className="rounded-3xl border border-zinc-200/70 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#121214]">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold text-zinc-900 dark:text-white">Your connected meters</h2>
          <span className="text-xs text-zinc-400">{devices.length} connected</span>
        </div>
        {devices.length === 0 ? (
          <p className="text-sm text-zinc-500">No meters connected yet.</p>
        ) : (
          <ul className="space-y-2">
            {devices.map((device) => (
              <li key={device.deviceId} className="flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3 text-sm dark:bg-zinc-900">
                <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">{device.deviceId}</span>
                <span className={device.status === 'ONLINE' ? 'text-xs font-semibold text-emerald-600' : 'text-xs font-semibold text-zinc-400'}>{device.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard" className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-700 dark:border-zinc-700 dark:text-zinc-200">Back to dashboard</Link>
        <Link href="/marketplace/seller" className="rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">Set up as an energy seller</Link>
      </div>
    </div>
  );
}
