"use client";

import Link from 'next/link';

export default function TokensPage() {
  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Automatic Meter Credit</h1>
        <p className="text-sm text-zinc-500 mt-1">PAYGO no longer uses keypad recovery tokens.</p>
      </div>
      <section className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214] p-6 space-y-3">
        <h2 className="font-semibold text-zinc-900 dark:text-white">How your recharge reaches the meter</h2>
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          After a successful payment, your energy balance is updated on the server. Your ESP32 meter receives the updated balance automatically through its secure HTTPS connection.
        </p>
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          If the meter is temporarily offline, the credit remains pending and synchronises when the meter reconnects. You do not need to enter a code on the hardware.
        </p>
        <Link href="/transactions" className="inline-flex rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-3 text-sm font-semibold">View payment history</Link>
      </section>
    </div>
  );
}
