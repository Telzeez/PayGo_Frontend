"use client";

import React, { useEffect, useState } from 'react';
import { devicesApi } from '@/lib/api/devices';
import { DeviceResponse } from '@/lib/types';
import Link from 'next/link';
import AdminRoute from '@/components/auth/AdminRoute';

function AdminDashboardContent() {
  const [deviceData, setDeviceData] = useState<DeviceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [provisionDeviceId, setProvisionDeviceId] = useState('');
  const [provisionOwnerId, setProvisionOwnerId] = useState('');
  const [meterPurpose, setMeterPurpose] = useState<'GENERATION' | 'RECEIVING'>('GENERATION');
  const [provisionConnectionId, setProvisionConnectionId] = useState('');
  const [provisioning, setProvisioning] = useState(false);
  const [provisionMessage, setProvisionMessage] = useState('');
  const [provisionError, setProvisionError] = useState('');
  const [pendingActivationDeviceId, setPendingActivationDeviceId] = useState('');
  const [pendingActivationCode, setPendingActivationCode] = useState('');
  const [resendingActivation, setResendingActivation] = useState(false);
  const [deviceApiKey, setDeviceApiKey] = useState('');
  const [rotatingApiKey, setRotatingApiKey] = useState(false);
  const [apiKeyMessage, setApiKeyMessage] = useState('');

  const DEVICE_ID = 'DEVICE-001';

  const fetchAdminData = async (isPolling = false) => {
    if (!isPolling && !deviceData) setLoading(true);
    if (isPolling) setIsRefreshing(true);
    try {
      const res = await devicesApi.getPlatformDevice(DEVICE_ID);
      if (res.success) {
        setDeviceData(res);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      if (!isPolling) setLoading(false);
      if (isPolling) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(() => fetchAdminData(true), 3000);
    return () => clearInterval(interval);
  }, []);

  const handleProvisionMeter = async (event: React.FormEvent) => {
    event.preventDefault();
    setProvisioning(true);
    setProvisionMessage('');
    setProvisionError('');
    setPendingActivationCode('');
    try {
      const response = await devicesApi.provisionMeter(
        provisionDeviceId.trim(),
        Number(provisionOwnerId),
        meterPurpose,
        meterPurpose === 'RECEIVING' ? Number(provisionConnectionId) : undefined
      );
      setProvisionMessage(response.message || 'Meter provisioned.');
      if (!response.activationEmailSent) {
        setPendingActivationDeviceId(response.deviceId);
        setPendingActivationCode(response.activationCode || '');
        setProvisionError('The meter is assigned. Email delivery failed; use the one-time code displayed below to activate it manually.');
        return;
      }
      setPendingActivationDeviceId('');
      setPendingActivationCode('');
      setProvisionDeviceId('');
      setProvisionOwnerId('');
      setProvisionConnectionId('');
    } catch (error: any) {
      setProvisionError(error.message || 'Unable to provision this meter.');
    } finally {
      setProvisioning(false);
    }
  };


  const handleResendActivation = async () => {
    if (!pendingActivationDeviceId) return;
    setResendingActivation(true);
    setProvisionError('');
    setProvisionMessage('');
    try {
      const response = await devicesApi.resendActivationCode(pendingActivationDeviceId);
      setProvisionMessage(response.message);
      setPendingActivationCode(response.activationCode || '');
      if (response.activationEmailSent) {
        setPendingActivationCode('');
        setPendingActivationDeviceId('');
        setProvisionDeviceId('');
        setProvisionOwnerId('');
        setProvisionConnectionId('');
      } else {
        setProvisionError('A fresh code was generated, but email delivery is still unavailable. Fix Gmail OAuth and retry; the previous code is no longer valid.');
      }
    } catch (error) {
      setProvisionError(error instanceof Error ? error.message : 'Unable to resend the activation code.');
    } finally {
      setResendingActivation(false);
    }
  };

  const handleRotateDeviceApiKey = async () => {
    if (!window.confirm('Rotate the API key for DEVICE-001? The currently flashed firmware will stop authenticating until you update its local DeviceConfig.h and reflash it.')) return;
    setRotatingApiKey(true);
    setDeviceApiKey('');
    setApiKeyMessage('');
    try {
      const result = await devicesApi.rotateDeviceApiKey(DEVICE_ID);
      setDeviceApiKey(result.deviceApiKey);
      setApiKeyMessage(result.message);
    } catch (error: any) {
      setProvisionError(error.message || 'Unable to rotate the device API key.');
    } finally {
      setRotatingApiKey(false);
    }
  };

  const pendingCount = deviceData?.transactions.filter(t => t.hardwareStatus === 'PENDING').length || 0;
  const failedCount = deviceData?.transactions.filter(t => t.hardwareStatus === 'FAILED').length || 0;
  const isOnline = deviceData?.status === 'ONLINE' && (!deviceData?.lastSeenAt || (Date.now() - new Date(deviceData.lastSeenAt).getTime() < 13000));

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-6xl mx-auto w-full min-w-0 p-3 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
              OWNER / ADMIN DASHBOARD
            </span>
          </div>
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mt-1">
            Platform Hardware & Meter Control
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={() => fetchAdminData(false)}
            className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-all flex items-center gap-2 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-3.5 h-3.5 ${loading || isRefreshing ? 'animate-spin' : ''}`}>
              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path>
              <path d="M21 3v5h-5"></path>
            </svg>
            Refresh Meters
          </button>
          <Link
            href="/dashboard"
            className="px-4 py-2.5 text-xs font-bold rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white transition-all shadow-sm"
          >
            Customer View
          </Link>
        </div>
      </div>


      <section className="rounded-2xl border border-amber-300/70 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Hardware API security</h2>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Rotate the device-specific credential used by the ESP32 for authenticated HTTPS requests.</p>
          </div>
          <button type="button" onClick={handleRotateDeviceApiKey} disabled={rotatingApiKey} className="rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900">
            {rotatingApiKey ? 'Generating key…' : 'Generate / rotate device key'}
          </button>
        </div>
        {deviceApiKey && (
          <div className="mt-4 rounded-xl border border-amber-300 bg-white p-3 dark:border-amber-500/30 dark:bg-zinc-950">
            <p className="text-xs font-bold text-red-600 dark:text-red-400">Copy this key now. It will not be shown again.</p>
            <code className="mt-2 block break-all rounded-lg bg-zinc-100 p-3 text-xs text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">{deviceApiKey}</code>
            <button type="button" onClick={() => navigator.clipboard.writeText(deviceApiKey)} className="mt-3 rounded-lg border border-zinc-300 px-3 py-2 text-xs font-semibold dark:border-zinc-700">Copy key</button>
            <p className="mt-2 text-xs text-zinc-500">Paste it into the local <code>DeviceConfig.h</code> as <code>PAYGO_DEVICE_API_KEY</code>, then reflash the ESP32. Do not commit or share that file.</p>
          </div>
        )}
        {apiKeyMessage && <p role="status" className="mt-3 text-xs text-zinc-600 dark:text-zinc-400">{apiKeyMessage}</p>}
      </section>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1 */}
        <div className="bg-white dark:bg-[#121214] border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm space-y-1">
          <p className="text-xs text-zinc-500 font-medium">Total Registered Meters</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">1</p>
          <p className="text-[11px] text-zinc-400">Active Compound Solar Systems</p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-[#121214] border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-5 shadow-sm space-y-1">
          <p className="text-xs text-zinc-500 font-medium">Meter Connection</p>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'}`}></span>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white">{isOnline ? '1 Online' : '0 Online'}</p>
          </div>
          <p className="text-[11px] text-zinc-400">{isOnline ? 'HiveMQ Broker Connected' : 'Meter Offline'}</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-[#121214] border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-5 shadow-sm space-y-1">
          <p className="text-xs text-zinc-500 font-medium">Pending Credits</p>
          <p className={`text-2xl font-bold ${pendingCount > 0 ? 'text-amber-500' : 'text-zinc-900 dark:text-white'}`}>
            {pendingCount}
          </p>
          <p className="text-[11px] text-zinc-400">Queued for Auto-Sync</p>
        </div>

        {/* Metric 4 */}
        <div className="bg-white dark:bg-[#121214] border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-5 shadow-sm space-y-1">
          <p className="text-xs text-zinc-500 font-medium">Failed ACK Alerts</p>
          <p className={`text-2xl font-bold ${failedCount > 0 ? 'text-red-500' : 'text-zinc-900 dark:text-white'}`}>
            {failedCount}
          </p>
          <p className="text-[11px] text-zinc-400">Requires Recovery Token</p>
        </div>
      </div>

      {/* Controlled meter assignment */}
      <section className="rounded-3xl border border-zinc-200/60 bg-white p-5 shadow-sm dark:border-zinc-800/60 dark:bg-[#121214] sm:p-6">
        <h2 className="text-base font-bold text-zinc-900 dark:text-white">Provision a PAYGO meter</h2>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Assign a meter already registered in the device registry to a verified account. The activation code is emailed to that account.</p>
        {provisionMessage && <p role="status" className="mt-3 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">{provisionMessage}</p>}
        {provisionError && <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-400">{provisionError}</p>}
        {pendingActivationDeviceId && (
          <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-3 dark:border-amber-500/30 dark:bg-amber-500/5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-amber-900 dark:text-amber-200">Meter {pendingActivationDeviceId} is assigned. Use this code on the meter activation page.</p>
              <button type="button" onClick={handleResendActivation} disabled={resendingActivation} className="shrink-0 rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-zinc-950 disabled:opacity-50">
                {resendingActivation ? 'Generating…' : 'Generate new code'}
              </button>
            </div>
            {pendingActivationCode && (
              <div className="mt-3 rounded-lg border border-amber-300/70 bg-white p-3 dark:border-amber-500/20 dark:bg-zinc-950">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">One-time activation code · expires in 72 hours</p>
                <p className="mt-1 select-all font-mono text-2xl font-bold tracking-[0.2em] text-zinc-950 dark:text-white">{pendingActivationCode}</p>
                <p className="mt-2 text-[11px] text-zinc-600 dark:text-zinc-400">Copy this code now. It is shown only once and is not stored in readable form.</p>
              </div>
            )}
          </div>
        )}
        <form onSubmit={handleProvisionMeter} className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="provision-device" className="mb-1.5 block text-xs font-semibold text-zinc-600 dark:text-zinc-300">Registered meter ID</label>
            <input id="provision-device" value={provisionDeviceId} onChange={(event) => setProvisionDeviceId(event.target.value)} disabled={provisioning} required minLength={3} maxLength={50} pattern="[A-Za-z0-9][A-Za-z0-9_-]{2,49}" placeholder="e.g. PAYGO-001" className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm font-mono dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" />
          </div>
          <div>
            <label htmlFor="provision-owner" className="mb-1.5 block text-xs font-semibold text-zinc-600 dark:text-zinc-300">Owner account user ID</label>
            <input id="provision-owner" type="number" min="1" step="1" value={provisionOwnerId} onChange={(event) => setProvisionOwnerId(event.target.value)} disabled={provisioning} required placeholder="User ID" className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" />
          </div>
          <div>
            <label htmlFor="meter-purpose" className="mb-1.5 block text-xs font-semibold text-zinc-600 dark:text-zinc-300">Meter purpose</label>
            <select id="meter-purpose" value={meterPurpose} onChange={(event) => setMeterPurpose(event.target.value as 'GENERATION' | 'RECEIVING')} disabled={provisioning} className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-white">
              <option value="GENERATION">Seller generation meter</option>
              <option value="RECEIVING">Buyer receiving meter</option>
            </select>
          </div>
          {meterPurpose === 'RECEIVING' && (
            <div>
              <label htmlFor="provision-connection" className="mb-1.5 block text-xs font-semibold text-zinc-600 dark:text-zinc-300">Approved connection ID</label>
              <input id="provision-connection" type="number" min="1" step="1" value={provisionConnectionId} onChange={(event) => setProvisionConnectionId(event.target.value)} disabled={provisioning} required placeholder="Connection ID from the approved request" className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" />
            </div>
          )}
          <div className="flex items-end">
            <button type="submit" disabled={provisioning} className="w-full rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-zinc-950 disabled:opacity-50">{provisioning ? 'Assigning meter…' : 'Assign meter and email code'}</button>
          </div>
        </form>
      </section>

      {/* Devices Overview Table */}
      <div className="bg-white dark:bg-[#121214] border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">Active Meter Registry</h2>
          <span className="text-xs text-zinc-400">Updated Real-Time</span>
        </div>

        {loading ? (
          <div className="h-32 bg-zinc-100 dark:bg-zinc-900 rounded-2xl animate-pulse"></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800/80 text-zinc-400 uppercase tracking-wider font-semibold">
                  <th className="pb-3 px-3">Device ID</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3">Current Balance</th>
                  <th className="pb-3 px-3">Pending / Failed</th>
                  <th className="pb-3 px-3">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
                  <td className="py-4 px-3 font-bold font-mono text-zinc-900 dark:text-white">{DEVICE_ID}</td>
                  <td className="py-4 px-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                      isOnline
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                        : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-zinc-400'}`}></span>
                      {deviceData?.status || 'OFFLINE'}
                    </span>
                  </td>
                  <td className="py-4 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                    {Number(deviceData?.balance || 0).toFixed(2)} kWh
                  </td>
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-1.5">
                      {pendingCount > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 text-[10px] font-semibold">
                          {pendingCount} Pending
                        </span>
                      )}
                      {failedCount > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200 text-[10px] font-semibold">
                          {failedCount} Failed
                        </span>
                      )}
                      {pendingCount === 0 && failedCount === 0 && (
                        <span className="text-zinc-400">All Confirmed ✓</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-3 text-zinc-500">
                    {deviceData?.lastUpdated ? new Date(deviceData.lastUpdated).toLocaleTimeString() : 'N/A'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


export default function AdminDashboardPage() {
  return <AdminRoute><AdminDashboardContent /></AdminRoute>;
}
