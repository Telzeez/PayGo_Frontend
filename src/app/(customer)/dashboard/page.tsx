"use client";

import React, { useEffect, useRef, useState } from 'react';
import { devicesApi } from '@/lib/api/devices';
import { DeviceResponse } from '@/lib/types';
import Link from 'next/link';
import { OnboardingTutorial } from '@/components/OnboardingTutorial';
import { ConsumptionOverview } from '@/components/ConsumptionOverview';
import { useDevices } from '@/lib/contexts/DeviceContext';
import { useAuth } from '@/lib/contexts/AuthContext';

type DashboardDeviceResponse = Omit<DeviceResponse, 'transactions' | 'readings'>;

export default function Dashboard() {
  const [deviceData, setDeviceData] = useState<DashboardDeviceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const requestInFlight = useRef(false);
  const [statusClock, setStatusClock] = useState(Date.now());
  const [error, setError] = useState('');
  const { devices, selectedDevice, selectedDeviceId, selectDevice, loadingDevices, deviceError } = useDevices();
  const { user } = useAuth();

  useEffect(() => {
    let mounted = true;

    const fetchDevice = async (isPolling = false) => {
      if (requestInFlight.current) return;
      requestInFlight.current = true;
      try {
        if (!selectedDeviceId) {
          if (!loadingDevices && mounted) setError(deviceError || '');
          return;
        }
        const response = await devicesApi.getDeviceSummary(selectedDeviceId);
        if (mounted && response.success) {
          const nextData: DashboardDeviceResponse = { success: true, deviceId: response.meter.deviceId, balance: response.meter.balance, status: response.meter.status, lastSeenAt: response.meter.lastSeenAt, lastUpdated: response.meter.lastUpdated || response.meter.lastSeenAt || '' };
          setDeviceData((current) => current && current.deviceId === nextData.deviceId && current.balance === nextData.balance && current.status === nextData.status && current.lastSeenAt === nextData.lastSeenAt && current.lastUpdated === nextData.lastUpdated ? current : nextData);
          setError('');
        } else if (mounted && !response.success && !isPolling) {
          setError('Failed to load device data.');
        }
      } catch (err: any) {
        if (mounted && !isPolling) {
          setError(err.message || 'Error communicating with server.');
        }
      } finally {
        requestInFlight.current = false;
        if (mounted && !isPolling) setLoading(false);
      }
    };

    if (!loadingDevices) fetchDevice();
    const interval = setInterval(() => { if (!loadingDevices) fetchDevice(true); }, 3000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [selectedDeviceId, loadingDevices, deviceError]);

  useEffect(() => {
    const interval = window.setInterval(() => setStatusClock(Date.now()), 3000);
    return () => window.clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (isoString: string) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(isoString));
  };

  if (loading || loadingDevices) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <section className="bg-white dark:bg-[#121214] rounded-3xl p-6 h-64 border border-zinc-200/60 dark:border-zinc-800/60"></section>
        <section className="h-48 bg-zinc-100 dark:bg-[#121214] rounded-3xl"></section>
      </div>
    );
  }

  if (!selectedDeviceId && !deviceError && !loadingDevices) {
    return (
      <div className="mx-auto flex min-h-[420px] max-w-xl flex-col items-center justify-center rounded-3xl border border-zinc-200/60 bg-white p-8 text-center shadow-sm dark:border-zinc-800/60 dark:bg-[#121214]">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M13 2 4 14h7l-1 8 10-13h-7l1-7Z" /></svg>
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Your PAYGO account is ready</h2>
        <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500 dark:text-zinc-400">There is no activated meter linked to your account yet. You can still explore nearby energy offers. Your meter balance and controls will appear here after a meter is assigned and activated.</p>
        <div className="mt-6 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link href="/marketplace" className="rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-zinc-950 hover:bg-amber-400">Find Nearby Energy</Link>
          <Link href="/connections" className="rounded-xl border border-zinc-200 px-5 py-3 text-sm font-semibold text-zinc-700 dark:border-zinc-700 dark:text-zinc-200">My Connections</Link>
          {user?.isSeller && <Link href="/marketplace/seller" className="rounded-xl border border-zinc-200 px-5 py-3 text-sm font-semibold text-zinc-700 dark:border-zinc-700 dark:text-zinc-200">Seller Setup</Link>}
          <Link href="/profile" className="rounded-xl border border-zinc-200 px-5 py-3 text-sm font-semibold text-zinc-700 dark:border-zinc-700 dark:text-zinc-200">View Profile</Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6 items-center justify-center p-6 text-center h-64 bg-white dark:bg-[#121214] rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60">
        <div className="text-red-500 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-zinc-900 dark:text-white font-medium">{error}</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/onboarding" className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-zinc-950 hover:bg-amber-400">Review account type</Link>
          <button onClick={() => window.location.reload()} className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Try again</button>
        </div>
      </div>
    );
  }

  const { balance, status, deviceId, lastSeenAt } = deviceData || {};
  const lastSeenMs = lastSeenAt ? new Date(lastSeenAt).getTime() : 0;
  const isMeterOnline = Boolean(status === 'ONLINE' && lastSeenMs > 0 && statusClock >= lastSeenMs && statusClock - lastSeenMs <= 15000);
  const lastSeenLabel = lastSeenAt ? (() => { const seconds = Math.max(0, Math.floor((statusClock - new Date(lastSeenAt).getTime()) / 1000)); if (seconds < 60) return 'just now'; if (seconds < 3600) return `${Math.floor(seconds / 60)} minute${Math.floor(seconds / 60) === 1 ? '' : 's'} ago`; if (seconds < 86400) return `${Math.floor(seconds / 3600)} hour${Math.floor(seconds / 3600) === 1 ? '' : 's'} ago`; return `${Math.floor(seconds / 86400)} day${Math.floor(seconds / 86400) === 1 ? '' : 's'} ago`; })() : 'Never connected';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon'; // 12:00 PM to 4:59 PM
    return 'Good evening'; // 5:00 PM onwards
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700">
      <OnboardingTutorial />
      
      {/* Premium Dashboard Card */}
      <section className="min-w-0 bg-white dark:bg-[#121214] rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-sm border border-zinc-200/60 dark:border-zinc-800/60">
        <div className="flex min-w-0 flex-wrap items-start justify-between gap-3 mb-5 sm:mb-6">
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-0.5">{getGreeting()}</p>
            {devices.length > 1 ? (
              <select value={selectedDeviceId || ''} onChange={(event) => selectDevice(event.target.value)} className="mt-1 max-w-[220px] bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm font-semibold text-zinc-900 dark:text-white">
                {devices.map((device) => <option key={device.deviceId} value={device.deviceId}>{device.deviceId}</option>)}
              </select>
            ) : (
              <div className="flex items-center gap-2"><h2 className="text-base font-medium text-zinc-900 dark:text-zinc-100">{deviceId || selectedDeviceId || 'Select a meter'}</h2>
              </div>
            )}
          </div>
          
          {isMeterOnline ? (
             <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-500/20">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
               Meter Online
             </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-700">
               <div className="w-1.5 h-1.5 rounded-full bg-zinc-400"></div>
               <span>Meter Offline</span>
            </div>
          )}
          {!isMeterOnline && (
            <p className="w-full text-right text-[11px] text-zinc-500 dark:text-zinc-400 sm:ml-auto">Last seen: {lastSeenLabel}</p>
          )}
        </div>
        
        {selectedDevice?.isShared && (
          <p className="mb-2 text-center text-xs text-zinc-500">
            Shared prosumer meter · balance and readings reflect this single physical meter.
          </p>
        )}
        <div className="flex flex-col items-center justify-center py-6 mb-2">
          <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 tracking-[0.2em] uppercase mb-3">Available Balance</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl min-[380px]:text-4xl sm:text-6xl font-semibold tracking-tighter text-zinc-900 dark:text-white">
              {Number(balance || 0).toFixed(2)}
            </p>
            <span className="text-xl sm:text-2xl font-medium text-zinc-400 dark:text-zinc-500">kWh</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          <Link href={selectedDevice?.isShared ? '/marketplace' : '/recharge'} className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold py-4 px-4 rounded-2xl shadow-sm hover:bg-zinc-800 dark:hover:bg-white transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-xs">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-amber-500">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            {selectedDevice?.isShared ? 'Buy Energy' : 'Recharge Meter'}
          </Link>

          <Link href="/marketplace" className="w-full bg-amber-500 text-zinc-950 font-bold py-4 px-4 rounded-2xl shadow-sm hover:bg-amber-400 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-xs">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            Find Nearby Energy
          </Link>
        </div>

        {/* Intuitive Quick Navigation Grid */}
        <div className="grid grid-cols-2 gap-2.5 mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/60 text-center text-xs font-semibold">
          <Link href="/transactions" className="p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors flex flex-col items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-zinc-500">
              <path d="M3 3v18h18" />
              <path d="m19 9-5 5-4-4-3 3" />
            </svg>
            <span>History</span>
          </Link>

          <Link href="/profile" className="p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors flex flex-col items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-zinc-500">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>Profile</span>
          </Link>
        </div>
      </section>

      <ConsumptionOverview deviceId={deviceId || selectedDeviceId || ''} />
    </div>
  );
}
