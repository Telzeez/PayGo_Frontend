"use client";

import React, { useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { paymentApi } from '@/lib/api/payment';
import Link from 'next/link';

export default function RechargePage() {
  const { user } = useAuth();
  
  // Default values for prototype
  const DEVICE_ID = 'DEVICE-001';
  const PRICE_PER_KWH = 200; // As per backend environment

  const [amount, setAmount] = useState<string>('5000');
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState('');

  const numAmount = parseInt(amount, 10);
  const isValidAmount = !isNaN(numAmount) && numAmount >= 100;
  const kwhEstimate = isValidAmount ? (numAmount / PRICE_PER_KWH).toFixed(2) : '0.00';

  const handlePayment = async () => {
    if (!isValidAmount || !user?.email) return;

    setError('');
    setIsInitializing(true);

    try {
      const response = await paymentApi.initiate({
        amount: numAmount,
        email: user.email,
        deviceId: DEVICE_ID
      });

      if (response.success && response.paymentUrl) {
        // Redirect to Paystack
        window.location.href = response.paymentUrl;
      } else {
        throw new Error(response.error || 'Failed to initialize payment');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while connecting to the payment gateway.');
      setIsInitializing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-md mx-auto">
      
      <div className="flex items-center gap-4 mb-2">
        <Link href="/dashboard" className="w-10 h-10 rounded-full bg-white dark:bg-[#121214] flex items-center justify-center border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Recharge Meter</h1>
      </div>

      <section className="bg-white dark:bg-[#121214] rounded-3xl p-6 shadow-sm border border-zinc-200/60 dark:border-zinc-800/60">
        
        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-4 rounded-2xl text-sm font-medium border border-red-100 dark:border-red-500/20 mb-6">
            {error}
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            Target Meter
          </label>
          <div className="bg-zinc-50 dark:bg-[#09090B] border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-zinc-500">
                  <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
                  <rect x="9" y="9" width="6" height="6"></rect>
                  <line x1="9" y1="1" x2="9" y2="4"></line>
                  <line x1="15" y1="1" x2="15" y2="4"></line>
                  <line x1="9" y1="20" x2="9" y2="23"></line>
                  <line x1="15" y1="20" x2="15" y2="23"></line>
                  <line x1="20" y1="9" x2="23" y2="9"></line>
                  <line x1="20" y1="14" x2="23" y2="14"></line>
                  <line x1="1" y1="9" x2="4" y2="9"></line>
                  <line x1="1" y1="14" x2="4" y2="14"></line>
                </svg>
              </div>
              <span className="font-semibold text-zinc-900 dark:text-white tracking-wide">{DEVICE_ID}</span>
            </div>
            <span className="text-zinc-400">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </span>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            Amount (NGN)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-zinc-500 dark:text-zinc-400 text-xl">₦</span>
            <input 
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-[#09090B] border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-10 pr-4 py-4 text-xl font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-shadow"
              placeholder="0.00"
              min="100"
            />
          </div>
          {amount && !isValidAmount && (
            <p className="text-xs text-red-500 font-medium mt-2">Minimum recharge amount is ₦100.</p>
          )}
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between mb-8">
          <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-400">Estimated Energy</span>
          <span className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
            {kwhEstimate} <span className="text-sm font-semibold">kWh</span>
          </span>
        </div>

        <button 
          onClick={handlePayment}
          disabled={!isValidAmount || isInitializing}
          className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold py-4 px-4 rounded-2xl shadow-sm hover:bg-zinc-800 dark:hover:bg-white transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
        >
          {isInitializing ? (
            <>
              <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white dark:border-zinc-900/30 dark:border-t-zinc-900 animate-spin"></div>
              Initializing...
            </>
          ) : (
            'Continue to Payment'
          )}
        </button>

        <p className="text-center text-xs font-medium text-zinc-400 dark:text-zinc-500 mt-4">
          Secured by Paystack
        </p>

      </section>
    </div>
  );
}
