"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { devicesApi } from '@/lib/api/devices';
import { useDevices } from '@/lib/contexts/DeviceContext';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function ClaimMeterPage() {
  const [deviceId, setDeviceId] = useState('DEVICE-001');
  const [claimCode, setClaimCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [meters, setMeters] = useState<Array<{deviceId:string; purpose:'GENERATION'|'RECEIVING'; status:string; assignmentStatus:string}>>([]);
  const { refreshDevices } = useDevices();
  const { refreshUser } = useAuth();

  const loadMeters = async () => {
    try {
      const result = await devicesApi.getMeterRegistry();
      setMeters(result.ownedMeters || []);
    } catch {
      setMeters([]);
    }
  };

  useEffect(() => { void loadMeters(); }, []);

  const handleClaim = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const result = await devicesApi.claimRegisteredMeter(deviceId.trim(), claimCode.trim());
      setSuccess(result.message);
      setClaimCode('');
      await Promise.all([refreshDevices(), refreshUser(), loadMeters()]);
    } catch (err: any) {
      setError(err.message || 'Unable to claim this meter. Check the meter ID and one-time code.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">Prosumer meter setup</p>
        <h1 className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">Claim your PAYGO meter</h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          Enter the meter ID and its one-time claim code. The meter's registered purpose is verified by PAYGO; you cannot change it here. Your generation meter stays with you.
        </p>
      </div>

      {error && <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">{error}</div>}
      {success && <div role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">{success}</div>}

      <section className="rounded-3xl border border-zinc-200/70 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#121214]">
        <form onSubmit={handleClaim} className="space-y-4">
          <div>
            <label htmlFor="claim-device-id" className="mb-2 block text-sm font-semibold text-zinc-800 dark:text-zinc-200">Meter device ID</label>
            <input id="claim-device-id" value={deviceId} onChange={event => setDeviceId(event.target.value)} required minLength={3} maxLength={50} pattern="[A-Za-z0-9][A-Za-z0-9_-]{2,49}" className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 font-mono text-sm text-zinc-900 outline-none focus:border-amber-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" />
          </div>
          <div>
            <label htmlFor="claim-code" className="mb-2 block text-sm font-semibold text-zinc-800 dark:text-zinc-200">One-time claim code</label>
            <input id="claim-code" value={claimCode} onChange={event => setClaimCode(event.target.value.toUpperCase())} required minLength={32} maxLength={32} pattern="[A-Fa-f0-9]{32}" autoComplete="one-time-code" placeholder="32-character code" className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 font-mono text-sm uppercase tracking-wider text-zinc-900 outline-none focus:border-amber-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" />
            <p className="mt-2 text-xs text-zinc-400">The code is single-use and expires 30 days after issue. Never share it publicly.</p>
          </div>
          <button type="submit" disabled={submitting || !deviceId.trim() || claimCode.length !== 32} className="w-full rounded-xl bg-amber-500 px-4 py-3 font-bold text-zinc-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50">
            {submitting ? 'Claiming meter…' : 'Claim meter'}
          </button>
        </form>
      </section>

      <section className="rounded-3xl border border-zinc-200/70 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#121214]">
        <h2 className="mb-3 font-bold text-zinc-900 dark:text-white">Your registered meters</h2>
        {meters.length === 0 ? <p className="text-sm text-zinc-500">No meters are linked to this account yet.</p> : (
          <ul className="space-y-2">{meters.map(meter => (
            <li key={meter.deviceId} className="flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3 text-sm dark:bg-zinc-900">
              <span><span className="font-mono font-semibold">{meter.deviceId}</span><span className="ml-2 text-xs text-zinc-500">{meter.purpose}</span></span>
              <span className="text-xs font-semibold text-zinc-500">{meter.status} · {meter.assignmentStatus}</span>
            </li>
          ))}</ul>
        )}
      </section>
      <Link href="/meters" className="text-sm font-semibold text-amber-600 hover:underline">Back to meter settings</Link>
    </div>
  );
}
