"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function AuthPage() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const initialMode = searchParams.get('mode');

  const [isLogin, setIsLogin] = useState(initialMode !== 'signup');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'BUYER' | 'OWNER'>('BUYER');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { login, register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (isLogin) {
        await login({ email, password });
      } else {
        await register({ email, password, phone: phone || undefined, role });
      }
      
      setIsSubmitting(false);
      setIsSuccess(true);
      
      setTimeout(() => {
        const destination = role === 'OWNER' ? '/admin' : redirect;
        router.push(destination);
      }, 1200);

    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your details.');
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout 
      title={isLogin ? "Welcome Back" : "Create Account"} 
      subtitle={isLogin ? "Sign in to your SolarPayMe account" : "Join SolarPayMe today"}
    >
      
      {isSubmitting ? (
        <div className="flex flex-col items-center justify-center py-8 space-y-6 animate-in fade-in zoom-in duration-300">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg
              className="absolute inset-0 w-full h-full text-zinc-300 dark:text-zinc-700 animate-spin"
              viewBox="0 0 100 100"
              fill="none"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray="70 140"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray="70 140"
                strokeDashoffset="140"
                className="opacity-50 text-zinc-900 dark:text-white"
              />
              <circle cx="50" cy="95" r="5" fill="currentColor" className="text-zinc-900 dark:text-white" />
            </svg>

            <svg
              className="w-10 h-10 text-zinc-900 dark:text-white animate-pulse"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <p className="text-zinc-900 dark:text-white font-semibold animate-pulse">
            {isLogin ? "Authenticating..." : "Creating Account..."}
          </p>
        </div>
      ) : isSuccess ? (
        <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-100 dark:border-emerald-500/20">
            <svg
              className="w-10 h-10 text-emerald-600 dark:text-emerald-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p className="text-emerald-700 dark:text-emerald-400 font-bold text-lg">
            {isLogin ? "Welcome Back!" : "Account Created!"}
          </p>
        </div>
      ) : (
        <div className="animate-in fade-in duration-500">
          
          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm font-medium border border-red-100 dark:border-red-500/20 mb-4">
              {error}
            </div>
          )}

          <div className="flex bg-zinc-100 dark:bg-zinc-800/50 rounded-xl p-1 mb-6 border border-zinc-200/50 dark:border-zinc-700/50">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                isLogin
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                !isLogin
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5" htmlFor="fullname">
                    Full Name
                  </label>
                  <input 
                    id="fullname"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-[#09090B] border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-shadow text-sm"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5" htmlFor="phone">
                    Phone Number (Optional)
                  </label>
                  <input 
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-[#09090B] border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-shadow text-sm"
                    placeholder="+234..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Account Type
                  </label>
                  <div className="flex gap-3">
                    <button 
                      type="button"
                      onClick={() => setRole('BUYER')}
                      className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold transition-all ${role === 'BUYER' ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-transparent shadow-sm' : 'bg-white dark:bg-[#09090B] text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800'}`}
                    >
                      Customer (Buyer)
                    </button>
                    <button 
                      type="button"
                      onClick={() => setRole('OWNER')}
                      className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold transition-all ${role === 'OWNER' ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-transparent shadow-sm' : 'bg-white dark:bg-[#09090B] text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800'}`}
                    >
                      Admin (Owner)
                    </button>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5" htmlFor="email">
                Email Address
              </label>
              <input 
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-zinc-50 dark:bg-[#09090B] border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-shadow text-sm"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5" htmlFor="password">
                Password
              </label>
              <input 
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-zinc-50 dark:bg-[#09090B] border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-shadow text-sm"
                placeholder="••••••••"
              />
            </div>

            {isLogin && (
              <div className="flex justify-end mt-[-4px]">
                <button type="button" className="text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 font-medium transition-colors">
                  Forgot password?
                </button>
              </div>
            )}

            <button 
              type="submit" 
              className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold py-3.5 px-4 rounded-xl shadow-sm hover:bg-zinc-800 dark:hover:bg-white transition-all active:scale-[0.98] mt-2 text-sm"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      )}
    </AuthLayout>
  );
}
