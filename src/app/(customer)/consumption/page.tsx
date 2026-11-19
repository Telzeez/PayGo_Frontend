"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { devicesApi } from '@/lib/api/devices';
import { useDevices } from '@/lib/contexts/DeviceContext';

type Period = 'day' | 'week' | 'month';
type Reading = { date: string; kwhConsumed: number };

export default function ConsumptionPage() {
  const { selectedDeviceId, loadingDevices } = useDevices();
  const [period, setPeriod] = useState<Period>('week');
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (loadingDevices) return;
      if (!selectedDeviceId) {
        setReadings([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const result = await devicesApi.getConsumption(selectedDeviceId, period);
        if (active) setReadings(result.readings || []);
      } catch (err: any) {
        if (active) setError(err.message || 'Unable to load consumption data');
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, [selectedDeviceId, period, loadingDevices]);

  const total = useMemo(
    () => readings.reduce((sum, item) => sum + Number(item.kwhConsumed || 0), 0),
    [readings]
  );

  const exportCsv = () => {
    const rows = [['Date', 'Energy consumed (kWh)'], ...readings.map((item) => [
      new Date(item.date).toISOString(),
      Number(item.kwhConsumed).toFixed(4),
    ])];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `paygo-${selectedDeviceId || 'meter'}-${period}-consumption.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Energy Consumption</h1>
          <p className="text-sm text-zinc-500 mt-1">{selectedDeviceId || 'No meter selected'}</p>
        </div>
        <button onClick={exportCsv} disabled={!readings.length || loading} className="rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2.5 text-xs font-semibold disabled:opacity-40">
          Export CSV
        </button>
      </div>

      <div className="flex gap-2">
        {(['day', 'week', 'month'] as Period[]).map((item) => (
          <button key={item} onClick={() => setPeriod(item)} className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize ${period === item ? 'bg-amber-500 text-zinc-950' : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300'}`}>
            {item === 'day' ? '24 hours' : item}
          </button>
        ))}
      </div>

      <section className="bg-white dark:bg-[#121214] border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-6">
        <p className="text-xs text-zinc-500 font-medium">Total energy consumed · {period}</p>
        <p className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white mt-2">{total.toFixed(3)} <span className="text-lg font-medium text-zinc-400">kWh</span></p>
      </section>

      <section className="bg-white dark:bg-[#121214] border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-6">
        <h2 className="font-semibold text-zinc-900 dark:text-white mb-4">Daily breakdown</h2>
        {loading ? <p className="text-sm text-zinc-500">Loading meter readings…</p> :
          error ? <p className="text-sm text-red-500">{error}</p> :
          readings.length === 0 ? <p className="text-sm text-zinc-500">No consumption readings recorded for this period yet.</p> :
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {readings.map((item) => (
              <div key={item.date} className="py-3 flex items-center justify-between gap-4">
                <span className="text-sm text-zinc-600 dark:text-zinc-300">{new Date(item.date).toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <span className="text-sm font-semibold tabular-nums text-zinc-900 dark:text-white">{Number(item.kwhConsumed).toFixed(3)} kWh</span>
              </div>
            ))}
          </div>
        }
      </section>
      <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white">← Back to dashboard</Link>
    </div>
  );
}
