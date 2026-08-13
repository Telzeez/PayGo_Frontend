"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { marketplaceApi } from '@/lib/api/marketplace';
import { Clock, CheckCircle2, XCircle, AlertCircle, Zap } from 'lucide-react';

export default function BuyerPurchasesPage() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const res = await marketplaceApi.getPurchases();
        if (res.success) {
          setPurchases(res.purchases);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load purchases.');
      } finally {
        setLoading(false);
      }
    };
    fetchPurchases();
  }, []);

  const getStatusBadge = (status: string, hardwareStatus?: string) => {
    if (status === 'RESERVED') {
      return (
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 text-xs font-bold uppercase tracking-wider">
          <Clock className="w-3.5 h-3.5" /> Created
        </span>
      );
    }
    
    if (status === 'COMPLETED' && hardwareStatus === 'PENDING') {
      return (
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
          <Zap className="w-3.5 h-3.5" /> Credit Pending
        </span>
      );
    }

    if (status === 'COMPLETED' && hardwareStatus === 'CONFIRMED') {
      return (
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
        </span>
      );
    }

    if (status === 'EXPIRED' || status === 'CANCELLED') {
      return (
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs font-bold uppercase tracking-wider">
          <XCircle className="w-3.5 h-3.5" /> {status}
        </span>
      );
    }

    return (
      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 text-xs font-bold uppercase tracking-wider">
        <AlertCircle className="w-3.5 h-3.5" /> {status}
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">My Purchases</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Track your local energy marketplace transactions.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-4 rounded-2xl text-xs font-semibold text-red-800 dark:text-red-400 mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="animate-pulse flex flex-col gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-white dark:bg-[#121214] rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60"></div>
          ))}
        </div>
      ) : purchases.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#121214] rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60">
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-4">You haven't bought any energy yet.</p>
          <Link href="/marketplace" className="inline-block px-6 py-3 bg-amber-500 text-zinc-950 font-bold rounded-xl hover:bg-amber-400 transition-colors">
            Find Nearby Energy
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {purchases.map(purchase => (
            <Link 
              key={purchase.id} 
              href={`/marketplace/purchases/${purchase.id}`}
              className="group bg-white dark:bg-[#121214] border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl p-5 shadow-sm hover:border-amber-500/50 transition-all block"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusBadge(purchase.status, purchase.hardwareStatus)}
                    <span className="text-xs text-zinc-500 font-medium">{new Date(purchase.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-zinc-900 dark:text-white">
                      {purchase.kwhRequested} <span className="text-sm text-zinc-500">kWh</span>
                    </span>
                    <span className="text-zinc-400 mx-2">•</span>
                    <span className="text-lg font-bold text-amber-600 dark:text-amber-500">
                      ₦{purchase.amount}
                    </span>
                  </div>
                  <div className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    From {purchase.sourceName} ({purchase.distanceMeters}m away)
                  </div>
                </div>
                
                <div className="text-zinc-400 group-hover:text-amber-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
