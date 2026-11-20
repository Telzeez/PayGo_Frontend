"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  const { register, resendVerification } = useAuth();
  const router = useRouter();

  const handleResend = async () => {
    if (!email || isResending) return;

    setIsResending(true);
    setResendMessage(null);

    try {
      await resendVerification(email.trim());
      setResendMessage({ type: 'success', message: 'A new verification link has been requested. Check your inbox and spam folder.' });
    } catch (err: any) {
      setResendMessage({ type: 'error', message: err?.message || 'Could not resend the verification email. Please try again.' });
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await register({ email, password, phone, role: 'BUYER' });
      if (result.requiresEmailVerification) {
        router.push('/login?registered=1');
      } else {
        router.push('/onboarding');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
      setShowResend(err?.data?.code === 'VERIFICATION_EMAIL_UNAVAILABLE');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Create Account" subtitle="Join PayGo today">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        
        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm font-medium border border-red-100 dark:border-red-500/20">
            {error}
          </div>
        )}
        {showResend && (
          <section className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-500/20 dark:bg-amber-500/5" aria-labelledby="register-resend-title">
            <div>
              <h2 id="register-resend-title" className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Your account is created, but email verification is pending</h2>
              <p className="mt-1 text-sm leading-5 text-zinc-600 dark:text-zinc-400">The verification email could not be delivered. You can try requesting a new link.</p>
            </div>
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending || !email.trim()}
              aria-busy={isResending}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              {isResending ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-90" d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Sending verification link…
                </>
              ) : 'Resend verification email'}
            </button>
            {resendMessage && (
              <p role="status" aria-live="polite" className={"rounded-lg border px-3 py-2.5 text-sm leading-5 " + (resendMessage.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300" : "border-red-200 bg-red-50 text-red-800 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300")}>{resendMessage.message}</p>
            )}
          </section>
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
            className="w-full bg-zinc-50 dark:bg-[#09090B] border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-shadow"
            placeholder="you@example.com"
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
            className="w-full bg-zinc-50 dark:bg-[#09090B] border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-shadow"
            placeholder="+234..."
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
            className="w-full bg-zinc-50 dark:bg-[#09090B] border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-shadow"
            placeholder="Min 6 characters"
          />
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium py-3.5 px-4 rounded-xl shadow-sm hover:bg-zinc-800 dark:hover:bg-white transition-all active:scale-[0.98] mt-4 disabled:opacity-70 disabled:pointer-events-none"
        >
          {isSubmitting ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-6">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-zinc-900 dark:text-zinc-100 hover:underline">
          Sign In
        </Link>
      </p>
    </AuthLayout>
  );
}
