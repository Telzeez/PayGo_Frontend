"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { paymentApi } from '@/lib/api/payment';
import { devicesApi } from '@/lib/api/devices';
import Link from 'next/link';

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference') || searchParams.get('trxref');
  
  const [status, setStatus] = useState<'INITIALIZING' | 'VERIFYING_PAYMENT' | 'WAITING_HARDWARE' | 'CONFIRMED' | 'FAILED'>('INITIALIZING');
  const [kwhAmount, setKwhAmount] = useState<number | null>(null);
  const [deviceStatus, setDeviceStatus] = useState<'ONLINE' | 'OFFLINE'>('OFFLINE');
  const [hardwareStatus, setHardwareStatus] = useState<'PENDING' | 'CONFIRMED' | 'FAILED'>('PENDING');

  // Default device ID for prototype
  const DEVICE_ID = 'DEVICE-001';

  useEffect(() => {
    if (!reference) {
      setStatus('FAILED');
      return;
    }

    let isMounted = true;
    let paymentPollInterval: NodeJS.Timeout;
    let hardwarePollInterval: NodeJS.Timeout;

    let pollCount = 0;
    const checkPayment = async () => {
      pollCount++;
      try {
        const response = await paymentApi.verify(reference);
        if (response.success || (response as any).status === 'success') {
          // Payment is successful in the backend DB!
          if (isMounted) {
            const data = (response as any).data || response.transaction?.data;
            if (data && data.kwhAmount) {
              setKwhAmount(data.kwhAmount);
            }
            setStatus('WAITING_HARDWARE');
            clearInterval(paymentPollInterval);
            
            // Start polling hardware status
            hardwarePollInterval = setInterval(checkHardware, 3000);
            checkHardware(); // immediate check
            return;
          }
        }
      } catch (error) {
        console.error("Payment verify error:", error);
      }

      // If webhook is delayed beyond 12 seconds, advance to hardware waiting state so user gets status card
      if (pollCount >= 4 && isMounted) {
        setStatus('WAITING_HARDWARE');
        clearInterval(paymentPollInterval);
        hardwarePollInterval = setInterval(checkHardware, 3000);
        checkHardware();
      }
    };

    const checkHardware = async () => {
      try {
        const deviceRes = await devicesApi.getDevice(DEVICE_ID);
        if (deviceRes.success) {
          if (isMounted && deviceRes.status) {
            setDeviceStatus(deviceRes.status as 'ONLINE' | 'OFFLINE');
          }
          if (deviceRes.transactions) {
            const tx = deviceRes.transactions.find(t => t.reference === reference);
            if (tx) {
              setHardwareStatus(tx.hardwareStatus);
              if (tx.hardwareStatus === 'CONFIRMED') {
                if (isMounted) setStatus('CONFIRMED');
                clearInterval(hardwarePollInterval);
              } else if (tx.hardwareStatus === 'FAILED') {
                if (isMounted) setStatus('FAILED');
                clearInterval(hardwarePollInterval);
              }
            }
          }
        }
      } catch (error) {
        console.error("Hardware verify error:", error);
      }
    };

    // Start polling immediately
    setStatus('VERIFYING_PAYMENT');
    checkPayment();
    paymentPollInterval = setInterval(checkPayment, 3000);

    return () => {
      isMounted = false;
      clearInterval(paymentPollInterval);
      clearInterval(hardwarePollInterval);
    };
  }, [reference]);

  const CheckIcon = () => (
    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    </div>
  );

  const Spinner = () => (
    <div className="w-5 h-5 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin shrink-0"></div>
  );

  const Waiting = () => (
    <div className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0"></div>
  );

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-md mx-auto">
      
      <div className="flex items-center gap-4 mb-2">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Transaction Status</h1>
      </div>

      <section className="bg-white dark:bg-[#121214] rounded-3xl p-6 shadow-sm border border-zinc-200/60 dark:border-zinc-800/60">
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-zinc-900 dark:text-white">
                <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
                <rect x="9" y="9" width="6" height="6"></rect>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">{DEVICE_ID}</p>
              <p className="text-xs text-zinc-500">Ref: {reference?.substring(0, 10)}...</p>
            </div>
          </div>
          {kwhAmount && (
            <div className="text-right">
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">+{Number(kwhAmount).toFixed(2)}</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-500 font-medium">kWh</p>
            </div>
          )}
        </div>

        <div className="space-y-6 mb-8 relative">
          {/* Vertical connecting line */}
          <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-zinc-100 dark:bg-zinc-800 -z-10"></div>
          
          <div className="flex items-start gap-4">
            {status === 'INITIALIZING' || status === 'VERIFYING_PAYMENT' ? <Spinner /> : <CheckIcon />}
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Payment Received</p>
              <p className="text-xs text-zinc-500 mt-0.5">Verifying transaction with Paystack.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            {status === 'VERIFYING_PAYMENT' || status === 'INITIALIZING' ? <Waiting /> : <CheckIcon />}
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Financial Credit</p>
              <p className="text-xs text-zinc-500 mt-0.5">Your internal ledger has been funded.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            {status === 'WAITING_HARDWARE' ? <Spinner /> : (status === 'CONFIRMED' || status === 'FAILED' ? <CheckIcon /> : <Waiting />)}
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Remote Meter Credit</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                {deviceStatus === 'OFFLINE' ? 'Meter is offline. Command queued for auto-sync.' : 'Dispatching credit command via MQTT.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            {status === 'WAITING_HARDWARE' ? <Waiting /> : (status === 'CONFIRMED' ? <CheckIcon /> : (status === 'FAILED' ? <Waiting /> : <Waiting />))}
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Hardware Confirmation</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                {status === 'CONFIRMED' 
                  ? 'Meter has confirmed the credit.' 
                  : (deviceStatus === 'OFFLINE' ? 'Waiting for meter to reconnect online.' : 'Waiting for meter acknowledgement.')}
              </p>
            </div>
          </div>
        </div>

        {status === 'CONFIRMED' && (
          <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl p-5 text-center mb-6">
            <h3 className="text-emerald-800 dark:text-emerald-400 font-bold mb-1">Recharge Confirmed</h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-500 font-medium">{Number(kwhAmount).toFixed(2)} kWh has been credited to {DEVICE_ID}.</p>
          </div>
        )}

        {status === 'WAITING_HARDWARE' && deviceStatus === 'OFFLINE' && (
          <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-5 text-left mb-6 space-y-2">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-bold text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <span>Payment Successful (Meter Offline)</span>
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-500 leading-relaxed">
              Your financial balance has been credited. The backend will automatically send energy to your meter as soon as it reconnects online.
            </p>
            <p className="text-xs text-amber-900 dark:text-amber-400 font-medium pt-1">
              🔑 An <strong>SMS Recovery Token</strong> was also sent to your mobile phone to input manually on the meter keypad if offline.
            </p>
          </div>
        )}

        {status === 'FAILED' && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl p-5 text-center mb-6">
            <h3 className="text-red-800 dark:text-red-400 font-bold mb-1">Recharge Needs Attention</h3>
            <p className="text-xs text-red-700 dark:text-red-500 font-medium">
              Payment was received, but meter credit could not be verified automatically. Please check your SMS for your 16-digit token code.
            </p>
          </div>
        )}

        <Link 
          href="/dashboard"
          className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold py-4 px-4 rounded-2xl shadow-sm hover:bg-zinc-800 dark:hover:bg-white transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          Return to Dashboard
        </Link>
      </section>
    </div>
  );
}

