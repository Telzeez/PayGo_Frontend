import { apiClient } from './client';

export interface Appliance {
  id: number;
  name: string;
  category: string;
  ratedPowerW: number;
  powerFactor: number;
  startingSurgeMultiplier: number;
  isEstimate: boolean;
}

export interface ApplianceSelection {
  applianceId: number;
  quantity: number;
  simultaneousQuantity: number;
  ratedPowerOverrideW?: number;
}

export interface CustomerConnection {
  id: number;
  sourceId: number;
  sourceName: string;
  sourceOwnerId: number;
  customerId: number;
  receivingDeviceId: string | null;
  status: 'PENDING' | 'APPROVED' | 'PENDING_REVISION' | 'REJECTED' | 'CANCELLED';
  requestedPowerW: number;
  requestedApparentVa: number;
  requestedStartingSurgeVa: number;
  approvedPowerW: number | null;
  approvedApparentVa: number | null;
  approvedStartingSurgeVa: number | null;
  safetyMarginPct: number;
  decisionNote: string | null;
  sourceCapacityW: number | null;
  sourceCapacityVa: number | null;
  sourceSurgeCapacityVa: number | null;
  appliances: Array<{
    applianceId: number;
    name: string;
    category: string;
    quantity: number;
    simultaneousQuantity: number;
    ratedPowerW: number;
    isEstimate: boolean;
  }>;
  requestedAt: string;
  decidedAt: string | null;
}

export interface LoadAssessment {
  connectedPowerW: number;
  simultaneousPowerW: number;
  steadyApparentVa: number;
  startingSurgeVa: number;
  requestedPowerW: number;
  requestedApparentVa: number;
  requestedStartingSurgeVa: number;
}

export const connectionsApi = {
  getAppliances: () => apiClient<{ success: boolean; appliances: Appliance[] }>(
    '/api/connections/appliances',
    { method: 'GET', requireAuth: true }
  ),

  getMine: () => apiClient<{ success: boolean; connections: CustomerConnection[] }>(
    '/api/connections/me',
    { method: 'GET', requireAuth: true }
  ),

  createRequest: (data: { sourceId: number; appliances: ApplianceSelection[] }) =>
    apiClient<{ success: boolean; connection: Partial<CustomerConnection>; assessment: LoadAssessment }>(
      '/api/connections/requests',
      { method: 'POST', requireAuth: true, body: JSON.stringify(data) }
    ),

  updateAppliances: (connectionId: number, appliances: ApplianceSelection[]) =>
    apiClient<{ success: boolean; status: string; assessment: LoadAssessment; message: string }>(
      `/api/connections/${connectionId}/appliances`,
      { method: 'PUT', requireAuth: true, body: JSON.stringify({ appliances }) }
    ),

  decide: (connectionId: number, decision: 'APPROVE' | 'REJECT', note?: string) =>
    apiClient<{ success: boolean; status: string; message?: string }>(
      `/api/connections/${connectionId}/decision`,
      { method: 'POST', requireAuth: true, body: JSON.stringify({ decision, note }) }
    ),

  setSourceCapacity: (sourceId: number, data: {
    maxCapacityW: number;
    maxCapacityVa: number;
    maxSurgeVa: number;
    safetyMarginPct: number;
  }) =>
    apiClient<{ success: boolean; capacity: {
      maxCapacityW: number;
      maxCapacityVa: number;
      maxSurgeVa: number;
      safetyMarginPct: number;
    } }>(
      `/api/connections/sources/${sourceId}/capacity`,
      { method: 'PUT', requireAuth: true, body: JSON.stringify(data) }
    ),
};
