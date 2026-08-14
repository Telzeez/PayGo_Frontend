"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';

// Premium Inline SVGs (Lucide)
const ZapIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const UserIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const HomeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const HistoryIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 3v18h18" />
    <path d="m19 9-5 5-4-4-3 3" />
  </svg>
);

const KeyIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
);

const MarketIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const BookIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path>
    <path d="M6.5 6H20"></path>
  </svg>
);

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Home', path: '/dashboard', icon: HomeIcon },
    { label: 'Market', path: '/', icon: MarketIcon },
    { label: 'Docs', path: '/documentation', icon: BookIcon },
    { label: 'Recharge', path: '/recharge', icon: ZapIcon },
    { label: 'History', path: '/transactions', icon: HistoryIcon },
    { label: 'Tokens', path: '/tokens', icon: KeyIcon },
    { label: 'Profile', path: '/profile', icon: UserIcon },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB] text-zinc-900 dark:bg-[#09090B] dark:text-zinc-50 w-full selection:bg-orange-500/30">
      
      {/* Sleek Header Navigation */}
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-[#09090B]/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-6 py-3.5 flex justify-between items-center w-full">
        <div className="flex items-center gap-6">
          <Link href="/" className="group flex items-center shrink-0">
            <span className="font-black text-xl tracking-tighter text-zinc-900 dark:text-white group-hover:text-orange-500 transition-colors">
              PayGo<span className="text-orange-500">.</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-zinc-100/70 dark:bg-zinc-800/50 p-1 rounded-2xl border border-zinc-200/50 dark:border-zinc-800">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="flex items-center gap-2.5">
          {user?.role === 'OWNER' && (
            <Link
              href="/admin"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                pathname === '/admin'
                  ? 'bg-amber-500 text-zinc-950 font-extrabold shadow-sm'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
              }`}
            >
              <span>Admin Mode</span>
            </Link>
          )}

          <Link 
            href="/profile" 
            title="Account Profile & Settings"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-xs font-semibold text-zinc-700 dark:text-zinc-300"
          >
            <UserIcon className="w-4 h-4 text-zinc-500" />
            <span className="hidden sm:inline">{user?.email ? user.email.split('@')[0] : 'Profile'}</span>
          </Link>

          <button
            onClick={logout}
            title="Sign Out of Account"
            className="px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 text-xs font-bold transition-all border border-red-200/50 dark:border-red-500/20 flex items-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 pb-24">
        {children}
      </main>

      {/* Footer Bar */}
      <footer className="w-full border-t border-zinc-200/60 dark:border-zinc-800/60 py-6 text-center text-xs text-zinc-400 dark:text-zinc-500 pb-24 md:pb-8">
        <p>
          © {new Date().getFullYear()} PayGo System. Architected & Engineered by{' '}
          <a
            href="https://github.com/Telzeez"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-zinc-700 dark:text-zinc-300 hover:text-amber-500 transition-colors"
          >
            Telzeez
          </a>{' '}
          (<a href="https://github.com/Telzeez" target="_blank" rel="noopener noreferrer" className="hover:underline">GitHub ↗</a> • <a href="https://https://www.linkedin.com/in/abdlazeezolasunkanmi/" target="_blank" rel="noopener noreferrer" className="hover:underline">LinkedIn ↗</a>).
        </p>
      </footer>

      {/* Premium Glassmorphic Bottom Nav (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-20 bg-white/90 dark:bg-[#09090B]/90 backdrop-blur-lg border-t border-zinc-200 dark:border-zinc-800 pb-safe">
        <ul className="flex justify-around items-center p-2 max-w-md mx-auto">
          {navItems.filter(item => ['Home', 'Market', 'Recharge', 'History', 'Profile'].includes(item.label)).map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`flex flex-col items-center p-2 transition-colors w-14 ${
                    isActive 
                      ? 'text-zinc-900 dark:text-white font-semibold' 
                      : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-amber-500 scale-110' : ''} transition-transform`} />
                  <span className="text-[10px] tracking-wide">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

