"use client";

import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { connectionsApi, Appliance, ApplianceSelection, CustomerConnection } from '@/lib/api/connections';
import { marketplaceApi, SellerSource } from '@/lib/api/marketplace';

type ApplianceDraft = {
  selected: boolean;
  quantity: number;
  simultaneousQuantity: number;
  ratedPowerOverrideW: string;
};

type CapacityDraft = {
  maxCapacityW: string;
  maxCapacityVa: string;
  maxSurgeVa: string;
  safetyMarginPct: string;
};

export default function ConnectionsPage() {
  const { user } = useAuth();
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [connections, setConnections] = useState<CustomerConnection[]>([]);
  const [sources, setSources] = useState<SellerSource[]>([]);
  const [buyerLatitude, setBuyerLatitude] = useState<number | undefined>();
  const [buyerLongitude, setBuyerLongitude] = useState<number | undefined>();
  const [sourceId, setSourceId] = useState('');
  const [sourceName, setSourceName] = useState('');
  const [editingConnectionId, setEditingConnectionId] = useState<number | null>(null);
  const [drafts, setDrafts] = useState<Record<number, ApplianceDraft>>({});
  const [capacityDrafts, setCapacityDrafts] = useState<Record<number, CapacityDraft>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const refresh = async () => {
    setLoading(true);
    setError('');
    try {
      const [catalogueRes, connectionRes, sourceRes] = await Promise.all([
        connectionsApi.getAppliances(),
        connectionsApi.getMine(),
        marketplaceApi.getSellerSources(),
      ]);
      setAppliances(catalogueRes.appliances || []);
      setConnections(connectionRes.connections || []);
      setSources(sourceRes.sources || []);
      setCapacityDrafts((current) => {
        const next = { ...current };
        for (const source of sourceRes.sources || []) {
          if (!next[source.id]) {
            next[source.id] = {
              maxCapacityW: source.maxCapacityW ? String(source.maxCapacityW) : '',
              maxCapacityVa: source.maxCapacityVa ? String(source.maxCapacityVa) : '',
              maxSurgeVa: source.maxSurgeVa ? String(source.maxSurgeVa) : '',
              safetyMarginPct: source.safetyMarginPct !== null && source.safetyMarginPct !== undefined
                ? String(source.safetyMarginPct)
                : '',
            };
          }
        }
        return next;
      });
    } catch (err: any) {
      setError(err.message || 'Unable to load connection information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedSourceId = params.get('sourceId');
    if (requestedSourceId) setSourceId(requestedSourceId);
    const requestedSourceName = params.get('sourceName');
    if (requestedSourceName) setSourceName(requestedSourceName);
    const requestedLatitude = params.get('buyerLatitude');
    const requestedLongitude = params.get('buyerLongitude');
    if (requestedLatitude && requestedLongitude) {
      setBuyerLatitude(Number(requestedLatitude));
      setBuyerLongitude(Number(requestedLongitude));
    }
    refresh();
  }, [user?.id]);

  const selectedAppliances = useMemo(() => appliances.filter((item) => drafts[item.id]?.selected), [appliances, drafts]);

  const updateDraft = (id: number, patch: Partial<ApplianceDraft>) => {
    setDrafts((current) => {
      const old = current[id] || { selected: false, quantity: 1, simultaneousQuantity: 1, ratedPowerOverrideW: '' };
      const next = { ...old, ...patch };
      if (next.simultaneousQuantity > next.quantity) next.simultaneousQuantity = next.quantity;
      if (next.quantity < 1) next.quantity = 1;
      if (next.simultaneousQuantity < 1) next.simultaneousQuantity = 1;
      return { ...current, [id]: next };
    });
  };

  const buildSelections = (): ApplianceSelection[] => selectedAppliances.map((item) => {
    const draft = drafts[item.id];
    const selection: ApplianceSelection = {
      applianceId: item.id,
      quantity: draft.quantity,
      simultaneousQuantity: draft.simultaneousQuantity,
    };
    if (draft.ratedPowerOverrideW.trim()) selection.ratedPowerOverrideW = Number(draft.ratedPowerOverrideW);
    return selection;
  });

  const submitRequest = async (event: FormEvent) => {
    event.preventDefault();
    if (!sourceId || !Number.isInteger(Number(sourceId)) || selectedAppliances.length === 0) {
      setError('Choose a seller listing and at least one appliance.');
      return;
    }
    setSaving(true); setError(''); setNotice('');
    try {
      const selections = buildSelections();
      if (editingConnectionId !== null) {
        const result = await connectionsApi.updateAppliances(editingConnectionId, selections);
        setNotice(result.message);
        setEditingConnectionId(null);
      } else {
        const result = await connectionsApi.createRequest({
          sourceId: Number(sourceId),
          appliances: selections,
          ...(buyerLatitude !== undefined && buyerLongitude !== undefined ? { buyerLatitude, buyerLongitude } : {}),
        });
        setNotice(
          `Connection request submitted. Estimated allocation: ${Number(result.assessment.requestedPowerW).toFixed(0)} W, ${Number(result.assessment.requestedApparentVa).toFixed(0)} VA, starting surge ${Number(result.assessment.requestedStartingSurgeVa).toFixed(0)} VA.`
        );
      }
      await refresh();
    } catch (err: any) {
      setError(err.message || 'Unable to submit connection request.');
    } finally {
      setSaving(false);
    }
  };

  const saveCapacity = async (source: SellerSource) => {
    const draft = capacityDrafts[source.id];
    if (!draft) return;
    setSaving(true); setError(''); setNotice('');
    try {
      await connectionsApi.setSourceCapacity(source.id, {
        maxCapacityW: Number(draft.maxCapacityW),
        maxCapacityVa: Number(draft.maxCapacityVa),
        maxSurgeVa: Number(draft.maxSurgeVa),
        safetyMarginPct: Number(draft.safetyMarginPct),
      });
      setNotice(`Electrical capacity saved for ${source.name}.`);
      await refresh();
    } catch (err: any) {
      setError(err.message || 'Unable to save source capacity.');
    } finally {
      setSaving(false);
    }
  };

  const decide = async (connection: CustomerConnection, decision: 'APPROVE' | 'REJECT') => {
    setSaving(true); setError(''); setNotice('');
    try {
      const result = await connectionsApi.decide(connection.id, decision);
      setNotice(result.message || (decision === 'APPROVE' ? 'Connection approved.' : 'Connection rejected.'));
      await refresh();
    } catch (err: any) {
      setError(err.message || 'Unable to process this connection request.');
    } finally {
      setSaving(false);
    }
  };

  const customerRequests = connections.filter((connection) => connection.customerId === user?.id);
  const sellerRequests = connections.filter((connection) => connection.sourceOwnerId === user?.id);

  const confirmInstallation = async (connection: CustomerConnection) => {
    setSaving(true); setError(''); setNotice('');
    try {
      const result = await connectionsApi.confirmInstallation(connection.id);
      setNotice(result.message || 'Cable installation confirmed.');
      await refresh();
    } catch (err: any) {
      setError(err.message || 'Unable to confirm cable installation.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Energy connections</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Declare your appliances, get your load approved, and manage customer connections.</p>
        </div>
        <Link href="/marketplace" className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-bold dark:border-zinc-700">Back to marketplace</Link>
      </header>

      {error && <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">{error}</div>}
      {notice && <div role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">{notice}</div>}

      <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#121214] sm:p-6">
        <h2 className="font-bold text-zinc-900 dark:text-white">Request a connection</h2>
        <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
          Choose the appliances you intend to use. PAYGO estimates simultaneous demand, apparent power and starting surge using catalogue ratings. If your appliance label shows a different wattage, enter that value.
        </p>
        <form onSubmit={submitRequest} className="mt-5 space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-zinc-600 dark:text-zinc-300">Seller source ID</label>
              <input value={sourceId} onChange={(event) => setSourceId(event.target.value)} inputMode="numeric" required placeholder="Choose Request connection from a listing" className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" />
              {sourceName && <p className="mt-1 text-xs text-zinc-500">Selected listing: {sourceName}</p>}
            </div>
            <div className="flex items-end">
              <p className="text-xs text-zinc-500">The owner's existing PAYGO meter stays at the energy source. Once the owner approves your load, agrees the cable route and confirms installation, that same meter becomes visible on your dashboard.</p>
            </div>
          </div>

          {loading ? <p className="text-sm text-zinc-500">Loading appliance catalogue…</p> : (
            <div className="space-y-3">
              {appliances.map((appliance) => {
                const draft = drafts[appliance.id] || { selected: false, quantity: 1, simultaneousQuantity: 1, ratedPowerOverrideW: '' };
                return (
                  <div key={appliance.id} className="rounded-2xl border border-zinc-200 p-3 dark:border-zinc-800">
                    <div className="flex items-start gap-3">
                      <input type="checkbox" checked={draft.selected} onChange={(event) => updateDraft(appliance.id, { selected: event.target.checked })} className="mt-1 h-4 w-4 accent-amber-500" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-zinc-900 dark:text-white">{appliance.name}</span>
                          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-500 dark:bg-zinc-800">{appliance.category}</span>
                          {appliance.isEstimate && <span className="text-[10px] text-amber-600">Typical estimate</span>}
                        </div>
                        <p className="mt-0.5 text-xs text-zinc-500">{appliance.ratedPowerW} W catalogue rating · PF {appliance.powerFactor} · surge ×{appliance.startingSurgeMultiplier}</p>
                      </div>
                    </div>
                    {draft.selected && (
                      <div className="mt-3 grid grid-cols-2 gap-3 pl-7 sm:grid-cols-3">
                        <label className="text-[11px] text-zinc-500">Quantity
                          <input type="number" min="1" max="100" value={draft.quantity} onChange={(event) => updateDraft(appliance.id, { quantity: Number(event.target.value) })} className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" />
                        </label>
                        <label className="text-[11px] text-zinc-500">Used at once
                          <input type="number" min="1" max={draft.quantity} value={draft.simultaneousQuantity} onChange={(event) => updateDraft(appliance.id, { simultaneousQuantity: Number(event.target.value) })} className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" />
                        </label>
                        <label className="col-span-2 text-[11px] text-zinc-500 sm:col-span-1">Actual rating (W), optional
                          <input type="number" min="1" max="50000" step="0.1" value={draft.ratedPowerOverrideW} onChange={(event) => updateDraft(appliance.id, { ratedPowerOverrideW: event.target.value })} placeholder={String(appliance.ratedPowerW)} className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" />
                        </label>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <div className="flex flex-col gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-zinc-500">{selectedAppliances.length} appliance type(s) selected. Final allocation is calculated by the backend.</p>
            <div className="flex flex-wrap gap-2">
              {editingConnectionId !== null && <button type="button" onClick={() => { setEditingConnectionId(null); setDrafts({}); setSourceId(''); setSourceName(''); }} className="rounded-xl border border-zinc-200 px-4 py-3 text-xs font-bold dark:border-zinc-700">Cancel edit</button>}
              <button type="submit" disabled={saving || loading || selectedAppliances.length === 0 || !sourceId} className="rounded-xl bg-amber-500 px-5 py-3 text-xs font-bold text-zinc-950 disabled:opacity-50">
                {saving ? 'Saving…' : editingConnectionId !== null ? 'Save appliance changes' : 'Submit connection request'}
              </button>
            </div>
          </div>
        </form>
      </section>

      {sources.length > 0 && (
        <section className="space-y-3">
          <div>
            <h2 className="font-bold text-zinc-900 dark:text-white">Your source capacity</h2>
            <p className="mt-1 text-xs text-zinc-500">Set the verified continuous W, apparent VA and surge VA limits for each source. Do not use the inverter's nominal rating as a surge rating unless its datasheet confirms it.</p>
          </div>
          {sources.map((source) => {
            const draft = capacityDrafts[source.id] || { maxCapacityW: '', maxCapacityVa: '', maxSurgeVa: '', safetyMarginPct: '' };
            const sourceConnections = connections.filter((connection) => connection.sourceId === source.id && connection.approvedPowerW !== null);
            const allocatedW = sourceConnections.reduce((sum, connection) => sum + Number(connection.approvedPowerW || 0), 0);
            const allocatedVa = sourceConnections.reduce((sum, connection) => sum + Number(connection.approvedApparentVa || 0), 0);
            const allocatedSurgeVa = sourceConnections.reduce((sum, connection) => sum + Number(connection.approvedStartingSurgeVa || 0), 0);
            return (
              <div key={source.id} className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-[#121214]">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">{source.name}</h3>
                <p className="mt-1 text-xs text-zinc-500">Source #{source.id} · Generation meter {source.deviceId}</p>
                <div className="mt-3 grid grid-cols-2 gap-3 rounded-xl bg-zinc-50 p-3 text-xs dark:bg-zinc-900 sm:grid-cols-3">
                  <div><p className="text-zinc-500">Allocated W</p><p className="mt-1 font-bold text-zinc-900 dark:text-white">{allocatedW.toFixed(0)} / {source.maxCapacityW ? Number(source.maxCapacityW).toFixed(0) : '—'} W</p><p className="mt-1 text-[10px] text-emerald-600">Available: {source.maxCapacityW ? Math.max(0, Number(source.maxCapacityW) - allocatedW).toFixed(0) + ' W' : '—'}</p></div>
                  <div><p className="text-zinc-500">Allocated VA</p><p className="mt-1 font-bold text-zinc-900 dark:text-white">{allocatedVa.toFixed(0)} / {source.maxCapacityVa ? Number(source.maxCapacityVa).toFixed(0) : '—'} VA</p><p className="mt-1 text-[10px] text-emerald-600">Available: {source.maxCapacityVa ? Math.max(0, Number(source.maxCapacityVa) - allocatedVa).toFixed(0) + ' VA' : '—'}</p></div>
                  <div><p className="text-zinc-500">Allocated surge</p><p className="mt-1 font-bold text-zinc-900 dark:text-white">{allocatedSurgeVa.toFixed(0)} / {source.maxSurgeVa ? Number(source.maxSurgeVa).toFixed(0) : '—'} VA</p><p className="mt-1 text-[10px] text-emerald-600">Available: {source.maxSurgeVa ? Math.max(0, Number(source.maxSurgeVa) - allocatedSurgeVa).toFixed(0) + ' VA' : '—'}</p></div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {([
                    ['maxCapacityW', 'Continuous capacity (W)'],
                    ['maxCapacityVa', 'Apparent capacity (VA)'],
                    ['maxSurgeVa', 'Surge capacity (VA)'],
                    ['safetyMarginPct', 'Safety margin (%)'],
                  ] as const).map(([key, label]) => (
                    <label key={key} className="text-[11px] text-zinc-500">{label}
                      <input type="number" min={key === 'safetyMarginPct' ? 0 : 1} max={key === 'safetyMarginPct' ? 100 : undefined} step="0.1" required value={draft[key]} onChange={(event) => setCapacityDrafts((current) => ({ ...current, [source.id]: { ...draft, [key]: event.target.value } }))} className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" />
                    </label>
                  ))}
                </div>
                <button onClick={() => saveCapacity(source)} disabled={saving} className="mt-3 rounded-xl border border-zinc-200 px-4 py-2 text-xs font-bold dark:border-zinc-700 disabled:opacity-50">Save source capacity</button>
              </div>
            );
          })}
        </section>
      )}

      <section className="space-y-3">
        <div>
          <h2 className="font-bold text-zinc-900 dark:text-white">Connection requests and approvals</h2>
          <p className="mt-1 text-xs text-zinc-500">The owner approves the initial connection, completes the cable installation, then confirms it here. Energy purchases do not require further owner approval.</p>
        </div>
        {loading ? <p className="text-sm text-zinc-500">Loading connections…</p> : connections.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700">No connection requests yet.</div>
        ) : connections.map((connection) => {
          const isSourceOwner = connection.sourceOwnerId === user?.id;
          const isAwaitingDecision = connection.status === 'PENDING' || connection.status === 'PENDING_REVISION';
          return (
            <article key={connection.id} className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-[#121214]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">{connection.sourceName}</h3>
                  <p className="mt-1 text-xs text-zinc-500">Connection #{connection.id} · {isSourceOwner ? (connection.customerEmail || `Customer #${connection.customerId}`) : 'Your request'}</p>
                  {isSourceOwner && connection.buyerLatitude !== null && connection.buyerLatitude !== undefined &&
                    connection.buyerLongitude !== null && connection.buyerLongitude !== undefined && (
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-zinc-500">Buyer location · approx. {connection.buyerDistanceMeters ?? '—'} m away</span>
                      <a
                        href={`https://www.google.com/maps?q=${connection.buyerLatitude},${connection.buyerLongitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-amber-600 hover:underline"
                      >
                        View approximate map location
                      </a>
                    </div>
                  )}
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                  connection.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                  connection.status === 'REJECTED' ? 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400' :
                  'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                }`}>{connection.status.replace('_', ' ')}</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
                <div><p className="text-zinc-500">Requested</p><p className="mt-1 font-bold text-zinc-900 dark:text-white">{Number(connection.requestedPowerW).toFixed(0)} W</p></div>
                <div><p className="text-zinc-500">Apparent</p><p className="mt-1 font-bold text-zinc-900 dark:text-white">{Number(connection.requestedApparentVa).toFixed(0)} VA</p></div>
                <div><p className="text-zinc-500">Starting surge</p><p className="mt-1 font-bold text-zinc-900 dark:text-white">{Number(connection.requestedStartingSurgeVa).toFixed(0)} VA</p></div>
              </div>
              {connection.status === 'PENDING_REVISION' && connection.approvedPowerW !== null && (
                <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
                  Previous approved limit remains active: {Number(connection.approvedPowerW).toFixed(0)} W. The increased load is not active until approved.
                </p>
              )}
              {connection.appliances.length > 0 && (
                <ul className="mt-3 space-y-1 text-xs text-zinc-500">
                  {connection.appliances.map((item) => <li key={item.applianceId}>{item.quantity} × {item.name} ({item.simultaneousQuantity} simultaneous, {item.ratedPowerW} W each)</li>)}
                </ul>
              )}
              {connection.customerId === user?.id && ['PENDING', 'APPROVED', 'PENDING_REVISION'].includes(connection.status) && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingConnectionId(connection.id);
                    setSourceId(String(connection.sourceId));
                    setSourceName(connection.sourceName);
                    const next: Record<number, ApplianceDraft> = {};
                    for (const item of connection.appliances || []) {
                      next[item.applianceId] = {
                        selected: true,
                        quantity: item.quantity,
                        simultaneousQuantity: item.simultaneousQuantity,
                        ratedPowerOverrideW: String(item.ratedPowerW),
                      };
                    }
                    setDrafts(next);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="mt-3 rounded-xl border border-zinc-200 px-3 py-2 text-xs font-bold dark:border-zinc-700"
                >
                  Edit appliance list
                </button>
              )}
              {['APPROVED', 'PENDING_REVISION'].includes(connection.status) && (
                <div className="mt-3 rounded-xl bg-zinc-50 p-3 text-xs text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
                  Approved load limit: {Number(connection.approvedPowerW || 0).toFixed(0)} W.
                  {connection.installationConfirmedAt ? (
                    <p className="mt-1 font-semibold text-emerald-600 dark:text-emerald-400">
                      Cable installation confirmed. The buyer can now view the shared meter and purchase energy independently.
                    </p>
                  ) : (
                    <p className="mt-1">
                      {isSourceOwner
                        ? 'After the cable has been installed and tested, confirm it below to activate the buyer dashboard.'
                        : 'The owner has approved your connection. Your dashboard and energy purchases will become available after cable installation is confirmed.'}
                    </p>
                  )}
                </div>
              )}
              {isSourceOwner && ['APPROVED', 'PENDING_REVISION'].includes(connection.status) && !connection.installationConfirmedAt && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => confirmInstallation(connection)}
                  className="mt-3 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Confirm cable installation'}
                </button>
              )}
              {isSourceOwner && isAwaitingDecision && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button disabled={saving} onClick={() => decide(connection, 'APPROVE')} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">Approve load</button>
                  <button disabled={saving} onClick={() => decide(connection, 'REJECT')} className="rounded-xl border border-red-200 px-4 py-2.5 text-xs font-bold text-red-600 dark:border-red-500/30 disabled:opacity-50">Reject {connection.status === 'PENDING_REVISION' ? 'increase' : 'request'}</button>
                </div>
              )}
            </article>
          );
        })}
      </section>
    </main>
  );
}
