"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { devicesApi } from '@/lib/api/devices';
import { DeviceResponse } from '@/lib/types';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, logout, updateProfile } = useAuth();
  const [device, setDevice] = useState<DeviceResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  const DEVICE_ID = 'DEVICE-001';

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const res = await devicesApi.getDevice(DEVICE_ID);
        if (res.success) {
          setDevice(res);
        }
      } catch (err) {
        console.error('Error fetching profile device data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const openEditModal = () => {
    setEditEmail(user?.email || '');
    setEditPhone(user?.phone || '');
    setNewPassword('');
    setEditError('');
    setEditSuccess('');
    setIsEditing(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');
    setEditSuccess('');
    setIsSubmitting(true);

    try {
      await updateProfile({
        email: editEmail,
        phone: editPhone,
        newPassword: newPassword || undefined,
      });

      setEditSuccess('Profile updated successfully!');
      setTimeout(() => {
        setIsEditing(false);
        setEditSuccess('');
      }, 1200);

    } catch (err: any) {
      setEditError(err.message || 'Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="w-9 h-9 rounded-full bg-white dark:bg-[#121214] flex items-center justify-center border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Account & Meter Profile</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              Manage your SolarPayMe profile and device connectivity.
            </p>
          </div>
        </div>
        <button
          onClick={openEditModal}
          className="px-4 py-2 text-xs font-bold rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white transition-all shadow-sm active:scale-95 flex items-center gap-1.5 shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          Edit Profile
        </button>
      </div>

      {/* User Info Card */}
      <section className="bg-white dark:bg-[#121214] border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xl shrink-0">
            {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">{user?.email || 'Customer Account'}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                {user?.role || 'CUSTOMER'}
              </span>
              <span className="text-xs text-zinc-400">ID: #{user?.id || 1}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <p className="text-zinc-500">Contact Email</p>
            <p className="font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">{user?.email || 'N/A'}</p>
          </div>
          <div>
            <p className="text-zinc-500">Phone Number</p>
            <p className="font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">{user?.phone || 'Not configured'}</p>
          </div>
        </div>
      </section>

      {/* Assigned Device Card */}
      <section className="bg-white dark:bg-[#121214] border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">Assigned Meter Details</h2>
          {device && (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
              device.status === 'ONLINE'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${device.status === 'ONLINE' ? 'bg-emerald-500' : 'bg-zinc-400'}`}></span>
              Meter {device.status}
            </span>
          )}
        </div>

        {loading ? (
          <div className="h-16 bg-zinc-100 dark:bg-zinc-900 rounded-2xl animate-pulse"></div>
        ) : (
          <div className="bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500">Device ID</p>
              <p className="text-lg font-bold text-zinc-900 dark:text-white font-mono mt-0.5">{DEVICE_ID}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-500">Current Balance</p>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {device ? Number(device.balance).toFixed(2) : '0.00'} kWh
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Link
            href="/recharge"
            className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold py-3 px-4 rounded-2xl text-xs text-center hover:bg-zinc-800 dark:hover:bg-white transition-all shadow-sm active:scale-95"
          >
            Recharge Meter
          </Link>
          <Link
            href="/transactions"
            className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold py-3 px-4 rounded-2xl text-xs text-center hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-all shadow-sm active:scale-95"
          >
            View History
          </Link>
        </div>
      </section>

      {/* Logout Card */}
      <button
        onClick={logout}
        className="w-full bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 font-bold py-4 px-4 rounded-2xl text-sm hover:bg-red-100 dark:hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 mb-12 shadow-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
        Sign Out of Account
      </button>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative space-y-5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-4">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Edit Profile Details</h3>
              <button
                onClick={() => setIsEditing(false)}
                className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {editError && (
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-3 rounded-2xl text-xs font-semibold text-red-800 dark:text-red-400">
                {editError}
              </div>
            )}

            {editSuccess && (
              <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-3 rounded-2xl text-xs font-semibold text-emerald-800 dark:text-emerald-400">
                {editSuccess}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  required
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-3 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                />
              </div>

              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">
                  Phone Number (SMS Token Delivery)
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+234..."
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-3 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                />
              </div>

              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">
                  New Password (Optional)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters (Leave blank to keep current)"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-3 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold py-3.5 px-4 rounded-xl text-xs hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold py-3.5 px-4 rounded-xl text-xs hover:bg-zinc-800 dark:hover:bg-white transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
