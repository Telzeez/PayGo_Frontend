"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { devicesApi } from '@/lib/api/devices';
import { useDevices } from '@/lib/contexts/DeviceContext';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function MeterSetupPage() {
  const [deviceId, setDeviceId] = useState('');
  const [activationCode, setActivationCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { refreshDevices } = useDevices();
  const [assignedMeters, setAssignedMeters] = useState<Array<{ deviceId: string; status: 'ONLINE' | 'OFFLINE'; assignmentStatus: string; meterPurpose: string }>>([]);
  const { refreshUser } = useAuth();

  useEffect(() => {
    devicesApi.getDevices().then((response) => setAssignedMeters(response.devices || [])).catch(() => setAssignedMeters([]));
  }, []);

  const handleActivate = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const response = await devicesApi.activateAssignedMeter(deviceId.trim(), activationCode.trim());
      setSuccess(response.message || 'PAYGO meter activated successfully.');
      setActivationCode('');
      await refreshDevices();
      await refreshUser();
      const updated = await devicesApi.getDevices();
      setAssignedMeters(updated.devices || []);
    } catch (err: any) {
      setError(err.message || 'Unable to activate this meter. Check the details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Link href="/meters/claim" className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-700 dark:text-amber-300">Have a registered PAYGO meter? Claim it here →</Link>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">PAYGO meter activation</p>
        <h1 className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">Activate your assigned meter</h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          PAYGO has already registered and assigned your physical meter. Enter the meter ID and the one-time activation code supplied to you to unlock it on your account.
        </p>
      </div>

      {error && <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">{error}</div>}
      {success && <div role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">{success}</div>}

      <section className="rounded-3xl border border-zinc-200/70 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#121214]">
        <form onSubmit={handleActivate} className="space-y-4">
          <div>
            <label htmlFor="meter-device-id" className="mb-2 block text-sm font-semibold text-zinc-800 dark:text-zinc-200">Meter device ID</label>
            <input id="meter-device-id" value={deviceId} onChange={(event) => setDeviceId(event.target.value)} required minLength={3} maxLength={50} pattern="[A-Za-z0-9][A-Za-z0-9_-]{2,49}" placeholder="e.g. PAYGO-001" className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 font-mono text-sm text-zinc-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" />
          </div>
          <div>
            <label htmlFor="activation-code" className="mb-2 block text-sm font-semibold text-zinc-800 dark:text-zinc-200">One-time activation code</label>
            <input id="activation-code" value={activationCode} onChange={(event) => setActivationCode(event.target.value.toUpperCase())} required minLength={10} maxLength={10} pattern="[A-Fa-f0-9]{10}" placeholder="10-character code" autoComplete="one-time-code" className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 font-mono text-sm uppercase tracking-[0.2em] text-zinc-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" />
            <p className="mt-2 text-xs text-zinc-400">The code expires after 72 hours and can only be used once.</p>
          </div>
          <button type="submit" disabled={submitting || !deviceId.trim() || activationCode.length !== 10} className="w-full rounded-xl bg-amber-500 px-4 py-3 font-bold text-zinc-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50">
            {submitting ? 'Verifying activation…' : 'Verify and activate meter'}
          </button>
        </form>
      </section>

      <section className="rounded-3xl border border-zinc-200/70 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#121214]">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold text-zinc-900 dark:text-white">Meters assigned to your account</h2>
          <span className="text-xs text-zinc-400">{assignedMeters.length} assigned</span>
        </div>
        {assignedMeters.length === 0 ? <p className="text-sm text-zinc-500">No meter has been assigned to this account yet. Contact PAYGO support if you expected one.</p> : (
          <ul className="space-y-2">
            {assignedMeters.map((device) => (
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
        <Link href="/marketplace/seller" className="rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">Continue seller setup</Link>
      </div>
    </div>
  );
}
