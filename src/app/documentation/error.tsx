"use client";

import Link from "next/link";

export default function DocumentationError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-[#F9FAFB] dark:bg-[#09090B] flex items-center justify-center p-6">
      <section className="w-full max-w-lg rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214] p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Documentation is temporarily unavailable</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">The guide ran into a problem while loading. Your account and dashboard are not affected.</p>
        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
          <button type="button" onClick={() => reset()} className="rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-zinc-950 hover:bg-amber-400">Try again</button>
          <Link href="/dashboard" className="rounded-xl border border-zinc-200 dark:border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-700 dark:text-zinc-200">Back to dashboard</Link>
        </div>
      </section>
    </main>
  );
}
