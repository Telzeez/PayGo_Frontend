"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { marketplaceApi } from '@/lib/api/marketplace';

export default function SellerSetupPage() {
  const router = useRouter();
  
  const [deviceName, setDeviceName] = useState('Home Rooftop Solar');
  const [deviceId, setDeviceId] = useState('DEVICE-001');
  const [sourceLat, setSourceLat] = useState('7.4400');
  const [sourceLon, setSourceLon] = useState('3.9000');
  const [serviceRadius, setServiceRadius] = useState('500');
  
  const [creatingSource, setCreatingSource] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
        // Redirect to listings management after successful setup
        setTimeout(() => {
          router.push('/marketplace/seller/listings');
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to register energy source.');
    } finally {
      setCreatingSource(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Seller Setup</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Register your solar generation source to start selling energy to nearby buyers.
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

      <form onSubmit={handleCreateSource} className="bg-white dark:bg-[#121214] border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-6 shadow-sm space-y-5 text-sm">
        <div>
          <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1.5">Source Name</label>
          <input
            type="text"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            required
            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all outline-none"
            placeholder="e.g. Home Rooftop Solar"
          />
        </div>

        <div>
          <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1.5">PAYGO Meter Device ID</label>
          <input
            type="text"
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
            required
            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 font-mono text-zinc-900 dark:text-white focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all outline-none"
            placeholder="DEVICE-001"
          />
          <p className="text-xs text-zinc-500 mt-2">The unique ID of the physical meter you are using to supply energy.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1.5">Latitude</label>
            <input
              type="text"
              value={sourceLat}
              onChange={(e) => setSourceLat(e.target.value)}
              required
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all outline-none"
            />
          </div>
          <div>
            <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1.5">Longitude</label>
            <input
              type="text"
              value={sourceLon}
              onChange={(e) => setSourceLon(e.target.value)}
              required
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1.5">Service Radius (Meters)</label>
          <input
            type="number"
            value={serviceRadius}
            onChange={(e) => setServiceRadius(e.target.value)}
            required
            min="50"
            max="5000"
            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all outline-none"
            placeholder="500"
          />
          <p className="text-xs text-zinc-500 mt-2">Maximum geographical distance buyers can be matched from your system.</p>
        </div>

        <button
          type="submit"
          disabled={creatingSource}
          className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold py-3.5 px-4 rounded-xl shadow-sm hover:bg-zinc-800 dark:hover:bg-white transition-all disabled:opacity-50 mt-4"
        >
          {creatingSource ? 'Registering Source...' : 'Register Energy Source'}
        </button>
      </form>
    </div>
  );
}
