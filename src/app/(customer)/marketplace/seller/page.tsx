"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { devicesApi } from '@/lib/api/devices';
import { marketplaceApi, SellerSource, SellerListing } from '@/lib/api/marketplace';

type AssignedMeter = { deviceId: string; assignmentStatus: 'UNASSIGNED' | 'ASSIGNED' | 'ACTIVATED' | 'SUSPENDED'; meterPurpose: 'GENERATION' | 'RECEIVING'; status: 'ONLINE' | 'OFFLINE' };

export default function SellerMarketplacePage() {
  const [sources, setSources] = useState<SellerSource[]>([]);
  const [listings, setListings] = useState<SellerListing[]>([]);
  const [meters, setMeters] = useState<AssignedMeter[]>([]);
  const [deviceId, setDeviceId] = useState('');
  const [deviceName, setDeviceName] = useState('Home Rooftop Solar');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const [serviceRadius, setServiceRadius] = useState('500');
  const [availableKwh, setAvailableKwh] = useState('10');
  const [pricePerKwh, setPricePerKwh] = useState('250');
  const [selectedSourceId, setSelectedSourceId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [sourceResult, listingResult] = await Promise.allSettled([
        marketplaceApi.getSellerSources(),
        marketplaceApi.getSellerListings(),
      ]);
      const sourceRes = sourceResult.status === 'fulfilled' ? sourceResult.value : null;
      const listingRes = listingResult.status === 'fulfilled' ? listingResult.value : null;
      if (sourceRes?.success) {
        setSources(sourceRes.sources);
        if (sourceRes.sources.length && !selectedSourceId) setSelectedSourceId(String(sourceRes.sources[0].id));
      }
      if (listingRes?.success) setListings(listingRes.listings);
      if (sourceResult.status === 'rejected' || listingResult.status === 'rejected') {
        setError('Some seller information could not be loaded. You can still use the available sections.');
      }
    } catch (err: any) {
      setError(err.message || 'Unable to load your seller setup.');
    }
    try {
      const meterRes = await devicesApi.getDevices();
      const assigned = (meterRes.devices || []) as AssignedMeter[];
      setMeters(assigned);
      const activated = assigned.find((meter) => meter.assignmentStatus === 'ACTIVATED' && meter.meterPurpose === 'GENERATION');
      if (activated && !deviceId) setDeviceId(activated.deviceId);
    } catch {
      setError('Unable to load your assigned meters. Your existing seller information is still available.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const requestInstallationLocation = () => {
    setError('');
    setLocationConfirmed(false);
    setLatitude(null);
    setLongitude(null);
    if (!navigator.geolocation) {
      setError('This browser does not support location access. Please use a supported device/browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setLocationConfirmed(false);
      },
      (geoError) => { setLatitude(null); setLongitude(null); setLocationConfirmed(false); setError(geoError.code === 1
        ? 'Location permission was denied. Enable it in your browser settings and try again.'
        : 'Unable to detect the installation location. Please try again.'); },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleCreateSource = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!deviceId || !locationConfirmed || latitude === null || longitude === null) {
      setError('Activate your assigned meter and confirm the installation location first.');
      return;
    }
    setSaving(true); setError(''); setSuccess('');
    try {
      const response = await marketplaceApi.createSource({
        deviceId, name: deviceName, latitude, longitude,
        serviceRadiusMeters: parseInt(serviceRadius, 10),
      });
      if (response.success) {
        setSuccess('Energy source registered. You can now publish an offer.');
        await fetchData();
      }
    } catch (err: any) {
      setError(err.message || 'Unable to register this energy source.');
    } finally { setSaving(false); }
  };

  const handleCreateListing = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedSourceId) return setError('Register an energy source first.');
    setSaving(true); setError(''); setSuccess('');
    try {
      const response = await marketplaceApi.createListing({
        energySourceId: Number(selectedSourceId),
        availableKwh: Number(availableKwh),
        pricePerKwh: Number(pricePerKwh),
      });
      if (response.success) {
        setSuccess('Your energy offer has been published.');
        await fetchData();
      }
    } catch (err: any) {
      setError(err.message || 'Unable to publish your offer.');
    } finally { setSaving(false); }
  };

  const handleToggleListing = async (listingId: number, status: string) => {
    try {
      await marketplaceApi.toggleListingStatus(listingId, status === 'ACTIVE' ? 'pause' : 'activate');
      await fetchData();
    } catch (err: any) { setError(err.message || 'Unable to update this offer.'); }
  };

  const activatedMeters = meters.filter((meter) => meter.assignmentStatus === 'ACTIVATED' && meter.meterPurpose === 'GENERATION');

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Sell your surplus energy</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Complete your installation details and publish an offer for nearby buyers.</p>
        </div>
        <Link href="/marketplace" className="rounded-xl bg-amber-500 px-4 py-2.5 text-center text-xs font-bold text-zinc-950">Find energy as a buyer</Link>
      </div>

      {error && <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">{error}</div>}
      {success && <div role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">{success}</div>}

      <section className="rounded-3xl border border-zinc-200/70 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#121214] sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-zinc-900 dark:text-white">1. Your PAYGO meter</h2>
          <Link href="/meters" className="text-xs font-bold text-amber-600 hover:underline">Activate a meter</Link>
        </div>
        {activatedMeters.length ? (
          <div>
            <label htmlFor="seller-meter" className="mb-2 block text-xs font-semibold text-zinc-600 dark:text-zinc-300">Activated meter assigned to your account</label>
            <select id="seller-meter" value={deviceId} onChange={(event) => setDeviceId(event.target.value)} className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-white">
              {activatedMeters.map((meter) => <option key={meter.deviceId} value={meter.deviceId}>{meter.deviceId}</option>)}
            </select>
          </div>
        ) : (
          <div className="rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
            No activated meter is available yet. PAYGO must assign a meter to your account before you can register a solar source.
            <Link href="/meters" className="mt-3 inline-block font-bold text-amber-600">Enter your activation code →</Link>
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-zinc-200/70 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#121214] sm:p-6">
        <h2 className="mb-4 font-bold text-zinc-900 dark:text-white">2. Register your solar installation</h2>
        <form onSubmit={handleCreateSource} className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-semibold text-zinc-600 dark:text-zinc-300">Energy source name</label>
            <input value={deviceName} onChange={(event) => setDeviceName(event.target.value)} required className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" placeholder="e.g. Home rooftop solar" />
          </div>
          <div className="rounded-2xl border border-dashed border-zinc-300 p-4 dark:border-zinc-700">
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Installation location</p>
            <p className="mt-1 text-xs text-zinc-500">Stand at the location of the solar installation before requesting GPS.</p>
            <button type="button" onClick={requestInstallationLocation} className="mt-3 rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">Press to get installation location</button>
            {latitude !== null && longitude !== null && (
              <div className="mt-3 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900">
                <p className="font-mono text-xs text-zinc-700 dark:text-zinc-200">{latitude.toFixed(6)}, {longitude.toFixed(6)}</p>
                <button type="button" onClick={() => setLocationConfirmed(true)} className="mt-2 text-xs font-bold text-emerald-600">Confirm this installation location</button>
                {locationConfirmed && <p className="mt-1 text-xs font-semibold text-emerald-600">Location confirmed</p>}
              </div>
            )}
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold text-zinc-600 dark:text-zinc-300">Service radius (metres)</label>
            <input type="number" min="50" max="5000" required value={serviceRadius} onChange={(event) => setServiceRadius(event.target.value)} className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" />
          </div>
          <button type="submit" disabled={saving || !activatedMeters.length || !locationConfirmed} className="w-full rounded-xl bg-amber-500 px-4 py-3 text-sm font-bold text-zinc-950 disabled:opacity-50">{saving ? 'Saving…' : 'Register energy source'}</button>
        </form>
      </section>

      <section className="rounded-3xl border border-zinc-200/70 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#121214] sm:p-6">
        <h2 className="mb-4 font-bold text-zinc-900 dark:text-white">3. Publish an energy offer</h2>
        {sources.length === 0 ? <p className="text-sm text-zinc-500">Register your energy source first. This step will unlock afterwards.</p> : (
          <form onSubmit={handleCreateListing} className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-semibold text-zinc-600 dark:text-zinc-300">Energy source</label>
              <select value={selectedSourceId} onChange={(event) => setSelectedSourceId(event.target.value)} className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-white">
                {sources.map((source) => <option key={source.id} value={source.id}>{source.name} ({source.deviceId})</option>)}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="mb-2 block text-xs font-semibold text-zinc-600 dark:text-zinc-300">Available energy (kWh)</label><input type="number" min="0.1" step="0.1" required value={availableKwh} onChange={(event) => setAvailableKwh(event.target.value)} className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" /></div>
              <div><label className="mb-2 block text-xs font-semibold text-zinc-600 dark:text-zinc-300">Price per kWh (₦)</label><input type="number" min="1" required value={pricePerKwh} onChange={(event) => setPricePerKwh(event.target.value)} className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" /></div>
            </div>
            <button type="submit" disabled={saving} className="w-full rounded-xl bg-amber-500 px-4 py-3 text-sm font-bold text-zinc-950 disabled:opacity-50">{saving ? 'Publishing…' : 'Publish energy offer'}</button>
          </form>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-bold text-zinc-900 dark:text-white">Your published offers</h2>
        {loading ? <p className="text-sm text-zinc-500">Loading…</p> : listings.length === 0 ? <p className="text-sm text-zinc-500">You haven't published an offer yet.</p> : listings.map((listing) => (
          <div key={listing.id} className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-[#121214]">
            <div><p className="text-sm font-bold text-zinc-900 dark:text-white">Offer #{listing.id}</p><p className="mt-1 text-xs text-zinc-500">{Number(listing.availableKwh).toFixed(1)} kWh · ₦{Number(listing.pricePerKwh).toLocaleString()}/kWh · {listing.status}</p></div>
            <button onClick={() => handleToggleListing(listing.id, listing.status)} className="rounded-xl border border-zinc-200 px-3 py-2 text-xs font-semibold dark:border-zinc-700">{listing.status === 'ACTIVE' ? 'Pause' : 'Activate'}</button>
          </div>
        ))}
      </section>
    </div>
  );
}
