"use client";

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { GoogleLogin } from '@react-oauth/google';
import AuthLayout from '@/components/auth/AuthLayout';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[400px] flex-col items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-zinc-950 dark:border-white"></div>
      </div>
    }>
      <RegisterPageContent />
    </Suspense>
  );
}

function RegisterPageContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'CUSTOMER' | 'SELLER'>('CUSTOMER');
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, registerGoogle, loginWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isGoogleRegistration = searchParams.get('google') === '1';

  const handleGoogleSignUp = async (credential?: string) => {
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
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isGoogleRegistration && password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isGoogleRegistration) {
        const registrationToken = sessionStorage.getItem('paygo_google_registration_token');
        if (!registrationToken) {
          throw new Error('Google registration expired. Please continue with Google again.');
        }
        await registerGoogle({
          registrationToken,
          phone: phone || undefined,
          role,
        });
        sessionStorage.removeItem('paygo_google_registration_token');
      } else {
        await register({ email, password, phone, role });
      }
      router.push(role === 'SELLER' ? '/marketplace/seller' : '/onboarding');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title={isGoogleRegistration ? 'Complete Your Account' : 'Create Account'}
      subtitle={isGoogleRegistration ? 'Finish setting up your PayGo account' : 'Join PayGo today'}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        
        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm font-medium border border-red-100 dark:border-red-500/20" role="alert">
            {error}
          </div>
        )}

        {/* 3. Role Selection Segmented Control Buttons */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            I want to join as a:
          </label>
          <div className="grid grid-cols-2 gap-2 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setRole('CUSTOMER')}
              className={`py-2.5 text-xs font-semibold rounded-lg transition-all ${
                role === 'CUSTOMER'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Energy Buyer
            </button>
            <button
              type="button"
              onClick={() => setRole('SELLER')}
              className={`py-2.5 text-xs font-semibold rounded-lg transition-all ${
                role === 'SELLER'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Solar Seller
            </button>
          </div>
        </div>

        {!isGoogleRegistration && <div>
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
        </div>}

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

        {!isGoogleRegistration && <div>
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
        </div>}

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium py-3.5 px-4 rounded-xl shadow-sm hover:bg-zinc-800 dark:hover:bg-white transition-all active:scale-[0.98] mt-4 disabled:opacity-70 disabled:pointer-events-none"
        >
          {isSubmitting ? 'Creating account...' : isGoogleRegistration ? 'Complete Registration' : 'Create Account'}
        </button>
      </form>

      <div className="mt-5 flex flex-col items-center gap-4">
          <div className="relative flex w-full items-center">
            <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
            <span className="mx-4 flex-shrink-0 text-xs font-medium uppercase text-zinc-400">Or continue with</span>
            <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
          </div>
          <GoogleLogin
            onSuccess={(response) => void handleGoogleSignUp(response.credential)}
            onError={() => setError('Google sign-in failed. Please try again.')}
            theme="outline"
            size="large"
            shape="rectangular"
          />
      </div>

      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-6">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-zinc-900 dark:text-zinc-100 hover:underline">
          Sign In
        </Link>
      </p>
    </AuthLayout>
  );
}
