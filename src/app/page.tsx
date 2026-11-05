"use client";

import React, { useEffect, useState, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { marketplaceApi, NearbyListing } from '@/lib/api/marketplace';
import { paymentApi } from '@/lib/api/payment';
import { EnergyDurationPredictor } from '@/components/marketplace/EnergyDurationPredictor';

// Standard Lucide SVG Icon Components
const MapPinIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const ZapIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const ShieldCheckIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const CreditCardIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <line x1="2" x2="22" y1="10" y2="10" />
  </svg>
);

const ArrowRightIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const StarIcon = ({ className = "w-4 h-4 text-amber-500 fill-amber-500" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const RefreshIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
  </svg>
);

const SlidersIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="4" x2="4" y1="21" y2="14" />
    <line x1="4" x2="4" y1="10" y2="3" />
    <line x1="12" x2="12" y1="21" y2="12" />
    <line x1="12" x2="12" y1="8" y2="3" />
    <line x1="20" x2="20" y1="21" y2="16" />
    <line x1="20" x2="20" y1="12" y2="3" />
    <line x1="2" x2="6" y1="14" y2="14" />
    <line x1="10" x2="14" y1="8" y2="8" />
    <line x1="18" x2="22" y1="16" y2="16" />
  </svg>
);

const XIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

function MarketplaceContent() {
  const { isAuthenticated, user } = useAuth();
  const searchParams = useSearchParams();
  const targetListingId = searchParams.get('listingId');

  // Location State
  const [locationGranted, setLocationGranted] = useState(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isDemoLocation, setIsDemoLocation] = useState(false);

  // Search & Feed State
  const [radiusMeters, setRadiusMeters] = useState<number>(1000);
  const [listings, setListings] = useState<NearbyListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Selected Listing Drawer State
  const [selectedListing, setSelectedListing] = useState<NearbyListing | null>(null);
  const [kwhAmount, setKwhAmount] = useState<string>('5.0');
  const [purchasing, setPurchasing] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Auto-load demo location on mount instead of prompting for GPS
  useEffect(() => {
    useDemoLocation();
  }, []);

  const requestLocation = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setLocationGranted(true);
          setIsDemoLocation(false);
        },
        (_err) => {
          useDemoLocation();
        },
        { timeout: 8000 }
      );
    } else {
      useDemoLocation();
    }
  };

  const useDemoLocation = () => {
    setLatitude(7.44);
    setLongitude(3.9);
    setLocationGranted(true);
    setIsDemoLocation(true);
  };

  // Fetch Nearby Energy Listings when location or radius changes
  const fetchNearby = async () => {
    if (latitude === null || longitude === null) return;
    setLoading(true);
    setError('');

    try {
      const res = await marketplaceApi.getNearbyListings(latitude, longitude, radiusMeters);
      if (res.success) {
        setListings(res.listings);

        // Auto-restore selected listing context if returning from login
        if (targetListingId) {
          const matched = res.listings.find((item) => item.listingId === parseInt(targetListingId, 10));
          if (matched) {
            setSelectedListing(matched);
          }
        }
      }
    } catch (err: any) {
      console.error('Error fetching nearby listings:', err);
      setError(err.message || 'Failed to search nearby energy listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (locationGranted && latitude !== null && longitude !== null) {
      fetchNearby();
    }
  }, [locationGranted, latitude, longitude, radiusMeters, targetListingId]);

  // Handle Buy Click
  const handleBuyClick = (item: NearbyListing) => {
    setSelectedListing(item);
    if (!isAuthenticated) {
      setShowAuthModal(true);
    }
  };

  // Handle Purchase Confirmation for authenticated users
  const handleConfirmPurchase = async () => {
    if (!selectedListing || !user?.email || latitude === null || longitude === null) return;

    const numKwh = parseFloat(kwhAmount);
    if (isNaN(numKwh) || numKwh <= 0) {
      setError('Please enter a valid energy amount in kWh.');
      return;
    }

    setError('');
    setPurchasing(true);

    try {
      const intentRes = await marketplaceApi.createPurchaseIntent(selectedListing.listingId, {
        kwhRequested: numKwh,
        buyerLatitude: latitude,
        buyerLongitude: longitude,
      });

      if (!intentRes.success || !intentRes.purchase) {
        throw new Error(intentRes.message || 'Failed to create marketplace purchase intent.');
      }

      const paymentRes = await paymentApi.initiate({
        amount: intentRes.purchase.amount,
        email: user.email,
        deviceId: intentRes.purchase.deviceId,
      });

      if (paymentRes.success && paymentRes.data?.authorization_url) {
        window.location.href = paymentRes.data.authorization_url;
      } else {
        throw new Error('Failed to initialize payment gateway.');
      }
    } catch (err: any) {
      setError(err.message || 'Purchase process failed. Please try again.');
      setPurchasing(false);
    }
  };

  const numKwh = parseFloat(kwhAmount) || 0;
  const totalPrice = selectedListing ? Math.round(numKwh * selectedListing.pricePerKwh) : 0;

  const loginRedirectUrl = selectedListing 
    ? `/login?redirect=${encodeURIComponent(`/?listingId=${selectedListing.listingId}`)}`
    : '/login?redirect=/';

  const signupRedirectUrl = selectedListing
    ? `/login?mode=signup&redirect=${encodeURIComponent(`/?listingId=${selectedListing.listingId}`)}`
    : '/login?mode=signup&redirect=/';

  const scrollToFeed = () => {
    const el = document.getElementById('nearby-feed');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#09090B] text-zinc-900 dark:text-zinc-50 flex flex-col font-sans selection:bg-amber-500/30">
      {/* Header — Sticky Navigation */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#09090B]/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-6 lg:px-12 py-4 flex justify-between items-center w-full">
        <Link href="/" className="group flex items-center">
          <span className="font-black text-2xl tracking-tighter text-zinc-900 dark:text-white group-hover:text-amber-500 transition-colors">
            PayGo<span className="text-amber-500">.</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          <Link href="/" className="text-zinc-900 dark:text-white font-bold transition-colors">Home</Link>
          <button onClick={scrollToFeed} className="hover:text-zinc-900 dark:hover:text-white transition-colors">Nearby Sellers</button>
          <Link href="/marketplace/seller" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Seller Portal</Link>
          <Link href="/documentation" className="hover:text-zinc-900 dark:hover:text-white transition-colors">project-overview</Link>
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs hover:bg-amber-400 transition-all shadow-sm flex items-center gap-1.5"
            >
              <span>Dashboard</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold text-xs hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/login?mode=signup"
                className="px-4 py-2 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs hover:bg-amber-400 transition-all shadow-sm"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-white dark:bg-[#121214] border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-6 lg:px-12 py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Project Branding & Primary CTA */}
          <div className="lg:col-span-4 space-y-6 text-left">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400">PAYGO MARKETPLACE</span>
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-zinc-900 dark:text-white mt-1 leading-[1.08]">
                PAYGO<br /><span className="text-zinc-500 dark:text-zinc-400 font-light">LOCAL ENERGY.</span>
              </h1>
            </div>

            <button
              onClick={scrollToFeed}
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-2xl shadow-sm transition-all active:scale-95"
            >
              <span>FIND NEARBY ENERGY</span>
              <ArrowRightIcon className="w-4 h-4" />
            </button>

            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium pr-4">
              Connect directly with nearby solar generation sources. Proximity matching screens eligible local systems within your radius to minimize physical distribution distance.
            </p>

            {/* Hardware Telemetry Detail */}
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
              <div className="flex gap-1 text-zinc-400">
                <span className="w-0.5 h-6 bg-zinc-400 dark:bg-zinc-600 inline-block"></span>
                <span className="w-1 h-6 bg-zinc-400 dark:bg-zinc-600 inline-block"></span>
                <span className="w-0.5 h-6 bg-zinc-400 dark:bg-zinc-600 inline-block"></span>
                <span className="w-1.5 h-6 bg-zinc-400 dark:bg-zinc-600 inline-block"></span>
                <span className="w-0.5 h-6 bg-zinc-400 dark:bg-zinc-600 inline-block"></span>
                <span className="w-1 h-6 bg-zinc-400 dark:bg-zinc-600 inline-block"></span>
              </div>
              <span className="font-mono text-[10px] text-zinc-400 tracking-widest uppercase">
                TELEMETRY // MQTT ACTIVE (ESP32)
              </span>
            </div>
          </div>

          {/* Center Column: Hero Image Card */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="relative w-full max-w-sm aspect-[3/4] rounded-3xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800 shadow-xl group">
              <Image
                src="/hero image.webp"
                alt="Solar energy panels"
                fill
                priority
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 400px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-85" />
              
              <div className="absolute bottom-5 inset-x-5 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border border-zinc-200/50 dark:border-white/10 rounded-2xl py-3 px-4 text-center">
                <p className="text-xs font-bold tracking-widest text-zinc-900 dark:text-white uppercase">POWERED BY SUNLIGHT.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Features Breakdown */}
          <div className="lg:col-span-4 space-y-6 text-left border-l-0 lg:border-l border-zinc-200 dark:border-zinc-800 lg:pl-8">
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <StarIcon key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
                ))}
                <span className="text-xs font-bold text-zinc-900 dark:text-white ml-2">4.9/5</span>
                <span className="text-xs text-zinc-500">Proximity Score</span>
              </div>
              <blockquote className="text-sm font-semibold italic text-zinc-800 dark:text-zinc-200 leading-snug">
                "Clean, local solar energy — trade directly with nearby microgrid sellers."
              </blockquote>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/20">
                  <MapPinIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Proximity Screening</h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Haversine matching screens sellers between 0m and 5km radius.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/20">
                  <ZapIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Hardware Telemetry Duration</h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Runtime prediction calculates duration directly from meter consumption rate.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/20">
                  <ShieldCheckIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Idempotent Settlement</h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Concurrency row locking prevents double-deductions or overselling.</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={scrollToFeed}
                className="inline-flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-white hover:text-amber-500 transition-colors uppercase tracking-wider group"
              >
                <span>VIEW NEARBY SELLERS</span>
                <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Main Marketplace Feed */}
      <main id="nearby-feed" className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-12 space-y-8 pb-32">
        
        {/* Search & Location Bar */}
        <section className="bg-white dark:bg-[#121214] border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-5 overflow-hidden">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
              <span className={`w-2.5 h-2.5 rounded-full ${isDemoLocation ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse shrink-0`}></span>
              <span>Coordinates: <strong className="text-zinc-900 dark:text-white font-mono">{latitude?.toFixed(4)}, {longitude?.toFixed(4)}</strong></span>
              {isDemoLocation && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                  DEV DEMO LOCATION
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-500">Adjust matching distance radius below to screen nearby solar generation sources.</p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={requestLocation}
                className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold text-xs transition-all flex items-center justify-center gap-2 border border-zinc-200 dark:border-zinc-700 active:scale-95"
              >
                <MapPinIcon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="whitespace-nowrap">Use GPS</span>
              </button>
              <button
                onClick={useDemoLocation}
                className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 font-semibold text-xs transition-all border border-zinc-200 dark:border-zinc-800 whitespace-nowrap"
              >
                Demo Location
              </button>
            </div>

            <div className="flex items-center justify-between sm:justify-start gap-1 bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-x-auto max-w-full">
              <SlidersIcon className="w-3.5 h-3.5 text-zinc-500 ml-1.5 mr-1 shrink-0 hidden sm:block" />
              {[200, 500, 1000, 2000, 5000].map((r) => (
                <button
                  key={r}
                  onClick={() => setRadiusMeters(r)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    radiusMeters === r
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  {r >= 1000 ? `${r / 1000}km` : `${r}m`}
                </button>
              ))}
            </div>
          </div>
        </section>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-4 rounded-2xl text-xs font-semibold text-red-800 dark:text-red-400 text-center">
            {error}
          </div>
        )}

        {/* Nearby Sellers Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Eligible Nearby Energy Sellers ({listings.length})</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Ranked by Device Status, Haversine Distance, and Tariff Rate</p>
            </div>
            {locationGranted && (
              <button
                onClick={fetchNearby}
                className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-semibold flex items-center gap-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3.5 py-2 rounded-xl transition-all shadow-sm"
              >
                <RefreshIcon className="w-3.5 h-3.5" />
                <span>Refresh Feed</span>
              </button>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              <div className="h-28 bg-white dark:bg-[#121214] rounded-3xl animate-pulse border border-zinc-200/60 dark:border-zinc-800/60"></div>
              <div className="h-28 bg-white dark:bg-[#121214] rounded-3xl animate-pulse border border-zinc-200/60 dark:border-zinc-800/60"></div>
            </div>
          ) : listings.length === 0 ? (
            <div className="bg-white dark:bg-[#121214] border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-10 shadow-sm text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20">
                <MapPinIcon className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-zinc-900 dark:text-white">No active energy sellers found within {radiusMeters >= 1000 ? `${radiusMeters / 1000}km` : `${radiusMeters}m`}</p>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                Try expanding your search radius or click "Demo Location" to view test sellers.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {listings.map((item) => (
                <div
                  key={item.listingId}
                  className="bg-white dark:bg-[#121214] border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-6 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
                        <MapPinIcon className="w-3.5 h-3.5" />
                        <span>{item.distanceMeters} m away</span>
                      </span>

                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-semibold border ${
                          item.deviceStatus === 'ONLINE'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                            : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${item.deviceStatus === 'ONLINE' ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'}`}></span>
                        <span>{item.deviceStatus}</span>
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white group-hover:text-amber-500 transition-colors">
                      {item.sourceName} <span className="text-xs text-zinc-400 font-mono font-normal">({item.deviceId})</span>
                    </h3>

                    <p className="text-xs text-zinc-500">
                      Available Energy Offer: <strong className="text-zinc-800 dark:text-zinc-200">{Number(item.availableKwh).toFixed(2)} kWh</strong> (Allowed Radius: {item.effectiveRadiusMeters}m)
                    </p>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-zinc-100 dark:border-zinc-800/80 pt-4 md:pt-0">
                    <div className="text-left md:text-right">
                      <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Tariff Rate</p>
                      <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        ₦{Number(item.pricePerKwh).toLocaleString()}<span className="text-xs text-zinc-400 font-normal">/kWh</span>
                      </p>
                    </div>

                    <button
                      onClick={() => handleBuyClick(item)}
                      className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-extrabold py-3 px-6 rounded-2xl text-xs hover:bg-zinc-800 dark:hover:bg-white transition-all shadow-sm active:scale-95 flex items-center gap-2"
                    >
                      <span>View</span>
                      <ArrowRightIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Technology / How It Works Section */}
        <section id="how-it-works" className="bg-white dark:bg-[#121214] border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-8 sm:p-12 shadow-sm space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400">PAYGO SUBSYSTEM</span>
            <h2 className="text-xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">How PayGo Local Energy Operates</h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">Seamless integration across location matching, automated NGN payment, and MQTT hardware synchronization.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs">
            <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/80 rounded-3xl p-7 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm mx-auto border border-amber-500/20">
                <MapPinIcon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-zinc-900 dark:text-white text-sm">1. Proximity Screening</h3>
              <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Haversine distance logic screens nearby eligible solar systems within allowed service radiuses.
              </p>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/80 rounded-3xl p-7 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm mx-auto border border-amber-500/20">
                <CreditCardIcon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-zinc-900 dark:text-white text-sm">2. Authoritative Settlement</h3>
              <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Server calculates payment totals, locks reserved energy rows, and initiates Paystack checkout.
              </p>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/80 rounded-3xl p-7 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm mx-auto border border-amber-500/20">
                <ZapIcon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-zinc-900 dark:text-white text-sm">3. Hardware Delivery</h3>
              <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Energy credits are published over MQTT to physical solar meters with 16-digit offline SMS fallback tokens.
              </p>
            </div>
          </div>

          <div className="pt-4 text-center">
            <Link
              href="/documentation"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs hover:bg-zinc-800 dark:hover:bg-white transition-all shadow-sm active:scale-95"
            >
              <span>Read Easy Project Guide & System Documentation</span>
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* Guest Sign-In Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-7 w-full max-w-md shadow-2xl relative space-y-6 animate-in zoom-in-95 duration-200 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
              <ZapIcon className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Account Required to Transact</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
                You are about to purchase <strong className="text-zinc-800 dark:text-zinc-200">{selectedListing?.sourceName}</strong> ({selectedListing?.distanceMeters}m away). Please sign in or create an account to complete your payment.
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <Link
                href={loginRedirectUrl}
                className="w-full bg-amber-500 text-zinc-950 font-bold py-3.5 rounded-2xl shadow-sm hover:bg-amber-400 transition-all text-xs flex items-center justify-center gap-2"
              >
                <span>Sign In to Complete Purchase</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
              <Link
                href={signupRedirectUrl}
                className="w-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold py-3.5 rounded-2xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all text-xs"
              >
                Create New Account
              </Link>
              <button
                onClick={() => {
                  setShowAuthModal(false);
                  setSelectedListing(null);
                }}
                className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 mt-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Authenticated Purchase Confirmation Drawer Modal */}
      {selectedListing && isAuthenticated && !showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-7 w-full max-w-md shadow-2xl relative space-y-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Confirm Marketplace Purchase</h3>
              <button
                onClick={() => setSelectedListing(null)}
                className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Breakdown Summary */}
            <div className="bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl p-4 space-y-3 text-xs border border-zinc-200/60 dark:border-zinc-800">
              <div className="flex justify-between">
                <span className="text-zinc-500">Seller Source</span>
                <span className="font-bold text-zinc-900 dark:text-white">{selectedListing.sourceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Distance</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">{selectedListing.distanceMeters} meters</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Device ID</span>
                <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">{selectedListing.deviceId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Tariff Rate</span>
                <span className="font-bold text-zinc-900 dark:text-white">₦{selectedListing.pricePerKwh}/kWh</span>
              </div>
            </div>

            {/* kWh Input */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Requested Energy (kWh)
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max={selectedListing.availableKwh}
                value={kwhAmount}
                onChange={(e) => setKwhAmount(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-lg font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-1">
                <span>Max available: {Number(selectedListing.availableKwh).toFixed(2)} kWh</span>
                <Link href="/documentation" className="text-amber-600 dark:text-amber-400 font-semibold hover:underline flex items-center gap-1">
                  <span>Usage Duration Concept ↗</span>
                </Link>
              </div>
            </div>

            {/* Energy Duration Predictor Widget */}
            <EnergyDurationPredictor purchasedKwh={numKwh} compact={true} />

            {/* Total Price Display */}
            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-amber-800 dark:text-amber-400">Total Purchase Amount</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-300 mt-0.5">₦{totalPrice.toLocaleString()}</p>
              </div>
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-3 py-1 rounded-xl">
                Paystack NGN
              </span>
            </div>

            {/* Submit Action */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedListing(null)}
                className="flex-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold py-3.5 px-4 rounded-xl text-xs hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmPurchase}
                disabled={purchasing || numKwh <= 0}
                className="flex-1 bg-amber-500 text-zinc-950 font-bold py-3.5 px-4 rounded-xl text-xs hover:bg-amber-400 transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2 shadow-sm"
              >
                {purchasing ? (
                  <span className="w-4 h-4 rounded-full border-2 border-zinc-950/30 border-t-zinc-950 animate-spin"></span>
                ) : (
                  'Confirm & Pay'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full bg-white dark:bg-[#121214] border-t border-zinc-200/80 dark:border-zinc-800/80 py-8 px-6 sm:px-12 text-zinc-900 dark:text-zinc-100">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <Link href="/" className="group flex items-center">
              <span className="font-black text-xl tracking-tighter text-zinc-900 dark:text-white group-hover:text-amber-500 transition-colors">
                PayGo<span className="text-amber-500">.</span>
              </span>
            </Link>
            <span className="text-zinc-300 dark:text-zinc-700">|</span>
            <span className="text-zinc-500 dark:text-zinc-400 font-medium">Local Energy Marketplace</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-zinc-500 dark:text-zinc-400">
            <span>Designed & Built by</span>
            <a
              href="https://github.com/Telzeez"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-zinc-900 dark:text-white hover:text-amber-500 transition-colors"
            >
              Telzeez
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white text-xs font-bold">Loading PAYGO Marketplace...</div>}>
      <MarketplaceContent />
    </Suspense>
  );
}
