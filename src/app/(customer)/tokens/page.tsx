"use client";

import React, { useEffect, useState } from 'react';
import { devicesApi } from '@/lib/api/devices';
import Link from 'next/link';

interface FallbackToken {
  id: number;
  kwhAmount: number;
  expiresAt: string;
  used: boolean;
  autoCredited: boolean;
  transactionId: string | null;
  createdAt: string;
}

export default function TokensPage() {
  const [tokens, setTokens] = useState<FallbackToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [redeemStatus, setRedeemStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [redeeming, setRedeeming] = useState(false);

  const DEVICE_ID = 'DEVICE-001';

  const fetchTokens = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await devicesApi.getTokens(DEVICE_ID);
      if (res.success && res.tokens) {
        setTokens(res.tokens);
      } else {
        setError('Failed to fetch fallback tokens.');
      }
    } catch (err: any) {
      console.error('Error loading tokens:', err);
      setError(err.message || 'Network error loading tokens.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  const handleManualRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode || manualCode.trim().length < 8) {
      setRedeemStatus({ success: false, message: 'Please enter a valid 16-digit recovery token code.' });
      return;
    }

    setRedeeming(true);
    setRedeemStatus(null);

    // Simulate keypad token code submission check
    setTimeout(() => {
      setRedeeming(false);
      setRedeemStatus({
        success: true,
        message: `Token submitted for verification on ${DEVICE_ID}. If offline, enter this code on the physical meter keypad.`
      });
      setManualCode('');
    }, 1200);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="w-9 h-9 rounded-full bg-white dark:bg-[#121214] flex items-center justify-center border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Recovery Tokens</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              Offline 16-digit keypad credentials generated for meter <span className="font-semibold text-zinc-700 dark:text-zinc-300">{DEVICE_ID}</span>
            </p>
          </div>
        </div>
        <button
          onClick={fetchTokens}
          className="self-start sm:self-center px-3.5 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-all flex items-center gap-2 shadow-sm active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`}>
            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path>
            <path d="M21 3v5h-5"></path>
          </svg>
          Refresh
        </button>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 border border-amber-200/60 dark:border-amber-500/20 rounded-3xl p-6 shadow-sm space-y-2">
        <div className="flex items-center gap-2.5 text-amber-800 dark:text-amber-400 font-bold text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 shrink-0">
            <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
          </svg>
          <span>What are Fallback Tokens?</span>
        </div>
        <p className="text-xs text-amber-900/80 dark:text-amber-300/80 leading-relaxed">
          When you make a payment, your energy is automatically credited over the air. If your solar meter loses Wi-Fi/GSM connection, the system sends an <strong>SMS 16-digit token</strong> to your phone. You can type this code into the physical keypad on your meter to credit energy offline.
        </p>
      </div>

      {/* Manual Keypad Input Form */}
      <div className="bg-white dark:bg-[#121214] border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">Manual Token Entry</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Enter an offline token code to submit for verification</p>
        </div>

        <form onSubmit={handleManualRedeem} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value.replace(/\D/g, ''))}
            placeholder="e.g. 8492049182391048"
            maxLength={16}
            className="flex-1 px-4 py-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-mono text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
          />
          <button
            type="submit"
            disabled={redeeming || !manualCode}
            className="px-6 py-3.5 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs shadow-sm hover:bg-zinc-800 dark:hover:bg-white transition-all disabled:opacity-50 active:scale-95 shrink-0 flex items-center justify-center gap-2"
          >
            {redeeming ? (
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
            ) : (
              'Submit Code'
            )}
          </button>
        </form>

        {redeemStatus && (
          <div className={`p-4 rounded-2xl text-xs font-medium border ${
            redeemStatus.success 
              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' 
              : 'bg-red-50 dark:bg-red-500/10 text-red-800 dark:text-red-400 border-red-200 dark:border-red-500/20'
          }`}>
            {redeemStatus.message}
          </div>
        )}
      </div>

      {/* Token History List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-zinc-900 dark:text-white">Generated Recovery Tokens</h2>

        {loading && tokens.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-white dark:bg-[#121214] rounded-3xl animate-pulse border border-zinc-200/40 dark:border-zinc-800/40"></div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl p-6 text-center text-xs font-semibold text-red-800 dark:text-red-400">
            {error}
          </div>
        ) : tokens.length === 0 ? (
          <div className="bg-white dark:bg-[#121214] border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-10 text-center space-y-2">
            <p className="text-sm font-bold text-zinc-900 dark:text-white">No recovery tokens generated yet</p>
            <p className="text-xs text-zinc-500">Tokens are automatically generated whenever you complete a recharge.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tokens.map((token) => (
              <div
                key={token.id}
                className="bg-white dark:bg-[#121214] border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                      <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-zinc-900 dark:text-white">+{Number(token.kwhAmount).toFixed(2)} kWh Token</p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        token.used 
                          ? 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700' 
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                      }`}>
                        {token.used ? 'Redeemed' : 'Active'}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">Generated: {formatDate(token.createdAt)}</p>
                    {token.expiresAt && (
                      <p className="text-[11px] text-zinc-400 mt-0.5">Expires: {formatDate(token.expiresAt)}</p>
                    )}
                  </div>
                </div>

                <div className="text-right sm:self-center border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800 pt-3 sm:pt-0">
                  <p className="text-xs text-zinc-500">Mode</p>
                  <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    {token.autoCredited ? 'Auto-Credited (Recovery)' : 'Manual Keypad'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
