"use client";

import React, { useState, Suspense } from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout';
import { useAuth } from '@/lib/contexts/AuthContext';

// Main page component with Suspense boundary
export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-12 min-h-[400px] gap-4">
        <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20">
          <svg viewBox="0 0 48 48" className="w-9 h-9 text-amber-500" fill="none" aria-hidden="true">
            <rect x="8" y="15" width="29" height="19" rx="4" stroke="currentColor" strokeWidth="2.5" />
            <path d="M38 21v7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <path d="m25 17-8 10h7l-1 7 9-12h-7l1-5Z" fill="currentColor" className="animate-pulse" />
          </svg>
          <span className="absolute -right-1 -top-1 w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
        </div>
        <p className="text-xs font-semibold text-zinc-500">Getting PAYGO ready…</p>
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  );
}

// Inner component that uses useSearchParams
function AuthPageContent() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const initialMode = searchParams.get('mode');

  const [isLogin, setIsLogin] = useState(initialMode !== 'signup');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const role: 'BUYER' = 'BUYER';
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registrationToken, setRegistrationToken] = useState<string | null>(null);
  const [verificationPending, setVerificationPending] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [canResendVerification, setCanResendVerification] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendFeedback, setResendFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [resetFeedback, setResetFeedback] = useState('');
  const [registrationNotice] = useState(searchParams.get('registered') === '1');

  const { login, loginWithGoogle, register, registerGoogle, resendVerification, sendPasswordReset } = useAuth();
  const router = useRouter();

  const handleResendVerification = async () => {
    const targetEmail = verificationPending ? verificationEmail : email;
    if (!targetEmail.trim() || isResending) return;

    setIsResending(true);
    setResendFeedback(null);
    try {
      await resendVerification(targetEmail.trim());
      setResendFeedback({
        type: 'success',
        message: 'Verification link requested. Check your inbox and spam folder.',
      });
    } catch (err: any) {
      setResendFeedback({
        type: 'error',
        message: err?.message || 'Could not resend the verification email. Please try again.',
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (registrationToken) {
        await registerGoogle({ registrationToken, phone: phone || undefined, role });
      } else if (isLogin) {
        await login({ email, password });
      } else {
        const result = await register({ email, password, phone: phone || undefined, role });
        if (result.requiresEmailVerification) {
          setVerificationPending(true);
          setVerificationEmail(result.email || email);
          setIsSubmitting(false);
          return;
        }
      }

      setIsSubmitting(false);
      setIsSuccess(true);
      const destination = isLogin ? redirect : '/onboarding';
      router.replace(destination);
    } catch (err: any) {
      if (isLogin && err?.code === 'EMAIL_NOT_FOUND') {
        setError('Your existing PAYGO profile needs to be connected to Firebase. Select Sign Up and use the same email address to activate your account. Your existing PAYGO records and permissions will be preserved.');
      } else {
        setError(err.message || 'Authentication failed. Please check your details.');
      }
      if (isLogin && err?.status === 403 && err?.data?.code === 'EMAIL_NOT_VERIFIED') {
        setCanResendVerification(true);
        setVerificationEmail(email);
        setResendFeedback(null);
      }
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title={isLogin ? "Welcome Back" : "Create Account"}
      subtitle={isLogin ? "Sign in to your PayGo account" : "Join PayGo today"}
    >
      {verificationPending ? (
        <div className="space-y-4 py-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 text-2xl">✉</div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Check your inbox</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">We sent a verification link to <strong className="break-all text-zinc-800 dark:text-zinc-200">{verificationEmail}</strong>. Verify your email before signing in.</p>
          <button
            type="button"
            onClick={handleResendVerification}
            disabled={isResending}
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-3 text-sm font-semibold transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isResending ? 'Sending verification link…' : 'Resend verification email'}
          </button>
          {resendFeedback && (
            <p role="status" aria-live="polite" className={`rounded-lg px-3 py-2 text-sm ${
              resendFeedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300'
            }`}>
              {resendFeedback.message}
            </p>
          )}
          <button type="button" onClick={() => { setVerificationPending(false); setIsLogin(true); setError(''); }} className="text-sm font-semibold text-amber-600">Back to sign in</button>
        </div>
      ) : isSubmitting ? (
        <div className="flex flex-col items-center justify-center py-8 space-y-6 animate-in fade-in zoom-in duration-300">
          <div className="relative w-28 h-24 flex items-center justify-center">
            <div className="absolute bottom-2 w-24 h-2 rounded-full bg-amber-500/10 blur-md animate-pulse" />
            <svg viewBox="0 0 112 88" className="relative w-28 h-22" fill="none" aria-hidden="true">
              <path d="M10 68h92" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-zinc-200 dark:text-zinc-700" />
              <rect x="28" y="20" width="56" height="46" rx="9" stroke="currentColor" strokeWidth="3" className="text-zinc-800 dark:text-zinc-200" />
              <path d="M84 34h5v18h-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-800 dark:text-zinc-200" />
              <path d="m58 25-14 20h12l-3 15 17-23H58l0-12Z" fill="currentColor" className="text-amber-500 animate-pulse" />
              <path d="M13 15h9M17.5 10.5v9M94 14h7M97.5 10.5v7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-amber-500">
                <animate attributeName="opacity" values="0.25;1;0.25" dur="1.4s" repeatCount="indefinite" />
              </path>
              <circle cx="17" cy="54" r="3" fill="currentColor" className="text-emerald-500">
                <animate attributeName="cy" values="58;48;58" dur="1.6s" repeatCount="indefinite" />
              </circle>
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
          {registrationNotice && isLogin && (
            <div role="status" className="mb-4 rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-300">
              Your account has been created. Check your inbox (and spam folder) for the PAYGO email verification link before signing in.
            </div>
          )}
          {error && !registrationToken && (
            <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm font-medium border border-red-100 dark:border-red-500/20 mb-4 flex items-start gap-2">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}
          {canResendVerification && (
            <section className="mb-5 rounded-xl border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-500/20 dark:bg-amber-500/5" aria-labelledby="resend-verification-title">
              <div className="mb-3">
                <h3 id="resend-verification-title" className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Email verification required</h3>
                <p className="mt-1 text-sm leading-5 text-zinc-600 dark:text-zinc-400">
                  {verificationEmail ? <>We need you to verify <strong className="break-all">{verificationEmail}</strong> before you can sign in.</> : 'Verify your email address before signing in.'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleResendVerification}
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
              {resendFeedback && (
                <p
                  role="status"
                  aria-live="polite"
                  className={`mt-3 rounded-lg border px-3 py-2.5 text-sm leading-5 ${
                    resendFeedback.type === 'success'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300'
                      : 'border-red-200 bg-red-50 text-red-800 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300'
                  }`}
                >
                  {resendFeedback.message}
                </p>
              )}
              <p className="mt-3 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                If the email does not arrive, check your spam folder. You can request another link after the cooldown.
              </p>
            </section>
          )}

          {registrationToken && (
            <div className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 p-4 rounded-xl text-sm font-medium border border-emerald-200 dark:border-emerald-500/20 mb-6 flex items-start gap-3 shadow-sm">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-bold text-emerald-800 dark:text-emerald-300 mb-0.5">Google Verification Successful!</p>
                <p className="text-emerald-600 dark:text-emerald-400 font-normal">Almost there! Please provide your phone number to complete your registration.</p>
              </div>
            </div>
          )}

          <div className="flex bg-zinc-100 dark:bg-zinc-800/50 rounded-xl p-1 mb-6 border border-zinc-200/50 dark:border-zinc-700/50">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(''); setRegistrationToken(null); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                isLogin && !registrationToken
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(''); setRegistrationToken(null); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                !isLogin || registrationToken
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {(!isLogin && !registrationToken) && (
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
              </>
            )}

            {(!isLogin || registrationToken) && (
              <>

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

              </>
            )}

            {!registrationToken && (
              <>
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
              </>
            )}

            {isLogin && !registrationToken && (
              <div className="flex justify-end mt-[-4px]">
                <button
                  type="button"
                  onClick={async () => {
                    setResetFeedback('');
                    if (!email.trim()) {
                      setResetFeedback('Enter your email address first.');
                      return;
                    }
                    try {
                      await sendPasswordReset(email.trim());
                      setResetFeedback('If a Firebase account exists for this address, a password reset email has been sent.');
                    } catch (resetError: any) {
                      setResetFeedback(resetError?.message || 'Could not request a password reset.');
                    }
                  }}
                  className="text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold py-3.5 px-4 rounded-xl shadow-sm hover:bg-zinc-800 dark:hover:bg-white transition-all active:scale-[0.98] mt-2 text-sm"
            >
              {registrationToken ? 'Complete Registration' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
            
            {!registrationToken && (
              <>
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
                  <span className="flex-shrink-0 mx-4 text-zinc-400 text-xs font-medium uppercase">Or continue with</span>
                  <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
                </div>

            <div className="flex justify-center w-full">
              <GoogleLogin
                onSuccess={async (credentialResponse: CredentialResponse) => {
                  if (!credentialResponse.credential) {
                    setError('Google did not return a valid sign-in credential.');
                    return;
                  }
                  setIsSubmitting(true);
                  setError('');
                  try {
                    await loginWithGoogle(credentialResponse.credential);
                    setIsSuccess(true);
                    router.replace('/onboarding');
                  } catch (googleError: any) {
                    setError(googleError?.message || 'Google sign-in failed. Please try again.');
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                onError={() => setError('Google sign-in was cancelled or could not be completed.')}
                text="continue_with"
                shape="rectangular"
                width="320"
              />
            </div>
            {resetFeedback && (
              <p role="status" className="mt-2 text-center text-xs text-zinc-500 dark:text-zinc-400">{resetFeedback}</p>
            )}
              </>
            )}
          </form>
          {isLogin && !registrationToken && (
            <p className="mt-5 text-center text-xs leading-5 text-zinc-500 dark:text-zinc-400">
              Existing PAYGO user signing in for the first time after the authentication update? Choose <strong>Sign Up</strong> and use the same email address. Your existing PAYGO profile and records will be linked after verification.
            </p>
          )}
        </div>
      )}
    </AuthLayout>
  );
}