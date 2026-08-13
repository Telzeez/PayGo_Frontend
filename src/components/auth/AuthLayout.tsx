import React from 'react';
import Link from 'next/link';

export default function AuthLayout({ children, title, subtitle }: { children: React.ReactNode, title: string, subtitle: string }) {
  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#09090B] flex flex-col items-center justify-center p-4 sm:p-6 w-full">
      <div className="w-full max-w-md bg-white dark:bg-[#121214] rounded-3xl p-6 sm:p-8 shadow-sm border border-zinc-200/60 dark:border-zinc-800/60">
        
        <div className="flex justify-center mb-6">
          <Link href="/" className="group flex items-center">
            <span className="font-black text-3xl tracking-tighter text-zinc-900 dark:text-white group-hover:text-orange-500 transition-colors">
              PayGo<span className="text-orange-500">.</span>
            </span>
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-center text-zinc-900 dark:text-white mb-2">{title}</h1>
        <p className="text-center text-zinc-500 dark:text-zinc-400 mb-8">{subtitle}</p>

        {children}
      </div>
    </div>
  );
}
