"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Home, Sun } from 'lucide-react';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, activateCapability } = useAuth();
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const continueAs = async (capability: 'BUYER' | 'SELLER') => {
    if (saving) return;
    setSaving(true);
    setError('');
    try {
      await activateCapability(capability);
      const requested = new URLSearchParams(window.location.search).get('redirect');
      const safeRedirect = requested && requested.startsWith('/') && !requested.startsWith('//') ? requested : null;
      router.replace(capability === 'SELLER' ? '/marketplace/seller' : (safeRedirect || '/marketplace'));
    } catch (err: any) {
      setError(err?.message || 'We could not save your account preference. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#09090B] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-8">
        <div className="text-center mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600 mb-3">PAYGO ACCOUNT SETUP</p>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Welcome to PayGo{user?.email ? ', ' + user.email.split('@')[0] : ''}!</h1>
          <p className="text-zinc-600 dark:text-zinc-400">How would you like to use PAYGO today?</p>
        </div>
        <div className="flex flex-col gap-4">
          <button type="button" onClick={() => continueAs('BUYER')} disabled={saving}
            className="flex items-center gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-500/5 transition-all text-left group disabled:opacity-60">
            <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"><Home className="w-6 h-6" /></div>
            <div><div className="font-semibold text-zinc-900 dark:text-white mb-1">Buy Energy</div><div className="text-sm text-zinc-500 dark:text-zinc-400">Find nearby solar energy and purchase what you need.</div></div>
          </button>
          <button type="button" onClick={() => continueAs('SELLER')} disabled={saving}
            className="flex items-center gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-500/5 transition-all text-left group disabled:opacity-60">
            <div className="w-12 h-12 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"><Sun className="w-6 h-6" /></div>
            <div><div className="font-semibold text-zinc-900 dark:text-white mb-1">Sell Energy</div><div className="text-sm text-zinc-500 dark:text-zinc-400">Set up your solar source and make surplus energy available nearby.</div></div>
          </button>
        </div>
        {saving && <p className="mt-4 text-center text-sm text-zinc-500">Saving your choice…</p>}
        {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 dark:bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">{error}</p>}
        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-8">You can use both features with this same account. Your choice does not remove the other capability.</p>
      </div>
    </div>
  );
}
