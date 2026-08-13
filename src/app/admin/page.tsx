"use client";

import React, { useEffect, useState } from 'react';
import { devicesApi } from '@/lib/api/devices';
import { DeviceResponse } from '@/lib/types';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [deviceData, setDeviceData] = useState<DeviceResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const DEVICE_ID = 'DEVICE-001';

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await devicesApi.getDevice(DEVICE_ID);
      if (res.success) {
        setDeviceData(res);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 5000);
    return () => clearInterval(interval);
  }, []);

  const pendingCount = deviceData?.transactions.filter(t => t.hardwareStatus === 'PENDING').length || 0;
  const failedCount = deviceData?.transactions.filter(t => t.hardwareStatus === 'FAILED').length || 0;
  const isOnline = deviceData?.status === 'ONLINE';

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
              OWNER / ADMIN DASHBOARD
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mt-1">
            Platform Hardware & Meter Control
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchAdminData}
            className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-all flex items-center gap-2 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`}>
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

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white dark:bg-[#121214] border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-5 shadow-sm space-y-1">
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

      {/* Devices Overview Table */}
      <div className="bg-white dark:bg-[#121214] border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">Active Meter Registry</h2>
          <span className="text-xs text-zinc-400">Updated Real-Time</span>
        </div>

        {loading ? (
          <div className="h-32 bg-zinc-100 dark:bg-zinc-900 rounded-2xl animate-pulse"></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
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
