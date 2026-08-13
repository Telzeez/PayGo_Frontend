// ==========================================
// Domain & API Types for PayGo Frontend
// ==========================================

export type HardwareStatus = "PENDING" | "CONFIRMED" | "FAILED";
export type DeviceStatus = "ONLINE" | "OFFLINE";

export interface Transaction {
  id: number;
  type: "topup" | "consumption";
  amount: number;
  kwhAmount: number;
  transactionId: string | null;
  reference: string | null;
  hardwareStatus: HardwareStatus;
  timestamp: string;
}

export interface DeviceResponse {
  success: boolean;
  deviceId: string;
  balance: number;
  status: DeviceStatus;
  lastSeenAt: string | null;
  lastUpdated: string;
  transactions: Transaction[];
}

export interface UserProfile {
  id: number;
  email: string;
  phone: string | null;
  role: string;
  isBuyer: boolean;
  isSeller: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: UserProfile;
}

export interface PaymentInitiateRequest {
  amount: number;
  email: string;
  deviceId: string;
}

export interface PaymentInitiateResponse {
  success: boolean;
  paymentUrl?: string;
  reference?: string;
  error?: string;
  message?: string;
  data?: {
    authorization_url: string;
    reference: string;
}}

export interface VerifyTransactionResponse {
  status: "pending" | "success" | "failed";
  message?: string;
  data?: {
    kwhAmount: number;
    expiresAt: string;
    used: boolean;
  };
  error?: string;
}
