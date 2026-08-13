import { apiClient } from './client';

export interface NearbyListing {
  listingId: number;
  sourceId: number;
  sourceName: string;
  sellerId: number;
  sellerEmail?: string;
  deviceId: string;
  distanceMeters: number;
  effectiveRadiusMeters: number;
  availableKwh: number;
  pricePerKwh: number;
  status: 'ACTIVE' | 'PAUSED' | 'SOLD_OUT';
  deviceStatus: 'ONLINE' | 'OFFLINE';
  lastSeenAt?: string;
  sourceLatitude: number;
  sourceLongitude: number;
}

export interface SellerSource {
  id: number;
  ownerId: number;
  deviceId: string;
  name: string;
  latitude: number;
  longitude: number;
  serviceRadiusMeters: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface SellerListing {
  id: number;
  energySourceId: number;
  sellerId: number;
  availableKwh: number;
  reservedKwh: number;
  pricePerKwh: number;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'SOLD_OUT' | 'EXPIRED';
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  sourceName: string
}

export interface MarketplacePurchaseResult {
  id: number;
  purchaseReference: string;
  listingId: number;
  buyerId: number;
  sellerId: number;
  deviceId: string;
  distanceMeters: number;
  pricePerKwh: number;
  kwhRequested: number;
  amount: number;
  status: string;
  createdAt: string;
}

export const marketplaceApi = {
  // Discovery
  getNearbyListings: async (latitude: number, longitude: number, radiusMeters?: number) => {
    let url = `/api/marketplace/nearby?latitude=${latitude}&longitude=${longitude}`;
    if (radiusMeters) {
      url += `&radiusMeters=${radiusMeters}`;
    }
    return apiClient<{ success: boolean; count: number; listings: NearbyListing[] }>(url, {
      method: 'GET',
      requireAuth: false,
    });
  },

  // Seller Source CRUD
  createSource: async (data: {
    deviceId: string;
    name: string;
    latitude: number;
    longitude: number;
    serviceRadiusMeters?: number;
  }) => {
    return apiClient<{ success: boolean; message: string; source: SellerSource }>('/api/marketplace/sources', {
      method: 'POST',
      body: JSON.stringify(data),
      requireAuth: true,
    });
  },

  getSellerSources: async () => {
    return apiClient<{ success: boolean; sources: SellerSource[] }>('/api/marketplace/sources/me', {
      method: 'GET',
      requireAuth: true,
    });
  },

  // Seller Listing CRUD
  createListing: async (data: {
    energySourceId: number;
    availableKwh: number;
    pricePerKwh: number;
    expiresInHours?: number;
  }) => {
    return apiClient<{ success: boolean; message: string; listing: SellerListing }>('/api/marketplace/listings', {
      method: 'POST',
      body: JSON.stringify(data),
      requireAuth: true,
    });
  },

  getSellerListings: async () => {
    return apiClient<{ success: boolean; listings: SellerListing[] }>('/api/marketplace/my-listings', {
      method: 'GET',
      requireAuth: true,
    });
  },

  toggleListingStatus: async (listingId: number, action: 'pause' | 'activate') => {
    return apiClient<{ success: boolean; message: string; listing: SellerListing }>(
      `/api/marketplace/listings/${listingId}/${action}`,
      {
        method: 'POST',
        requireAuth: true,
      }
    );
  },

  // Purchase Intent
  createPurchaseIntent: async (
    listingId: number,
    data: {
      kwhRequested: number;
      buyerLatitude: number;
      buyerLongitude: number;
    }
  ) => {
    return apiClient<{
      success: boolean;
      message: string;
      purchase: MarketplacePurchaseResult;
    }>(`/api/marketplace/listings/${listingId}/purchase`, {
      method: 'POST',
      body: JSON.stringify(data),
      requireAuth: true,
    });
  },

  // Buyer Purchases
  getPurchases: async () => {
    return apiClient<{ success: boolean; purchases: any[] }>('/api/marketplace/purchases', {
      method: 'GET',
      requireAuth: true,
    });
  },

  getPurchaseDetail: async (purchaseId: number) => {
    return apiClient<{ success: boolean; purchase: any }>(`/api/marketplace/purchases/${purchaseId}`, {
      method: 'GET',
      requireAuth: true,
    });
  }
};
