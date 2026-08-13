"use client";

import React, { useEffect, useState } from 'react';
import { devicesApi } from '@/lib/api/devices';
import { Transaction, HardwareStatus } from '@/lib/types';
import Link from 'next/link';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'CONFIRMED' | 'PENDING' | 'FAILED' | 'TOPUP' | 'CONSUMPTION'>('ALL');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const DEVICE_ID = 'DEVICE-001';

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await devicesApi.getDevice(DEVICE_ID);
      if (res.success && res.transactions) {
        setTransactions(res.transactions);
      } else {
        setError('Failed to load transaction history.');
      }
    } catch (err: any) {
      console.error('Error fetching transactions:', err);
      setError(err.message || 'Network error fetching transactions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === 'ALL') return true;
    if (filter === 'TOPUP') return tx.type === 'topup';
    if (filter === 'CONSUMPTION') return tx.type === 'consumption';
    return tx.hardwareStatus === filter;
  });

  const getStatusBadge = (status: HardwareStatus, type: 'topup' | 'consumption') => {
    if (type === 'consumption') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
          ⚡ Consumption
        </span>
      );
    }

    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Confirmed
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Pending
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            Needs Attention
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      }).format(date);
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
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Transaction History</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              Real-time ledger of energy purchases and hardware credits for <span className="font-semibold text-zinc-700 dark:text-zinc-300">{DEVICE_ID}</span>
            </p>
          </div>
        </div>
        <button
          onClick={fetchTransactions}
          className="self-start sm:self-center px-3.5 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-all flex items-center gap-2 shadow-sm active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`}>
            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path>
            <path d="M21 3v5h-5"></path>
          </svg>
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'ALL', label: 'All Activity' },
          { id: 'CONFIRMED', label: 'Confirmed' },
          { id: 'PENDING', label: 'Pending' },
          { id: 'FAILED', label: 'Failed' },
          { id: 'TOPUP', label: 'Top-ups' },
          { id: 'CONSUMPTION', label: 'Consumption' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filter === tab.id
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                : 'bg-white dark:bg-[#121214] text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-800/60 hover:bg-zinc-50 dark:hover:bg-zinc-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      {loading && transactions.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-white dark:bg-[#121214] rounded-2xl animate-pulse border border-zinc-200/40 dark:border-zinc-800/40"></div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl p-6 text-center space-y-3">
          <p className="text-sm font-semibold text-red-800 dark:text-red-400">{error}</p>
          <button
            onClick={fetchTransactions}
            className="px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-xl shadow-sm hover:bg-red-700 transition-all"
          >
            Try Again
          </button>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="bg-white dark:bg-[#121214] border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-12 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="9" x2="15" y2="15"></line>
              <line x1="15" y1="9" x2="9" y2="15"></line>
            </svg>
          </div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">No transactions found</h3>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto">
            {filter === 'ALL'
              ? 'No transaction history recorded yet for this meter.'
              : `No transactions match the selected filter "${filter}".`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              onClick={() => setSelectedTx(tx)}
              className="bg-white dark:bg-[#121214] border border-zinc-200/60 dark:border-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-2xl p-4 sm:p-5 transition-all shadow-sm cursor-pointer active:scale-[0.99] flex items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                  tx.type === 'topup' 
                    ? 'bg-amber-500/10 text-amber-500 dark:bg-amber-500/20' 
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                }`}>
                  {tx.type === 'topup' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                      <rect x="2" y="7" width="16" height="10" rx="2" ry="2"></rect>
                      <line x1="22" y1="11" x2="22" y2="13"></line>
                    </svg>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-zinc-900 dark:text-white">
                      {tx.type === 'topup' ? `₦${Number(tx.amount || 0).toLocaleString()}` : 'Meter Consumption'}
                    </p>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">{formatDate(tx.timestamp)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-right">
                <div>
                  <p className={`text-sm font-bold ${tx.type === 'topup' ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-600 dark:text-zinc-400'}`}>
                    {tx.type === 'topup' 
                      ? `+${Number(tx.kwhAmount || (tx as any).kwh_amount || 0).toFixed(2)}` 
                      : `-${Number(tx.kwhAmount || (tx as any).kwh_amount || 0).toFixed(2)}`} <span className="text-xs font-semibold">kWh</span>
                  </p>
                  <div className="mt-1">
                    {getStatusBadge(tx.hardwareStatus, tx.type)}
                  </div>
                </div>

                <div className="text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative space-y-6 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-4">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Transaction Details</h3>
              <button
                onClick={() => setSelectedTx(null)}
                className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 font-medium">Energy {selectedTx.type === 'topup' ? 'Purchased' : 'Consumed'}</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {selectedTx.type === 'topup' ? '+' : '-'}{Number(selectedTx.kwhAmount || (selectedTx as any).kwh_amount || 0).toFixed(2)} kWh
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-500 font-medium">Amount Paid</p>
                <p className="text-lg font-bold text-zinc-900 dark:text-white mt-0.5">₦{Number(selectedTx.amount || 0).toLocaleString()}</p>
              </div>
            </div>

            {/* Audit Timeline */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Audit Timeline</h4>
              
              <div className="space-y-3.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Payment Reference</span>
                  <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-200">{selectedTx.reference || 'N/A'}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Transaction ID</span>
                  <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-200">{selectedTx.transactionId || 'N/A'}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Timestamp</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-200">{formatDate(selectedTx.timestamp)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Hardware Confirmation</span>
                  <div>{getStatusBadge(selectedTx.hardwareStatus, selectedTx.type)}</div>
                </div>
              </div>
            </div>

            {selectedTx.hardwareStatus === 'PENDING' && (
              <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4 text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
                ℹ️ <strong>Remote Credit Pending:</strong> Financial credit is recorded in your ledger. If the meter is offline, it will auto-sync when reconnected, or check SMS for your 16-digit recovery token.
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setSelectedTx(null)}
                className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold py-3.5 px-4 rounded-xl text-xs hover:bg-zinc-800 dark:hover:bg-white transition-all"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
