"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('paygo-cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('paygo-cookie-consent', 'accepted');
    setShowBanner(false);
  };

  const handleReject = () => {
    localStorage.setItem('paygo-cookie-consent', 'rejected');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full z-[100] animate-in slide-in-from-bottom duration-500">
      <div className="bg-white/95 dark:bg-[#121214]/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-amber-500 shrink-0">
                <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"></path>
                <path d="M8.5 8.5v.01"></path>
                <path d="M16 12.5v.01"></path>
                <path d="M12 16v.01"></path>
                <path d="M11 12.5v.01"></path>
              </svg>
              <h3 className="font-bold text-zinc-900 dark:text-white text-sm">We value your privacy</h3>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed pr-4">
              We use strictly necessary cookies to ensure the PayGo platform functions correctly, such as maintaining your login session. We do not use third-party tracking cookies. 
              Read our <Link href="/documentation" className="text-amber-600 dark:text-amber-400 font-semibold hover:underline">Privacy Policy</Link>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3 shrink-0">
            <button
              onClick={handleReject}
              className="px-6 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-sm"
            >
              Essential Only
            </button>
            <button
              onClick={handleAcceptAll}
              className="px-6 py-2.5 rounded-xl bg-amber-500 text-zinc-950 text-xs font-bold hover:bg-amber-400 transition-colors shadow-sm"
            >
              Accept All
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
