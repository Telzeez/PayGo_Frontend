"use client";

import React, { useEffect, useState } from 'react';
import { marketplaceApi, MarketplacePayoutAccount, MarketplacePayoutBank } from '@/lib/api/marketplace';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function PayoutAccountForm() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const canReceiveMarketplacePayments = Boolean(user?.isSeller || user?.role === 'OWNER');
  const [account, setAccount] = useState<MarketplacePayoutAccount | null>(null);
  const [banks, setBanks] = useState<MarketplacePayoutBank[]>([]);
  const [businessName, setBusinessName] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadedUserId, setLoadedUserId] = useState<number | null>(null);
  const isLoading = canReceiveMarketplacePayments && loadedUserId !== user?.id;

  useEffect(() => {
    if (!canReceiveMarketplacePayments) return;

    let active = true;
    Promise.all([marketplaceApi.getPayoutAccount(), marketplaceApi.getPayoutBanks()])
      .then(([accountResponse, bankResponse]) => {
        if (!active) return;
        setAccount(accountResponse.account);
        setBanks(bankResponse.banks);
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(requestError instanceof Error ? requestError.message : 'Unable to load payout account settings.');
        }
      })
      .finally(() => {
        if (active && user?.id !== undefined) setLoadedUserId(user.id);
      });

    return () => {
      active = false;
    };
  }, [canReceiveMarketplacePayments, user?.id]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      const response = await marketplaceApi.savePayoutAccount({
        businessName: businessName.trim(),
        bankCode,
        accountNumber: accountNumber.trim(),
      });
      setAccount(response.account);
      setBusinessName('');
      setBankCode('');
      setAccountNumber('');
      setIsEditing(false);
      setSuccess(response.message);
    } catch (requestError: unknown) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to save payout account.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isAuthLoading || !canReceiveMarketplacePayments) return null;

  return (
    <section className="min-w-0 rounded-3xl border border-zinc-200/60 bg-white p-5 shadow-sm dark:border-zinc-800/60 dark:bg-[#121214] sm:p-6">
      <h2 className="text-base font-bold text-zinc-900 dark:text-white">Marketplace payout account</h2>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Connect a verified Nigerian bank account through Paystack to receive marketplace sales. For each marketplace purchase, 90% goes to you and 10% to the platform. Meter top-ups are not split.
      </p>

      {isLoading ? (
        <p className="mt-4 text-sm text-zinc-500" role="status">Loading payout account…</p>
      ) : account?.configured && !isEditing ? (
        <div className="mt-4 flex min-w-0 flex-col gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="break-words text-sm font-semibold text-zinc-900 dark:text-white">{account.accountName}</p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {account.bankName} ···· {account.accountNumberLast4}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setError('');
              setSuccess('');
              setIsEditing(true);
            }}
            className="shrink-0 rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-white dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Change account
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2">
          <label className="min-w-0 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
            Business or seller name
            <input
              required
              maxLength={100}
              value={businessName}
              onChange={(event) => setBusinessName(event.target.value)}
              autoComplete="organization"
              className="mt-1 w-full min-w-0 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm font-normal text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
          </label>
          <label className="min-w-0 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
            Nigerian bank
            <select
              required
              value={bankCode}
              onChange={(event) => setBankCode(event.target.value)}
              className="mt-1 w-full min-w-0 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm font-normal text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            >
              <option value="">Select a bank</option>
              {banks.map((bank) => <option key={bank.code} value={bank.code}>{bank.name}</option>)}
            </select>
          </label>
          <label className="min-w-0 text-xs font-semibold text-zinc-600 dark:text-zinc-300 sm:col-span-2">
            10-digit account number
            <input
              required
              type="text"
              inputMode="numeric"
              pattern="[0-9]{10}"
              maxLength={10}
              value={accountNumber}
              onChange={(event) => setAccountNumber(event.target.value.replace(/\D/g, '').slice(0, 10))}
              autoComplete="off"
              className="mt-1 w-full min-w-0 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm font-normal text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
          </label>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 sm:col-span-2">
            Paystack verifies the account and creates the payout subaccount. PayGo stores only the subaccount reference and masked account details.
          </p>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <button
              type="submit"
              disabled={isSaving || banks.length === 0}
              className="rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
            >
              {isSaving ? 'Verifying with Paystack…' : 'Save payout account'}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setError('');
                }}
                className="rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-700 dark:border-zinc-600 dark:text-zinc-200"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {error && <p role="alert" className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}
      {success && <p role="status" className="mt-3 text-sm font-medium text-emerald-700 dark:text-emerald-400">{success}</p>}
    </section>
  );
}
