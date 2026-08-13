"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { EnergyDurationPredictor } from '@/components/marketplace/EnergyDurationPredictor';

const SunIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);

const BookOpenIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const ZapIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const WrenchIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

const DropletIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
  </svg>
);

const InfoIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

const MapPinIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const HelpCircleIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const CheckCircleIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const ShieldCheckIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export default function DocumentationPage() {
  const [activeTab, setActiveTab] = useState<'easy_guide' | 'estimator' | 'faq' | 'technical'>('easy_guide');
  const [demoKwh, setDemoKwh] = useState<number>(5.0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "What happens if the seller's battery runs low during my purchase?",
      a: "Sellers configure a mandatory battery reserve limit (e.g., 50%). If the seller's battery reaches that floor limit, their listing automatically pauses on the marketplace so the seller's own household is never left in darkness."
    },
    {
      q: "Can two buyers accidentally purchase the exact same energy listing?",
      a: "No. PAYGO uses database row-level locking (FOR UPDATE). When Buyer 1 initiates checkout, that listing inventory is atomically reserved. Buyer 2 cannot purchase the same energy."
    },
    {
      q: "Why does the app say 'Estimated Duration' instead of 'Guaranteed Hours'?",
      a: "Duration depends on what appliances you run. If you buy 5.0 kWh and turn on an air conditioner, the energy will finish faster than if you only use standing fans and LED light bulbs."
    },
    {
      q: "What if my mobile internet connection drops right after I pay?",
      a: "PAYGO generates an encrypted 16-digit token code on your confirmation screen and sends it to your mobile phone via SMS. You can type this code manually into your meter's physical keypad."
    },
    {
      q: "Is PAYGO safe for my household electrical appliances?",
      a: "Yes. PAYGO operates within standard AC electrical voltage parameters (220V - 240V) and uses smart meters equipped with physical overcurrent circuit protection."
    }
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#09090B] text-zinc-900 dark:text-zinc-50 flex flex-col font-sans selection:bg-amber-500/30">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#09090B]/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-6 lg:px-12 py-4 flex justify-between items-center w-full">
        <Link href="/" className="group flex items-center">
          <span className="font-black text-2xl tracking-tighter text-zinc-900 dark:text-white group-hover:text-amber-500 transition-colors">
            PayGo<span className="text-amber-500">.</span>
          </span>
        </Link>

        <nav className="flex items-center gap-4 text-xs font-bold">
          <Link href="/" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
            Marketplace
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-xl bg-amber-500 text-zinc-950 hover:bg-amber-400 transition-all shadow-sm"
          >
            Dashboard
          </Link>
        </nav>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 flex-1">
        {/* Title Header */}
        <div className="space-y-3 text-center sm:text-left border-b border-zinc-200 dark:border-zinc-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <SunIcon className="w-3.5 h-3.5" />
            <span>PAYGO SYSTEM MASTER GUIDE</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-white">
            How PayGo Works
          </h1>
          <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 max-w-3xl leading-relaxed">
            An English guide explaining how PAYGO connects nearby solar owners with prepaid energy buyers through smart metering and location matching.
          </p>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 pt-4 justify-center sm:justify-start">
            <button
              onClick={() => setActiveTab('easy_guide')}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'easy_guide'
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-md'
                  : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
              }`}
            >
              <BookOpenIcon className="w-4 h-4" />
              <span>Full Project Story & Concept</span>
            </button>
            <button
              onClick={() => setActiveTab('estimator')}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'estimator'
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-md'
                  : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
              }`}
            >
              <ZapIcon className="w-4 h-4" />
              <span>Interactive Duration Estimator</span>
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'faq'
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-md'
                  : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
              }`}
            >
              <HelpCircleIcon className="w-4 h-4" />
              <span>FAQ & Troubleshooting</span>
            </button>
            <button
              onClick={() => setActiveTab('technical')}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'technical'
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-md'
                  : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
              }`}
            >
              <WrenchIcon className="w-4 h-4" />
              <span>Technical Architecture</span>
            </button>
          </div>
        </div>

        {/* TAB 1: Easy Guide */}
        {activeTab === 'easy_guide' && (
          <div className="space-y-12 animate-in fade-in duration-300">
            {/* Section 1: Executive Summary */}
            <section className="bg-white dark:bg-[#121214] border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-10 space-y-6 shadow-sm">
              <div className="space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400">1. EXECUTIVE SUMMARY</span>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">What is PAYGO?</h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  <strong>PAYGO</strong> (Pay-As-You-Go) is an automated local energy marketplace and smart metering system. It allows solar panel owners (<strong>sellers</strong>) with surplus electricity to sell energy to nearby households (<strong>buyers</strong>). 
                  Transactions occur in Nigerian Naira (NGN), and energy credits are delivered wirelessly over cellular networks directly to the buyer's physical smart meter.
                </p>
              </div>

              {/* Compound Story Breakdown */}
              <div className="bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl p-6 border border-zinc-200/60 dark:border-zinc-800 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                  The Real-World Compound Story:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200/60 dark:border-zinc-800 space-y-1.5">
                    <span className="font-bold text-amber-600 dark:text-amber-400">Household A (Solar Owner)</span>
                    <p className="text-zinc-500">3kW solar system. By 1:00 PM on sunny days, batteries are 100% full, leaving 10.5 kWh of unused solar energy.</p>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200/60 dark:border-zinc-800 space-y-1.5">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Household B (Working Family)</span>
                    <p className="text-zinc-500">Needs afternoon power for standing fans, LED television, laptop for remote work, and lighting.</p>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200/60 dark:border-zinc-800 space-y-1.5">
                    <span className="font-bold text-amber-500">PAYGO Smart Meter</span>
                    <p className="text-zinc-500">Delivers credit over cellular MQTT stream and automatically activates the home's power relay.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Proximity Physics */}
            <section className="bg-white dark:bg-[#121214] border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-10 space-y-6 shadow-sm">
              <div className="space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400">2. PHYSICS OF LOCAL ENERGY</span>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Why Physical Distance Matters</h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Electricity is physical. Unlike streaming video or digital software, electricity cannot be shipped across long distances without high-voltage power lines and heavy energy dissipation.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl space-y-1.5">
                  <div className="font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                    <MapPinIcon className="w-4 h-4 text-emerald-500" />
                    <span>Eligible Nearby Match (0m - 500m)</span>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-300">
                    High transmission efficiency, minimal line voltage drop, and direct local micro-grid cable connectivity.
                  </p>
                </div>

                <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl space-y-1.5">
                  <div className="font-bold text-red-800 dark:text-red-400 flex items-center gap-1.5">
                    <MapPinIcon className="w-4 h-4 text-red-500" />
                    <span>Ineligible Distant Seller (&gt; 5 km)</span>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-300">
                    Automatically filtered out by PAYGO's Haversine proximity screening engine to prevent impossible power transfer.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3: Water Tank Masterclass */}
            <section className="bg-white dark:bg-[#121214] border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-10 space-y-6 shadow-sm">
              <div className="space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400">3. UNDERSTANDING kWh VS WATTS</span>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Kilowatts-Hour and Watts</h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Understanding the difference between <strong>Energy (kWh)</strong> and <strong>Power (Watts)</strong> is simple using our water tank analogy:
                </p>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                <div className="space-y-2">
                  <div className="font-bold text-amber-700 dark:text-amber-400 text-sm flex items-center gap-2">
                    <DropletIcon className="w-4 h-4 text-amber-500" />
                    <span>Energy (kWh) = Water Tank Capacity</span>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    This is the total volume of electrical energy stored in your account (e.g., buying 5.0 kWh gives you 5,000 Watt-hours of capacity).
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="font-bold text-amber-700 dark:text-amber-400 text-sm flex items-center gap-2">
                    <ZapIcon className="w-4 h-4 text-amber-500" />
                    <span>Power (Watts) = Faucet Flow Rate</span>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    How fast your appliances consume energy. Opening the tap slightly (a light bulb) makes water last long; opening it fully (refrigerator + AC) drains it fast.
                  </p>
                </div>
              </div>

              {/* Appliance Load Table */}
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                  Typical Household Appliance Power Table:
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <span className="block font-bold text-zinc-900 dark:text-white">LED Bulb</span>
                    <span className="text-amber-600 font-mono">10 Watts</span>
                  </div>
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <span className="block font-bold text-zinc-900 dark:text-white">Standing Fan</span>
                    <span className="text-amber-600 font-mono">75 Watts</span>
                  </div>
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <span className="block font-bold text-zinc-900 dark:text-white">LED TV</span>
                    <span className="text-amber-600 font-mono">100 Watts</span>
                  </div>
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <span className="block font-bold text-zinc-900 dark:text-white">Refrigerator</span>
                    <span className="text-amber-600 font-mono">150 Watts</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4: End-to-End Walkthrough */}
            <section className="bg-white dark:bg-[#121214] border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-10 space-y-6 shadow-sm">
              <div className="space-y-2 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <span className="text-xs font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400">4. FULL SCENARIO STEP-BY-STEP</span>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Detailed Purchase Journey (₦1,250 Example)</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Follow Chidi's exact step-by-step experience from discovering a nearby seller to receiving physical power in his home.
                </p>
              </div>

              {/* Step Cards Sequence */}
              <div className="space-y-6 text-xs">

                {/* Step 1 */}
                <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-extrabold text-sm">
                      <span className="w-7 h-7 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center font-black text-xs">1</span>
                      <span>Seller Discovery & Proximity Matching</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono text-[10px] font-bold">2:15 PM</span>
                  </div>
                  <div className="space-y-2 text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    <p>
                      Chidi opens the PAYGO app on his phone in Ibadan. His browser requests GPS location coordinates (<code className="font-mono bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 rounded">7.44, 3.90</code>).
                    </p>
                    <p>
                      Behind the scenes, PAYGO calculates the distance to all nearby solar generators using the Haversine distance formula. It discovers <strong>Solar Home A</strong> located <strong>180 meters away</strong>—well within Solar Home A’s 500m maximum service radius.
                    </p>
                    <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 flex justify-between items-center text-[11px] font-mono">
                      <span>Listing Card: Solar Home A</span>
                      <span className="text-emerald-600 font-bold">180m away | 10.5 kWh available @ ₦250/kWh</span>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-extrabold text-sm">
                      <span className="w-7 h-7 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center font-black text-xs">2</span>
                      <span>Energy Selection (5.0 kWh)</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono text-[10px] font-bold">5,000 Wh Capacity</span>
                  </div>
                  <div className="space-y-2 text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    <p>
                      Chidi clicks <strong>Buy Energy</strong> and inputs <strong>5.0 kWh</strong>. This corresponds to 5,000 Watt-hours of electrical capacity to power his household appliances.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-extrabold text-sm">
                      <span className="w-7 h-7 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center font-black text-xs">3</span>
                      <span>Meter Telemetry & Runtime Prediction</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold">Tier 1 Live Stream</span>
                  </div>
                  <div className="space-y-2 text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    <p>
                      PAYGO queries Chidi’s active smart meter telemetry stream over MQTT. His physical PZEM sensor measures a real-time household load draw of <strong>380 Watts</strong> (2 standing fans 150W + TV 100W + laptop 65W + bulbs 50W + router 15W).
                    </p>
                    <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-1 font-mono text-[11px]">
                      <div className="flex justify-between text-zinc-500">
                        <span>Duration Formula:</span>
                        <span>(5,000 Wh) / 380 W</span>
                      </div>
                      <div className="flex justify-between font-bold text-amber-600 dark:text-amber-400">
                        <span>Predicted Runtime:</span>
                        <span>≈ 13 hours 10 minutes</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-extrabold text-sm">
                      <span className="w-7 h-7 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center font-black text-xs">4</span>
                      <span>Total Price Calculation & Inventory Reservation</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono text-[10px] font-bold">₦1,250 Total</span>
                  </div>
                  <div className="space-y-2 text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    <p>
                      Total price is calculated: <strong>5.0 kWh × ₦250 = ₦1,250</strong>. Chidi completes payment via Paystack in Naira.
                    </p>
                    <p>
                      To prevent any double-buying, PAYGO’s backend issues a PostgreSQL <code className="font-mono bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 rounded">FOR UPDATE</code> transaction lock on Solar Home A's inventory row, deducting 5.0 kWh from the available balance (10.5 kWh → 5.5 kWh).
                    </p>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">
                      <span className="w-7 h-7 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center font-black text-xs">5</span>
                      <span>Hardware Delivery & Power Flow</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold flex items-center gap-1">
                      <CheckCircleIcon className="w-3 h-3 text-emerald-500" />
                      <span>MQTT Delivery Active</span>
                    </span>
                  </div>
                  <div className="space-y-2 text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    <p>
                      Paystack confirms payment. The server sets transaction status to <strong>Payment: SUCCESSFUL</strong> and transmits a 5.0 kWh credit payload via MQTT to Chidi's ESP32 smart meter.
                    </p>
                    <p>
                      The meter's internal relay closes, turning ON electricity immediately. As Chidi uses electricity, the PZEM sensor measures actual consumption in real-time, counting down credit from 5.0 kWh to 0.0 kWh.
                    </p>
                  </div>
                </div>

                {/* Step 6 */}
                <div className="bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 space-y-2">
                  <div className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-2 text-xs">
                    <ShieldCheckIcon className="w-4 h-4 text-amber-500" />
                    <span>Offline Signal Backup (16-Digit SMS Token)</span>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 text-[11px] leading-relaxed">
                    If cellular signal is temporarily absent, the confirmation screen generates an encrypted 16-digit token (<code className="font-mono font-bold bg-amber-500/10 px-1 py-0.5 rounded text-amber-800 dark:text-amber-300">8492-1039-5821-9940</code>) sent via SMS. Chidi can type this passcode directly into his meter keypad to restore power manually.
                  </p>
                </div>

              </div>
            </section>
          </div>
        )}

        {/* TAB 2: Interactive Predictor */}
        {activeTab === 'estimator' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <InfoIcon className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Adjust energy amount slider below to test the 3-tier fallback predictor.</span>
            </div>

            <div className="space-y-4">
              <label htmlFor="kwh-demo-slider" className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Test Energy Purchase Amount: <span className="text-amber-600 dark:text-amber-400 font-mono text-sm">{demoKwh.toFixed(1)} kWh</span>
              </label>
              <input
                id="kwh-demo-slider"
                type="range"
                min="0.5"
                max="20"
                step="0.5"
                value={demoKwh}
                onChange={(e) => setDemoKwh(parseFloat(e.target.value))}
                className="w-full accent-amber-500 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>

            <EnergyDurationPredictor purchasedKwh={demoKwh} />
          </div>
        )}

        {/* TAB 3: FAQ */}
        {activeTab === 'faq' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="space-y-2 mb-6">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Frequently Asked Questions</h2>
              <p className="text-xs text-zinc-500">Clear answers to common questions about PAYGO marketplace transactions, meters, and tokens.</p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-[#121214] border border-zinc-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full p-5 text-left flex justify-between items-center font-bold text-xs text-zinc-900 dark:text-white hover:text-amber-500 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <span className="text-base font-mono">{openFaq === idx ? '−' : '+'}</span>
                  </button>
                  {openFaq === idx && (
                    <div className="px-5 pb-5 pt-0 text-xs text-zinc-600 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800/80 pt-3 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Technical Specs */}
        {activeTab === 'technical' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <section className="bg-white dark:bg-[#121214] border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-10 space-y-6 shadow-sm">
              <div className="space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400">HARDWARE TELEMETRY FLOW</span>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Dataflow & System Boundaries</h2>
              </div>

              <div className="bg-zinc-950 text-zinc-200 p-6 rounded-2xl font-mono text-xs overflow-x-auto leading-relaxed border border-zinc-800">
                {`PZEM-004T (V, A, W, kWh)
     │
     ▼
 ESP32 Microcontroller
     │ (MQTT Publish over Cellular/Wi-Fi)
     ▼
 PAYGO Backend (Node.js / Postgres)
     │ (Telemetry Engine)
     ▼
 Duration Prediction Engine
     │ (REST API)
     ▼
 Marketplace Buyer UI ("≈ 13h 10m")`}
              </div>

              <div className="space-y-4 text-xs text-zinc-600 dark:text-zinc-400">
                <h3 className="font-bold text-zinc-900 dark:text-white text-sm">Key Engineering Principles:</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Non-Lossy Accounting</strong>: Energy credit is tracked strictly against PZEM-measured consumption without hardcoded efficiency multipliers.</li>
                  <li><strong>3-Tier Load Hierarchy</strong>: Tier 1 (Live telemetry), Tier 2 (Logged history), Tier 3 (Appliance load selector fallback for new buyers).</li>
                  <li><strong>Concurrency Locks</strong>: PostgreSQL row locking (FOR UPDATE) guarantees atomic energy reservation.</li>
                </ul>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full bg-white dark:bg-[#121214] border-t border-zinc-200/80 dark:border-zinc-800/80 py-8 px-6 sm:px-12 text-zinc-900 dark:text-zinc-100">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-black text-xl tracking-tighter text-zinc-900 dark:text-white hover:text-amber-500 transition-colors">
              PayGo<span className="text-amber-500">.</span>
            </Link>
            <span className="text-zinc-300 dark:text-zinc-700">|</span>
            <span className="text-zinc-500 dark:text-zinc-400 font-medium">Documentation & System Guide</span>
          </div>

          <div className="flex items-center gap-4 text-zinc-500 dark:text-zinc-400">
            <a href="https://github.com/Telzeez" target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition-colors font-semibold">
              GitHub
            </a>
            <a href="https://www.linkedin.com/in/abdlazeezolasunkanmi/" target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition-colors font-semibold">
              LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}