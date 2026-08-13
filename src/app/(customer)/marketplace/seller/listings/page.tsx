"use client";

import React, { useEffect, useState } from 'react';
import { marketplaceApi, SellerSource, SellerListing } from '@/lib/api/marketplace';
import { Plus, Power, PowerOff } from 'lucide-react';

export default function SellerListingsPage() {
  const [sources, setSources] = useState<SellerSource[]>([]);
  const [listings, setListings] = useState<SellerListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      setError(err.message || 'Failed to load listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
    <div className="max-w-5xl mx-auto p-4 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Energy Listings</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Manage your available energy offers for nearby buyers.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-4 rounded-2xl text-xs font-semibold text-red-800 dark:text-red-400 mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-4 rounded-2xl text-xs font-semibold text-emerald-800 dark:text-emerald-400 mb-6">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Create Listing Form */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-[#121214] border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-6 shadow-sm sticky top-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">New Listing</h2>
            </div>

            {sources.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 text-sm">
                Register an energy source first in Setup to publish listings.
              </div>
            ) : (
              <form onSubmit={handleCreateListing} className="space-y-4 text-sm">
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1.5">Energy Source</label>
                  <select
                    value={selectedSourceId}
                    onChange={(e) => setSelectedSourceId(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500/50"
                  >
                    {sources.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.deviceId})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1.5">Available kWh</label>
                  <input
                    type="number"
                    step="0.1"
                    value={availableKwh}
                    onChange={(e) => setAvailableKwh(e.target.value)}
                    required
                    min="0.5"
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1.5">Price per kWh (₦)</label>
                  <input
                    type="number"
                    value={pricePerKwh}
                    onChange={(e) => setPricePerKwh(e.target.value)}
                    required
                    min="10"
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={creatingListing}
                  className="w-full bg-amber-500 text-zinc-950 font-bold py-3.5 px-4 rounded-xl shadow-sm hover:bg-amber-400 transition-all disabled:opacity-50 mt-2"
                >
                  {creatingListing ? 'Publishing...' : 'Publish Energy Listing'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Listings List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Active & Past Listings</h2>
          
          {loading ? (
            <div className="animate-pulse flex flex-col gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl"></div>
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-[#121214] rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60">
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">No energy listings yet. Create your first one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {listings.map(listing => (
                <div key={listing.id} className="bg-white dark:bg-[#121214] border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        listing.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400' :
                        listing.status === 'PAUSED' ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400' :
                        listing.status === 'SOLD_OUT' ? 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400' :
                        'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}>
                        {listing.status}
                      </span>
                      <span className="text-xs text-zinc-500 font-medium font-mono">{listing.sourceName}</span>
                    </div>
                    
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-zinc-900 dark:text-white">
                        {listing.availableKwh}
                        <span className="text-sm font-semibold text-zinc-500 ml-1">kWh</span>
                      </span>
                      <span className="text-zinc-400 text-sm mx-2">•</span>
                      <span className="text-lg font-bold text-amber-600 dark:text-amber-500">
                        ₦{listing.pricePerKwh}
                        <span className="text-xs font-semibold text-zinc-500 ml-1">/ kWh</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {listing.status === 'ACTIVE' && (
                      <button 
                        onClick={() => handleToggleListing(listing.id, listing.status)}
                        className="px-4 py-2 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                      >
                        <PowerOff className="w-3.5 h-3.5" />
                        Pause
                      </button>
                    )}
                    {listing.status === 'PAUSED' && (
                      <button 
                        onClick={() => handleToggleListing(listing.id, listing.status)}
                        className="px-4 py-2 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                      >
                        <Power className="w-3.5 h-3.5" />
                        Activate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
