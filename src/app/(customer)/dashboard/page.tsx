"use client";

import React, { useEffect, useState } from 'react';
import { devicesApi } from '@/lib/api/devices';
import { DeviceResponse, Transaction } from '@/lib/types';
import Link from 'next/link';

export default function Dashboard() {
  const [deviceData, setDeviceData] = useState<DeviceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Default device ID for prototype
  const DEVICE_ID = 'DEVICE-001';

  useEffect(() => {
    let mounted = true;

    const fetchDevice = async () => {
      try {
        const response = await devicesApi.getDevice(DEVICE_ID);
        if (mounted && response.success) {
          setDeviceData(response);
          setError('');
        } else if (mounted && !response.success) {
          setError('Failed to load device data.');
        }
      } catch (err: any) {
        if (mounted && !deviceData) {
          setError(err.message || 'Error communicating with server.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchDevice();
    const interval = setInterval(fetchDevice, 5000); // Real-time 5s polling for remaining kWh & hardware updates

    return () => {
      mounted = false;
      clearInterval(interval);
    };
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

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <section className="bg-white dark:bg-[#121214] rounded-3xl p-6 h-64 border border-zinc-200/60 dark:border-zinc-800/60"></section>
        <section className="h-48 bg-zinc-100 dark:bg-[#121214] rounded-3xl"></section>
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
        <button onClick={() => window.location.reload()} className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Try again</button>
      </div>
    );
  }

  const { balance, status, deviceId, transactions } = deviceData || {};

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon'; // 12:00 PM to 4:59 PM
    return 'Good evening'; // 5:00 PM onwards
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700">
      
      {/* Premium Dashboard Card */}
      <section className="bg-white dark:bg-[#121214] rounded-3xl p-6 shadow-sm border border-zinc-200/60 dark:border-zinc-800/60">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-0.5">{getGreeting()}</p>
            <h2 className="text-base font-medium text-zinc-900 dark:text-zinc-100">{deviceId || DEVICE_ID}</h2>
          </div>
          
          {status === 'ONLINE' ? (
             <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-500/20">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
               Meter Online
             </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-700">
               <div className="w-1.5 h-1.5 rounded-full bg-zinc-400"></div>
               Meter Offline
            </div>
          )}
        </div>
        
        <div className="flex flex-col items-center justify-center py-6 mb-2">
          <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 tracking-[0.2em] uppercase mb-3">Available Balance</p>
          <div className="flex items-baseline gap-2">
            <p className="text-6xl font-semibold tracking-tighter text-zinc-900 dark:text-white">
              {Number(balance || 0).toFixed(2)}
            </p>
            <span className="text-2xl font-medium text-zinc-400 dark:text-zinc-500">kWh</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-2">
          <Link href="/recharge" className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold py-4 px-4 rounded-2xl shadow-sm hover:bg-zinc-800 dark:hover:bg-white transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-xs">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-amber-500">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            Recharge Meter
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
        <div className="grid grid-cols-3 gap-2.5 mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/60 text-center text-xs font-semibold">
          <Link href="/transactions" className="p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors flex flex-col items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-zinc-500">
              <path d="M3 3v18h18" />
              <path d="m19 9-5 5-4-4-3 3" />
            </svg>
            <span>History</span>
          </Link>

          <Link href="/tokens" className="p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors flex flex-col items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-zinc-500">
              <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
            </svg>
            <span>Tokens</span>
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

      {/* Sleek Transactions Section */}
      <section className="px-1 mt-2">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Recent Transactions</h3>
          <Link href="/transactions" className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 font-medium transition-colors">See all</Link>
        </div>
        
        <div className="flex flex-col gap-3">
          
          {(!transactions || transactions.length === 0) && (
            <div className="text-center py-8 text-zinc-500 dark:text-zinc-400 text-sm">
              No transactions yet. Recharge your meter to get started.
            </div>
          )}

          {transactions?.map((tx: Transaction) => {
            const isConfirmed = tx.hardwareStatus === 'CONFIRMED';
            const isPending = tx.hardwareStatus === 'PENDING';
            const isFailed = tx.hardwareStatus === 'FAILED';

            return (
              <div key={tx.id} className="bg-white dark:bg-[#121214] p-4.5 rounded-2xl flex items-center justify-between shadow-sm border border-zinc-200/60 dark:border-zinc-800/60 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50 cursor-pointer">
                <div className="flex items-center gap-4">
                  
                  {isConfirmed && (
                    <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <path d="M22 4L12 14.01l-3-3"></path>
                      </svg>
                    </div>
                  )}

                  {isPending && (
                    <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                    </div>
                  )}

                  {isFailed && (
                    <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-500">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                    </div>
                  )}

                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-[15px]">{formatCurrency(tx.amount)}</p>
                    <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-0.5">{Number(tx.kwhAmount).toFixed(2)} kWh • {formatDate(tx.timestamp)}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  {isConfirmed && (
                    <span className="inline-block px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium rounded-full">
                      Confirmed
                    </span>
                  )}
                  {isPending && (
                    <span className="inline-block px-3 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 text-xs font-medium rounded-full flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                      Pending
                    </span>
                  )}
                  {isFailed && (
                    <span className="inline-block px-3 py-1 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-medium rounded-full">
                      Failed
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          
        </div>
      </section>
    </div>
  );
}
