"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Home, Sun } from 'lucide-react';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();

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
            onClick={() => router.push('/marketplace/seller/setup')}
            className="flex items-center gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <Sun className="w-6 h-6" />
            </div>
            <div>
              <div className="font-semibold text-zinc-900 dark:text-white mb-1">
                Sell Energy
              </div>
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                Make your available solar energy accessible to nearby buyers.
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
