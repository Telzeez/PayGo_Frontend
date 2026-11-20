"use client";

import { useEffect, useMemo, useState } from 'react';
import { devicesApi } from '@/lib/api/devices';

type Period = 'week' | 'month' | 'year';
type Point = { date: string; kwhConsumed: number };

const PERIODS: { value: Period; label: string }[] = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
];

export function ConsumptionOverview({ deviceId }: { deviceId: string }) {
  const [period, setPeriod] = useState<Period>('week');
  const [points, setPoints] = useState<Point[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    devicesApi.getConsumption(deviceId, period)
      .then((response) => {
        if (active) setPoints(response.readings || []);
      })
      .catch((err: any) => {
        if (active) setError(err?.message || 'Could not load consumption data.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [deviceId, period]);

  const chart = useMemo(() => {
    const count = period === 'week' ? 7 : period === 'month' ? 30 : 12;
    const now = new Date();
    const slots: { key: string; label: string; value: number }[] = [];
    for (let i = count - 1; i >= 0; i--) {
      const date = new Date(now);
      if (period === 'year') {
        date.setDate(1);
        date.setMonth(now.getMonth() - i);
      } else {
        date.setHours(0, 0, 0, 0);
        date.setDate(now.getDate() - i);
      }
      const key = period === 'year'
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        : date.toLocaleDateString('en-CA');
      slots.push({
        key,
        label: period === 'year'
          ? date.toLocaleDateString('en', { month: 'short' })
          : period === 'week'
            ? date.toLocaleDateString('en', { weekday: 'short' })
            : String(date.getDate()),
        value: 0,
      });
    }
    points.forEach((point) => {
      const date = new Date(point.date);
      const key = period === 'year'
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        : date.toLocaleDateString('en-CA');
      const slot = slots.find((item) => item.key === key);
      if (slot) slot.value += Number(point.kwhConsumed || 0);
    });
    return slots;
  }, [points, period]);

  const total = chart.reduce((sum, item) => sum + item.value, 0);
  const max = Math.max(...chart.map((item) => item.value), 0.1);
  const barWidth = 100 / chart.length;

  return (
    <section className="rounded-2xl sm:rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-[#121214] p-4 sm:p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Energy consumption</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">How much energy your meter has used</p>
        </div>
        <div className="flex rounded-xl bg-zinc-100 dark:bg-zinc-900 p-1" role="group" aria-label="Consumption period">
          {PERIODS.map((item) => (
            <button key={item.value} type="button" onClick={() => setPeriod(item.value)}
              aria-pressed={period === item.value}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${period === item.value ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 dark:text-zinc-400'}`}>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Total used this {period}</p>
        <p className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white mt-1">
          {loading ? '—' : total.toFixed(2)} <span className="text-sm font-medium text-zinc-400">kWh</span>
        </p>
      </div>

      {loading ? (
        <div className="h-44 rounded-xl bg-zinc-100 dark:bg-zinc-900 animate-pulse" />
      ) : error ? (
        <p className="py-12 text-center text-sm text-red-500">{error}</p>
      ) : points.length === 0 || total === 0 ? (
        <div className="h-44 flex items-center justify-center text-center text-sm text-zinc-500 dark:text-zinc-400">
          No consumption readings recorded for this period yet.
        </div>
      ) : (
        <div>
          <div className="h-40 flex items-end gap-1.5 sm:gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
            {chart.map((item) => (
              <div key={item.key} className="h-full flex-1 min-w-0 flex flex-col justify-end items-center group">
                <span className="text-[9px] sm:text-[10px] text-zinc-500 mb-1 opacity-0 group-hover:opacity-100 tabular-nums">
                  {item.value > 0 ? item.value.toFixed(2) : ''}
                </span>
                <div title={`${item.label}: ${item.value.toFixed(3)} kWh`}
                  className="w-full max-w-8 rounded-t-md bg-amber-500/85 hover:bg-amber-400 transition-colors min-h-0"
                  style={{ height: `${item.value > 0 ? Math.max(4, (item.value / max) * 78) : 0}%` }} />
              </div>
            ))}
          </div>
          <div className="flex gap-1.5 sm:gap-2 mt-2">
            {chart.map((item) => (
              <span key={item.key} className="flex-1 min-w-0 text-center text-[9px] sm:text-[10px] text-zinc-400 truncate">{item.label}</span>
            ))}
          </div>
        </div>
      )}
      <p className="mt-4 text-[11px] text-zinc-400 dark:text-zinc-500">Based on readings received from your PAYGO meter.</p>
    </section>
  );
}
