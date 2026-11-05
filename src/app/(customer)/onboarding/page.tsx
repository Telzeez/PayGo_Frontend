"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Home, Sun } from 'lucide-react';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoading, becomeSeller } = useAuth();
  const [enablingSeller, setEnablingSeller] = useState(false);
  const [error, setError] = useState('');

  const openSellerPortal = async () => {
    setError('');
    if (user?.isSeller || user?.role.toUpperCase() === 'SELLER') {
      router.push('/marketplace/seller');
      return;
    }

    setEnablingSeller(true);
    try {
      await becomeSeller();
      router.push('/marketplace/seller');
    } catch (enableError: unknown) {
      setError(enableError instanceof Error ? enableError.message : 'Unable to enable seller tools.');
      setEnablingSeller(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#09090B] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
            Welcome to PayGo!
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            What would you like to do first?
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300" role="alert">
              {error}
            </p>
          )}
          <button
            onClick={() => router.push('/marketplace')}
            className="flex items-center gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <div className="font-semibold text-zinc-900 dark:text-white mb-1">
                Buy Energy
              </div>
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                Find nearby solar energy and purchase what you need.
              </div>
            </div>
          </button>

          <button
            onClick={() => void openSellerPortal()}
            disabled={isLoading || enablingSeller}
            className="flex items-center gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <Sun className="w-6 h-6" />
            </div>
            <div>
              <div className="font-semibold text-zinc-900 dark:text-white mb-1">
                {enablingSeller ? 'Enabling seller tools…' : 'Sell Energy'}
              </div>
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                {user?.isSeller
                  ? 'Open your seller portal and manage energy offers.'
                  : 'Use this account to offer energy; no meter will be assigned automatically.'}
              </div>
            </div>
          </button>
        </div>

        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-8">
          You can always do both later.
        </p>
      </div>
    </div>
  );
}
