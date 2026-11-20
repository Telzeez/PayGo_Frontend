"use client";

import React, { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { verifyEmail } = useAuth();
  const verifyEmailRef = useRef(verifyEmail);
  verifyEmailRef.current = verifyEmail;
  const [message, setMessage] = useState('Verifying your email address…');
  const [failed, setFailed] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setFailed(true);
      setMessage('This verification link is incomplete.');
      return;
    }

    let active = true;
    verifyEmailRef.current(token)
      .then(() => {
        if (!active) return;
        setMessage('Your email is verified. Taking you to PAYGO…');
        router.replace('/onboarding');
      })
      .catch((error: any) => {
        if (!active) return;
        setFailed(true);
        setMessage(error?.message || 'This verification link is invalid or has expired.');
      });

    return () => { active = false; };
  }, [token, router]);

  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <section className="w-full max-w-md rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214] p-6 sm:p-8 text-center shadow-sm">
        <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-2xl ${failed ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>
          {failed ? '!' : '✓'}
        </div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Email verification</h1>
        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">{message}</p>
        {failed && <Link href="/login" className="mt-6 inline-flex rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-zinc-950">Return to sign in</Link>}
      </section>
    </main>
  );
}

export default function VerifyEmailPage() {
  return <Suspense fallback={<main className="p-8 text-center text-sm text-zinc-500">Loading verification…</main>}><VerifyEmailContent /></Suspense>;
}
