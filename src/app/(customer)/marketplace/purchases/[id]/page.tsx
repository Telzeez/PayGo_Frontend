"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { marketplaceApi } from '@/lib/api/marketplace';
import { CheckCircle2, Clock, XCircle, AlertCircle, ArrowLeft, Loader2, CreditCard, Zap, Server } from 'lucide-react';

export default function PurchaseDetailPage() {
  const { id } = useParams();
  const [purchase, setPurchase] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPurchase = async () => {
      if (!id) return;
      try {
        const res = await marketplaceApi.getPurchaseDetail(Number(id));
        if (res.success) {
          setPurchase(res.purchase);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load purchase details.');
      } finally {
        setLoading(false);
      }
    };
    fetchPurchase();
  }, [id]);

  const getStateStep = () => {
    if (!purchase) return 0;
    
    // 1. CREATED (Always true if we have a record)
    // 2. PAYMENT_PENDING (If status === 'RESERVED' or 'PAYMENT_PENDING')
    // 3. PAYMENT_SUCCESS (If status === 'COMPLETED')
    // 4. CREDIT_PENDING (If hardwareStatus === 'PENDING')
    // 5. CREDIT_CONFIRMED (If hardwareStatus === 'CONFIRMED')
    
    if (purchase.status === 'CANCELLED' || purchase.status === 'EXPIRED') return -1;
    if (purchase.status === 'COMPLETED' && purchase.hardwareStatus === 'CONFIRMED') return 5;
    if (purchase.status === 'COMPLETED' && purchase.hardwareStatus === 'PENDING') return 4;
    if (purchase.status === 'COMPLETED') return 3;
    if (purchase.status === 'PAYMENT_PENDING' || purchase.status === 'RESERVED') return 2;
    
    return 1;
  };

  const currentStep = getStateStep();

  const StepIndicator = ({ stepNum, title, description, icon: Icon }: any) => {
    const isCompleted = currentStep > stepNum;
    const isCurrent = currentStep === stepNum;
    const isFailed = currentStep === -1;
    
    let colorClass = "bg-zinc-100 text-zinc-400 dark:bg-zinc-800/50 dark:text-zinc-600";
    let borderClass = "border-zinc-200 dark:border-zinc-800";
    
    if (isCompleted) {
      colorClass = "bg-emerald-500 text-white";
      borderClass = "border-emerald-500";
    } else if (isCurrent) {
      colorClass = "bg-amber-500 text-white animate-pulse";
      borderClass = "border-amber-500";
    } else if (isFailed && stepNum === 2) {
       colorClass = "bg-red-500 text-white";
       borderClass = "border-red-500";
    }

    return (
      <div className="flex gap-4 relative">
        <div className="flex flex-col items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 border-2 ${colorClass} ${borderClass}`}>
            {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
          </div>
          {stepNum < 5 && (
            <div className={`w-0.5 h-full min-h-[40px] absolute top-8 bottom-0 ${isCompleted ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-zinc-800'}`}></div>
          )}
        </div>
        <div className="pb-8 pt-1">
          <h3 className={`font-bold text-sm ${isCurrent ? 'text-zinc-900 dark:text-white' : isCompleted ? 'text-zinc-700 dark:text-zinc-300' : 'text-zinc-500'}`}>
            {title}
          </h3>
          <p className="text-xs text-zinc-500 mt-1">{description}</p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (error || !purchase) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-4 rounded-2xl text-sm font-semibold text-red-800 dark:text-red-400 text-center">
          {error || 'Purchase not found.'}
        </div>
        <Link href="/marketplace/purchases" className="mt-4 block text-center text-sm font-medium text-amber-600">
          Return to purchases
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 animate-in fade-in duration-500">
      <div className="mb-6">
        <Link href="/marketplace/purchases" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Purchases
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Purchase Details</h1>
        <p className="text-xs text-zinc-500 mt-1 font-mono">Ref: {purchase.purchaseReference}</p>
      </div>

      <div className="bg-white dark:bg-[#121214] border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-6 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-100 dark:border-zinc-800/50 pb-6 mb-6">
          <div>
            <div className="text-sm font-medium text-zinc-500 mb-1">Energy Amount</div>
            <div className="text-3xl font-black text-zinc-900 dark:text-white">
              {purchase.kwhRequested} <span className="text-lg text-zinc-500">kWh</span>
            </div>
          </div>
          <div className="mt-4 sm:mt-0 text-left sm:text-right">
            <div className="text-sm font-medium text-zinc-500 mb-1">Total Cost</div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-500">
              ₦{purchase.amount}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
          <div>
            <div className="text-zinc-500 mb-1">Source</div>
            <div className="font-medium text-zinc-900 dark:text-white">{purchase.sourceName}</div>
          </div>
          <div>
            <div className="text-zinc-500 mb-1">Distance</div>
            <div className="font-medium text-zinc-900 dark:text-white">{purchase.distanceMeters} meters away</div>
          </div>
          <div>
            <div className="text-zinc-500 mb-1">Target Meter</div>
            <div className="font-medium font-mono text-zinc-900 dark:text-white">{purchase.deviceId}</div>
          </div>
          <div>
            <div className="text-zinc-500 mb-1">Date</div>
            <div className="font-medium text-zinc-900 dark:text-white">{new Date(purchase.createdAt).toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#121214] border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">Transaction Status</h2>
        
        <div className="pl-2">
          <StepIndicator 
            stepNum={1} 
            title="Order Created" 
            description="Purchase intent was created and energy reserved." 
            icon={Server} 
          />
          <StepIndicator 
            stepNum={2} 
            title={currentStep === -1 ? "Payment Failed/Expired" : "Payment Pending"} 
            description="Waiting for Paystack transaction to complete." 
            icon={CreditCard} 
          />
          <StepIndicator 
            stepNum={3} 
            title="Payment Successful" 
            description="Funds secured. Generating hardware credit." 
            icon={CheckCircle2} 
          />
          <StepIndicator 
            stepNum={4} 
            title="Credit Pending (MQTT)" 
            description="Transmitting energy credit to your physical meter." 
            icon={Zap} 
          />
          <StepIndicator 
            stepNum={5} 
            title="Credit Confirmed" 
            description="Hardware meter has acknowledged receipt of energy." 
            icon={CheckCircle2} 
          />
        </div>
      </div>
    </div>
  );
}
