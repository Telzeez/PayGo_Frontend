import { apiClient } from './client';
import { PaymentInitiateRequest, PaymentInitiateResponse, VerifyTransactionResponse } from '../types';

export const paymentApi = {
  initiate: async (data: PaymentInitiateRequest) => {
    return apiClient<PaymentInitiateResponse>('/api/payment/initiate', {
      method: 'POST',
      body: JSON.stringify(data),
      requireAuth: true,
    });
  },

  verify: async (reference: string) => {
    return apiClient<{ success: boolean; transaction: any }>(`/api/transactions/verify/${encodeURIComponent(reference)}`, {
      method: 'GET',
      requireAuth: true,
    });
  }
};
