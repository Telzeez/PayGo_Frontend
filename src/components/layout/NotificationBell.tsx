"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';

type NotificationItem = {
  id: number;
  type: string;
  title: string;
  message: string;
  targetUrl: string;
  entityId: number | null;
  readAt: string | null;
  createdAt: string;
};

export default function NotificationBell({ canReceiveNearbyAlerts }: { canReceiveNearbyAlerts: boolean }) {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState('');

  const refresh = useCallback(async () => {
    try {
      const result = await apiClient<{ notifications: NotificationItem[]; unreadCount: number }>('/api/notifications');
      setItems(result.notifications || []);
      setUnread(result.unreadCount || 0);
    } catch (error) {
      console.error('Unable to refresh PAYGO notifications:', error);
    }
  }, []);

  const refreshPreference = useCallback(async () => {
    try {
      const result = await apiClient<{ preference: { enabled: boolean } }>('/api/notifications/nearby-alerts/me');
      setAlertsEnabled(Boolean(result.preference?.enabled));
    } catch (error) {
      // Non-buyer accounts may not have a nearby-alert preference.
      console.debug('Nearby energy alert preference is unavailable:', error);
    }
  }, []);

  useEffect(() => {
    void refresh();
    void refreshPreference();
    const timer = window.setInterval(() => { void refresh(); }, 20000);
    return () => window.clearInterval(timer);
  }, [refresh, refreshPreference]);

  const toggleNearbyAlerts = async () => {
    if (busy) return;
    setBusy(true);
    setFeedback('');
    try {
      if (alertsEnabled) {
        await apiClient('/api/notifications/nearby-alerts', {
          method: 'PUT',
          body: JSON.stringify({ enabled: false }),
        });
        setAlertsEnabled(false);
        setFeedback('Nearby energy alerts are off.');
      } else {
        if (!navigator.geolocation) throw new Error('Location access is not available in this browser.');
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 15000,
            maximumAge: 300000,
          });
        });
        await apiClient('/api/notifications/nearby-alerts', {
          method: 'PUT',
          body: JSON.stringify({
            enabled: true,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }),
        });
        setAlertsEnabled(true);
        setFeedback('Nearby energy alerts are on. PAYGO stores only an approximate location.');
      }
    } catch (error: any) {
      setFeedback(error?.message || 'Could not update nearby energy alerts.');
    } finally {
      setBusy(false);
    }
  };

  const openNotification = async (item: NotificationItem) => {
    if (!item.readAt) {
      try {
        await apiClient(`/api/notifications/${item.id}/read`, { method: 'PATCH' });
      } catch (error) {
        console.error('Unable to mark notification as read:', error);
      }
    }
    setOpen(false);
    await refresh();
    window.location.assign(item.targetUrl || '/dashboard');
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
        aria-expanded={open}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>
        {unread > 0 && <span className="absolute -right-1 -top-1 min-w-[17px] rounded-full bg-red-600 px-1 text-center text-[10px] font-bold leading-[17px] text-white">{unread > 99 ? '99+' : unread}</span>}
      </button>

      {open && (
        <>
          <button aria-label="Close notifications" className="fixed inset-0 z-30 cursor-default" onClick={() => setOpen(false)} />
          <section className="absolute right-0 z-40 mt-2 w-[min(90vw,360px)] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
              <div>
                <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Notifications</h2>
                <p className="text-[11px] text-zinc-500">{unread} unread</p>
              </div>
              <button onClick={() => void refresh()} className="text-xs font-semibold text-amber-600 hover:text-amber-700">Refresh</button>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {items.length === 0 ? (
                <p className="px-4 py-8 text-center text-xs text-zinc-500">You’re all caught up. New connection requests and nearby energy offers will appear here.</p>
              ) : items.map(item => (
                <button key={item.id} onClick={() => void openNotification(item)} className={`block w-full border-b border-zinc-100 px-4 py-3 text-left transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/70 ${item.readAt ? '' : 'bg-amber-50/60 dark:bg-amber-500/5'}`}>
                  <span className="flex items-start gap-2">
                    {!item.readAt && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-500" />}
                    <span className="min-w-0">
                      <span className="block text-xs font-bold text-zinc-900 dark:text-zinc-100">{item.title}</span>
                      <span className="mt-1 block text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">{item.message}</span>
                      <span className="mt-1 block text-[10px] text-zinc-400">{new Date(item.createdAt).toLocaleString()}</span>
                    </span>
                  </span>
                </button>
              ))}
            </div>

            {canReceiveNearbyAlerts && <div className="border-t border-zinc-100 px-4 py-3 dark:border-zinc-800">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Nearby energy alerts</p>
                  <p className="mt-0.5 text-[10px] leading-relaxed text-zinc-500">Get notified when new energy is listed within the seller’s service radius.</p>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void toggleNearbyAlerts()}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-bold disabled:opacity-50 ${alertsEnabled ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' : 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'}`}
                >
                  {busy ? 'Saving…' : alertsEnabled ? 'On' : 'Turn on'}
                </button>
              </div>
              <p className="mt-2 text-[10px] leading-relaxed text-zinc-500">Opt-in only. PAYGO rounds your location to approximately 100 m and deletes it when you turn alerts off.</p>
              {feedback && <p role="status" className="mt-2 text-[10px] text-amber-700 dark:text-amber-400">{feedback}</p>}
            </div>}
          </section>
        </>
      )}
    </div>
  );
}
