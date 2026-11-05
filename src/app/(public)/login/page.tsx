"use client";

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { GoogleLogin } from '@react-oauth/google';
import AuthLayout from '@/components/auth/AuthLayout';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[400px] flex-col items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-zinc-950 dark:border-white"></div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const router = useRouter();
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login({ email, password });
      setIsSuccess(true);
      router.push(redirect);
    } catch (loginError: unknown) {
      setError(loginError instanceof Error ? loginError.message : 'Sign in failed. Please check your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async (credential?: string) => {
    if (!credential) {
      setError('Google sign-in did not return a credential. Please try again.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      const result = await loginWithGoogle(credential);
      if (result?.needsRegistration && result.registrationToken) {
        sessionStorage.setItem('paygo_google_registration_token', result.registrationToken);
        router.push('/register?google=1');
        return;
      }
      if (result?.needsRegistration) {
        throw new Error('Google registration could not be started. Please try again.');
      }

      setIsSuccess(true);
      router.push(redirect);
    } catch (loginError: unknown) {
      setError(loginError instanceof Error ? loginError.message : 'Google sign-in failed.');
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to your PayGo account">
      {isSubmitting ? (
        <div className="flex flex-col items-center justify-center space-y-6 py-8">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900 dark:border-zinc-700 dark:border-t-white"></div>
          <p className="font-semibold text-zinc-900 dark:text-white">Signing you in…</p>
        </div>
      ) : isSuccess ? (
        <div className="flex flex-col items-center justify-center space-y-4 py-8" role="status">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
            <svg className="h-9 w-9" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">Welcome back!</p>
        </div>
      ) : (
        <div className="space-y-5">
          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-medium text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 transition-shadow focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-[#09090B] dark:text-zinc-100 dark:focus:ring-zinc-100"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="current-password"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 transition-shadow focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-[#09090B] dark:text-zinc-100 dark:focus:ring-zinc-100"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-xl bg-zinc-900 px-4 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-zinc-800 active:scale-[0.98] dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              Sign In
            </button>
          </form>

          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
            <span className="mx-4 flex-shrink-0 text-xs font-medium uppercase text-zinc-400">Or continue with</span>
            <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
          </div>

          <div className="flex w-full justify-center">
            <GoogleLogin
              onSuccess={(response) => void handleGoogleSignIn(response.credential)}
              onError={() => setError('Google sign-in failed. Please try again.')}
              useOneTap
              theme="outline"
              size="large"
              shape="rectangular"
            />
          </div>

          <p className="pt-1 text-center text-sm text-zinc-500 dark:text-zinc-400">
            New to PayGo?{' '}
            <Link href="/register" className="font-semibold text-zinc-900 hover:underline dark:text-zinc-100">
              Create an account
            </Link>
          </p>
        </div>
      )}
    </AuthLayout>
  );
}
