"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { marketplaceApi, NearbyListing } from '@/lib/api/marketplace';
import { paymentApi } from '@/lib/api/payment';
import { EnergyDurationPredictor } from '@/components/marketplace/EnergyDurationPredictor';

const MapPinIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export default function BuyerMarketplacePage() {
  const { user } = useAuth();

  // Location State
  const [locationGranted, setLocationGranted] = useState(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationStatus, setLocationStatus] = useState<'prompt' | 'granted' | 'denied' | 'unavailable'>('prompt');

  // Search & Listings State
  const [radiusMeters, setRadiusMeters] = useState<number>(1000);
  const [listings, setListings] = useState<NearbyListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Selected Purchase Confirmation Drawer State
  const [selectedListing, setSelectedListing] = useState<NearbyListing | null>(null);
  const [kwhAmount, setKwhAmount] = useState<string>('5.0');
  const [purchasing, setPurchasing] = useState(false);

  const [isDemoLocation, setIsDemoLocation] = useState(false);

  // Request HTML5 Browser Location
  const requestLocation = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      setLocationStatus('prompt');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setLocationGranted(true);
          setLocationStatus('granted');
          setIsDemoLocation(false);
        },
        (_err) => {
          useDemoLocation();
          setLocationStatus('denied');
        },
        { timeout: 8000 }
      );
    } else {
      useDemoLocation();
      setLocationStatus('unavailable');
    }
  };

  const useDemoLocation = () => {
    setLatitude(7.44);
    setLongitude(3.9);
    setLocationGranted(true);
    setIsDemoLocation(true);
  };

  // Fetch Nearby Listings when coordinates or radius changes
  const fetchNearby = async () => {
    if (latitude === null || longitude === null) return;
    setLoading(true);
    setError('');

    try {
      const res = await marketplaceApi.getNearbyListings(latitude, longitude, radiusMeters);
      if (res.success) {
        setListings(res.listings);
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
  }, [locationGranted, latitude, longitude, radiusMeters]);

  // Initiate Marketplace Purchase Intent and Continue to Paystack Checkout
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
      // Step 1: Create Concurrency-Safe Reserved Purchase Intent
      const intentRes = await marketplaceApi.createPurchaseIntent(selectedListing.listingId, {
        kwhRequested: numKwh,
        buyerLatitude: latitude,
        buyerLongitude: longitude,
      });

      if (!intentRes.success || !intentRes.purchase) {
        throw new Error(intentRes.message || 'Failed to create marketplace purchase intent.');
      }

      // Step 2: Trigger Existing Payment Initiation with Paystack
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

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="w-9 h-9 rounded-full bg-white dark:bg-[#121214] flex items-center justify-center border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Local Energy Marketplace</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              Discover eligible nearby solar energy sellers and buy clean prepaid power directly.
            </p>
          </div>
        </div>

        <Link
          href="/marketplace/seller"
          className="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs hover:bg-zinc-800 dark:hover:bg-white transition-all shadow-sm flex items-center gap-2 self-start sm:self-auto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-amber-500">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          Seller Portal (My Energy)
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-4 rounded-2xl text-xs font-semibold text-red-800 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Location Grant Card */}
      {!locationGranted ? (
        <section className="bg-white dark:bg-[#121214] border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-8 shadow-sm text-center space-y-4">
          <div className="w-14 h-14 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto text-2xl border border-amber-500/20">
            <MapPinIcon className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Enable Location Matching</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mt-1.5 leading-relaxed">
              SolarPayMe uses geographical proximity matching to screen nearby solar energy sellers and minimize physical distribution distance.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={requestLocation}
              className="w-full sm:w-auto bg-amber-500 text-zinc-950 font-bold py-3.5 px-6 rounded-2xl shadow-sm hover:bg-amber-400 transition-all text-xs active:scale-95 flex items-center justify-center gap-2"
            >
              Allow GPS Location
            </button>
            <button
              onClick={useDemoLocation}
              className="w-full sm:w-auto bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold py-3.5 px-6 rounded-2xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all text-xs"
            >
              Use Test Location (7.44, 3.90)
            </button>
          </div>
        </section>
      ) : (
        <>
          {/* Unified Marketplace Feed */}
          <section className="bg-white dark:bg-[#121214] border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl overflow-hidden shadow-sm">
            {/* Header & Controls Area */}
            <div className="p-5 sm:p-6 border-b border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/20">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                <div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <MapPinIcon className="w-4 h-4 text-amber-500" />
                    Eligible Nearby Sellers ({listings.length})
                  </h2>
                  <div className="flex flex-col gap-2 mt-2">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${isDemoLocation ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`}></span>
                      Coordinates: <strong className="text-zinc-900 dark:text-white">{latitude?.toFixed(4)}, {longitude?.toFixed(4)}</strong>
                      {isDemoLocation && (
                        <span className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 tracking-wider">
                          DEMO
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Adjust matching distance radius below to screen nearby solar generation sources.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2 justify-end">
                    <button
                      onClick={requestLocation}
                      className="px-3 py-1.5 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 border border-amber-200 dark:border-amber-500/20 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5"
                    >
                      <MapPinIcon className="w-3 h-3" /> Use GPS
                    </button>
                    <button
                      onClick={useDemoLocation}
                      className="px-3 py-1.5 bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-xl text-[11px] font-bold transition-all"
                    >
                      Demo Location
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2.5 justify-end">
                    <div className="flex items-center gap-1 bg-white dark:bg-[#121214] p-1 rounded-2xl border border-zinc-200/60 dark:border-zinc-800 shadow-sm">
                      {[200, 500, 1000, 2000, 5000].map((r) => (
                        <button
                          key={r}
                          onClick={() => setRadiusMeters(r)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                            radiusMeters === r
                              ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm'
                              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                          }`}
                        >
                          {r >= 1000 ? `${r / 1000}km` : `${r}m`}
                        </button>
                      ))}
                    </div>
                    
                    <button
                      onClick={fetchNearby}
                      className="text-[11px] bg-white dark:bg-[#121214] border border-zinc-200/60 dark:border-zinc-800 shadow-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
                      </svg>
                      Refresh
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Feed List Area */}
            <div className="p-5 sm:p-6 bg-zinc-50/30 dark:bg-[#09090b]">
              {loading ? (
                <div className="space-y-3">
                  <div className="h-28 bg-white dark:bg-[#121214] rounded-2xl border border-zinc-100 dark:border-zinc-800 animate-pulse"></div>
                  <div className="h-28 bg-white dark:bg-[#121214] rounded-2xl border border-zinc-100 dark:border-zinc-800 animate-pulse"></div>
                </div>
              ) : listings.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mx-auto mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-zinc-400">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                  </div>
                  <p className="text-sm font-bold text-zinc-900 dark:text-white">No active energy sellers nearby</p>
                  <p className="text-xs text-zinc-500 max-w-xs mx-auto mt-1.5">
                    No active seller listings match your current search radius ({radiusMeters >= 1000 ? `${radiusMeters / 1000}km` : `${radiusMeters}m`}). Try expanding the radius above.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {listings.map((item) => (
                  <div
                    key={item.listingId}
                    className="bg-white dark:bg-[#121214] border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-5 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5">
                        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                          <MapPinIcon className="w-3.5 h-3.5" />
                          <span>{item.distanceMeters} m away</span>
                        </span>

                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            item.deviceStatus === 'ONLINE'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                              : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${item.deviceStatus === 'ONLINE' ? 'bg-emerald-500' : 'bg-zinc-400'}`}></span>
                          {item.deviceStatus}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                        {item.sourceName} <span className="text-xs text-zinc-400 font-mono font-normal">({item.deviceId})</span>
                      </h3>

                      <p className="text-xs text-zinc-500">
                        Available Energy: <strong className="text-zinc-800 dark:text-zinc-200">{Number(item.availableKwh).toFixed(2)} kWh</strong> (Radius: {item.effectiveRadiusMeters}m)
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800/80 pt-3 sm:pt-0">
                      <div className="text-left sm:text-right">
                        <p className="text-xs text-zinc-400 font-medium">Tariff</p>
                        <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                          ₦{Number(item.pricePerKwh).toLocaleString()}<span className="text-xs text-zinc-400">/kWh</span>
                        </p>
                      </div>

                      <button
                        onClick={() => setSelectedListing(item)}
                        className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold py-2.5 px-5 rounded-2xl text-xs hover:bg-zinc-800 dark:hover:bg-white transition-all shadow-sm active:scale-95"
                      >
                        Buy Energy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            </div>
          </section>
        </>
      )}

      {/* Purchase Confirmation Drawer Modal */}
      {selectedListing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-4">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Confirm Marketplace Purchase</h3>
              <button
                onClick={() => setSelectedListing(null)}
                className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Breakdown Summary */}
            <div className="bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl p-4 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">Seller Source</span>
                <span className="font-bold text-zinc-900 dark:text-white">{selectedListing.sourceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Distance</span>
                <span className="font-bold text-amber-600">{selectedListing.distanceMeters} meters</span>
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
              <p className="text-[11px] text-zinc-400 mt-1">
                Max available: {Number(selectedListing.availableKwh).toFixed(2)} kWh
              </p>
            </div>

            {/* Telemetry Energy Duration Predictor */}
            <EnergyDurationPredictor purchasedKwh={numKwh} compact={true} />

            {/* Total Price Display */}
            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-amber-800 dark:text-amber-400">Total Purchase Amount</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-300 mt-0.5">₦{totalPrice.toLocaleString()}</p>
              </div>
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-200/50 dark:bg-amber-500/20 px-3 py-1 rounded-xl">
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
    </div>
  );
}
