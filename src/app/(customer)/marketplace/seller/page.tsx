"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { marketplaceApi, SellerSource, SellerListing } from '@/lib/api/marketplace';

export default function SellerMarketplacePage() {
  const { user } = useAuth();

  const [sources, setSources] = useState<SellerSource[]>([]);
  const [listings, setListings] = useState<SellerListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // New Source Form
  const [deviceName, setDeviceName] = useState('Home Rooftop Solar');
  const [deviceId, setDeviceId] = useState('DEVICE-001');
  const [sourceLat, setSourceLat] = useState('7.4400');
  const [sourceLon, setSourceLon] = useState('3.9000');
  const [serviceRadius, setServiceRadius] = useState('500');
  const [creatingSource, setCreatingSource] = useState(false);

  // New Listing Form
  const [selectedSourceId, setSelectedSourceId] = useState<string>('');
  const [availableKwh, setAvailableKwh] = useState('10');
  const [pricePerKwh, setPricePerKwh] = useState('250');
  const [creatingListing, setCreatingListing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [sourcesRes, listingsRes] = await Promise.all([
        marketplaceApi.getSellerSources(),
        marketplaceApi.getSellerListings(),
      ]);

      if (sourcesRes.success) {
        setSources(sourcesRes.sources);
        if (sourcesRes.sources.length > 0 && !selectedSourceId) {
          setSelectedSourceId(sourcesRes.sources[0].id.toString());
        }
      }

      if (listingsRes.success) {
        setListings(listingsRes.listings);
      }
    } catch (err: any) {
      console.error('Error fetching seller marketplace data:', err);
      setError(err.message || 'Failed to load seller information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSource = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setCreatingSource(true);

    try {
      const res = await marketplaceApi.createSource({
        deviceId,
        name: deviceName,
        latitude: parseFloat(sourceLat),
        longitude: parseFloat(sourceLon),
        serviceRadiusMeters: parseInt(serviceRadius, 10),
      });

      if (res.success) {
        setSuccess(`Energy Source "${res.source.name}" registered successfully!`);
        fetchData();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to register energy source.');
    } finally {
      setCreatingSource(false);
    }
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSourceId) {
      setError('Please select an energy source first.');
      return;
    }

    setError('');
    setSuccess('');
    setCreatingListing(true);

    try {
      const res = await marketplaceApi.createListing({
        energySourceId: parseInt(selectedSourceId, 10),
        availableKwh: parseFloat(availableKwh),
        pricePerKwh: parseFloat(pricePerKwh),
      });

      if (res.success) {
        setSuccess('Energy listing published to nearby buyers!');
        fetchData();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to publish listing.');
    } finally {
      setCreatingListing(false);
    }
  };

  const handleToggleListing = async (listingId: number, currentStatus: string) => {
    const action = currentStatus === 'ACTIVE' ? 'pause' : 'activate';
    try {
      await marketplaceApi.toggleListingStatus(listingId, action);
      fetchData();
    } catch (err: any) {
      setError(err.message || `Failed to ${action} listing.`);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/marketplace" className="w-9 h-9 rounded-full bg-white dark:bg-[#121214] flex items-center justify-center border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Seller Portal — My Energy</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              Register solar generation sources and list surplus kWh for nearby buyers.
            </p>
          </div>
        </div>

        <Link
          href="/marketplace"
          className="px-4 py-2 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs hover:bg-amber-400 transition-all shadow-sm flex items-center gap-2 self-start sm:self-auto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          Find Energy (Buyer Mode)
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-4 rounded-2xl text-xs font-semibold text-red-800 dark:text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-4 rounded-2xl text-xs font-semibold text-emerald-800 dark:text-emerald-400">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Step 1: Register Energy Source */}
        <section className="bg-white dark:bg-[#121214] border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <span className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xs">1</span>
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">Register Energy Source</h2>
          </div>

          <form onSubmit={handleCreateSource} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">Source Name</label>
              <input
                type="text"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                required
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-white"
                placeholder="e.g. Home Rooftop Solar"
              />
            </div>

            <div>
              <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">PAYGO Meter Device ID</label>
              <input
                type="text"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                required
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 font-mono text-zinc-900 dark:text-white"
                placeholder="DEVICE-001"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">Latitude</label>
                <input
                  type="text"
                  value={sourceLat}
                  onChange={(e) => setSourceLat(e.target.value)}
                  required
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">Longitude</label>
                <input
                  type="text"
                  value={sourceLon}
                  onChange={(e) => setSourceLon(e.target.value)}
                  required
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">Service Radius (Meters)</label>
              <input
                type="number"
                value={serviceRadius}
                onChange={(e) => setServiceRadius(e.target.value)}
                required
                min="50"
                max="5000"
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-white"
                placeholder="500"
              />
              <p className="text-[11px] text-zinc-400 mt-1">Maximum geographical distance buyers can be matched from your system.</p>
            </div>

            <button
              type="submit"
              disabled={creatingSource}
              className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold py-3 px-4 rounded-xl shadow-sm hover:bg-zinc-800 dark:hover:bg-white transition-all disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
            >
              {creatingSource ? 'Registering Source...' : 'Register Energy Source'}
            </button>
          </form>
        </section>

        {/* Step 2: Publish Energy Listing */}
        <section className="bg-white dark:bg-[#121214] border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <span className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xs">2</span>
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">Publish Energy Listing</h2>
          </div>

          {sources.length === 0 ? (
            <div className="text-center py-10 text-zinc-400 text-xs">
              Register an energy source first on the left to publish listings for nearby buyers.
            </div>
          ) : (
            <form onSubmit={handleCreateListing} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">Select Energy Source</label>
                <select
                  value={selectedSourceId}
                  onChange={(e) => setSelectedSourceId(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-white"
                >
                  {sources.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.deviceId} — Radius: {s.serviceRadiusMeters}m)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">Available Energy for Marketplace (kWh)</label>
                <input
                  type="number"
                  step="0.1"
                  value={availableKwh}
                  onChange={(e) => setAvailableKwh(e.target.value)}
                  required
                  min="0.5"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-white font-bold text-base"
                />
                <p className="text-[11px] text-zinc-400 mt-1">Amount of solar energy you want to offer for sale to nearby buyers.</p>
              </div>

              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">Price per kWh (₦)</label>
                <input
                  type="number"
                  value={pricePerKwh}
                  onChange={(e) => setPricePerKwh(e.target.value)}
                  required
                  min="10"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-white font-bold text-base"
                />
              </div>

              <button
                type="submit"
                disabled={creatingListing}
                className="w-full bg-amber-500 text-zinc-950 font-bold py-3 px-4 rounded-xl shadow-sm hover:bg-amber-400 transition-all disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
              >
                {creatingListing ? 'Publishing Listing...' : 'Publish Energy Listing'}
              </button>
            </form>
          )}
        </section>
      </div>

      {/* Active Seller Listings Feed */}
      <section className="bg-white dark:bg-[#121214] border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-zinc-900 dark:text-white">My Published Energy Listings</h2>

        {loading ? (
          <div className="h-20 bg-zinc-100 dark:bg-zinc-900 rounded-2xl animate-pulse"></div>
        ) : listings.length === 0 ? (
          <div className="text-center py-8 text-zinc-400 text-xs">
            No energy listings published yet. Fill out the forms above to start selling solar energy locally.
          </div>
        ) : (
          <div className="space-y-3">
            {listings.map((item) => (
              <div
                key={item.id}
                className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl p-4 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-zinc-900 dark:text-white">
                      Listing #{item.id}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                          : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">
                    Listed: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{Number(item.availableKwh).toFixed(2)} kWh</span> | Reserved: <span className="font-semibold text-amber-600">{Number(item.reservedKwh).toFixed(2)} kWh</span>
                  </p>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      ₦{Number(item.pricePerKwh).toLocaleString()}/kWh
                    </p>
                  </div>

                  <button
                    onClick={() => handleToggleListing(item.id, item.status)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      item.status === 'ACTIVE'
                        ? 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
                        : 'bg-emerald-600 text-white hover:bg-emerald-500 border-transparent'
                    }`}
                  >
                    {item.status === 'ACTIVE' ? 'Pause' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
