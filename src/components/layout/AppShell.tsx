"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useDevices } from '@/lib/contexts/DeviceContext';

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

const MarketIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { devices, selectedDeviceId, selectDevice } = useDevices();

  const navItems = [
    { label: 'Home', path: '/dashboard', icon: HomeIcon },
    { label: 'EDH', path: '/marketplace', icon: MarketIcon },
    ...(user?.isSeller ? [{ label: 'Seller', path: '/marketplace/seller', icon: ZapIcon }] : []),
    ...(devices.length > 0 ? [{ label: 'Recharge', path: '/recharge', icon: ZapIcon }] : []),
    { label: 'History', path: '/transactions', icon: HistoryIcon },
    { label: 'Usage', path: '/consumption', icon: HistoryIcon },
    { label: 'Profile', path: '/profile', icon: UserIcon },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB] text-zinc-900 dark:bg-[#09090B] dark:text-zinc-50 w-full selection:bg-orange-500/30">
      
      {/* Sleek Header Navigation */}
      <header className="sticky top-0 z-20 bg-white/90 dark:bg-[#09090B]/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-3 sm:px-6 py-3 flex flex-wrap justify-between items-center gap-2 w-full">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/" aria-label="PayGo home" title="Go to homepage" className="group flex items-center shrink-0">
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
        
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          {devices.length > 1 && (
            <select aria-label="Select meter" value={selectedDeviceId || ''} onChange={(event) => selectDevice(event.target.value)} className="max-w-[112px] sm:max-w-[190px] bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-2.5 py-2 text-xs font-semibold text-zinc-800 dark:text-zinc-100">
              {devices.map((device) => <option key={device.deviceId} value={device.deviceId}>{device.deviceId}</option>)}
            </select>
          )}
          {user?.isSeller && (
            <Link
              href="/marketplace/seller"
              className={`px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1.5 ${
                pathname === '/marketplace/seller'
                  ? 'bg-amber-500 text-zinc-950 font-extrabold shadow-sm'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
              }`}
            >
              <span className="hidden xs:inline sm:inline">Seller</span><span className="sm:hidden">Sell</span>
            </Link>
          )}

          <Link 
            href="/profile" 
            title="Account Profile & Settings"
            className="flex items-center gap-2 px-2 sm:px-3 py-2 sm:py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-xs font-semibold text-zinc-700 dark:text-zinc-300"
          >
            <UserIcon className="w-4 h-4 text-zinc-500" />
            <span className="hidden sm:inline">{user?.email ? user.email.split('@')[0] : 'Profile'}</span>
          </Link>

          <button
            onClick={logout}
            title="Sign Out of Account"
            className="px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 text-xs font-bold transition-all border border-red-200/50 dark:border-red-500/20 flex items-center gap-1.5"
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

      <main className="flex-1 w-full min-w-0 max-w-5xl mx-auto p-3 sm:p-6 lg:p-8 pb-24">
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
        <ul className="flex justify-around items-center px-1 py-2 max-w-lg mx-auto">
          {navItems.filter(item => ['Home', 'EDH', 'Recharge', 'Profile'].includes(item.label) || (item.label === 'Seller' && user?.isSeller)).map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`flex flex-col items-center px-2 py-2 transition-colors min-w-0 flex-1 ${
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

