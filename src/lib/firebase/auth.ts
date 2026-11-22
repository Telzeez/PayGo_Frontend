const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '';
const AUTH_BASE = 'https://identitytoolkit.googleapis.com/v1';
const TOKEN_URL = 'https://securetoken.googleapis.com/v1/token';

const ID_TOKEN_KEY = 'paygo_firebase_id_token';
const REFRESH_TOKEN_KEY = 'paygo_firebase_refresh_token';
const ROLE_KEY = 'paygo_pending_role';
const PENDING_EMAIL_KEY = 'paygo_pending_email';

export interface FirebaseSession {
  idToken: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  email?: string;
}

export class FirebaseAuthError extends Error {
  code: string;
  constructor(message: string, code = 'AUTH_ERROR') {
    super(message);
    this.name = 'FirebaseAuthError';
    this.code = code;
  }
}

function requireApiKey() {
  if (!API_KEY) {
    throw new FirebaseAuthError(
      'Sign-in is temporarily unavailable. Please try again later.',
      'CONFIGURATION_ERROR'
    );
  }
}

async function requestFirebase<T>(endpoint: string, body: Record<string, unknown>): Promise<T> {
  requireApiKey();

  let response: Response;
  try {
    response = await fetch(`${AUTH_BASE}/${endpoint}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new FirebaseAuthError(
      'We could not connect right now. Check your internet connection and try again.',
      'NETWORK_ERROR'
    );
  }

  let data: any;
  try {
    data = await response.json();
  } catch {
    throw new FirebaseAuthError(
      'Sign-in could not be completed right now. Please try again.',
      'INVALID_RESPONSE'
    );
  }

  if (!response.ok) {
    const code = String(data?.error?.message || 'AUTH_ERROR');
    const messages: Record<string, string> = {
      EMAIL_EXISTS: 'An account with this email already exists. Sign in or use password reset.',
      EMAIL_NOT_FOUND: 'No Firebase account was found for this email. If this is an older PAYGO account, it may need to be linked to Firebase.',
      INVALID_PASSWORD: 'The email or password is incorrect.',
      INVALID_LOGIN_CREDENTIALS: 'The email or password is incorrect.',
      USER_DISABLED: 'This account has been disabled. Contact PAYGO support.',
      WEAK_PASSWORD: 'Choose a stronger password (at least 6 characters).',
      TOO_MANY_ATTEMPTS_TRY_LATER: 'Too many attempts. Please wait and try again.',
      INVALID_OOB_CODE: 'This verification link is invalid, expired, or has already been used.',
      EXPIRED_OOB_CODE: 'This verification link has expired. Request a new one.',
      OPERATION_NOT_ALLOWED: 'This sign-in option is temporarily unavailable. Please try another sign-in method or contact support.',
      API_KEY_INVALID: 'Sign-in is temporarily unavailable. Please try again later.',
      API_KEY_SERVICE_BLOCKED: 'Sign-in is temporarily unavailable. Please try again later.',
      PROJECT_NOT_FOUND: 'Sign-in is temporarily unavailable. Please try again later.',
      INVALID_IDP_RESPONSE: 'Google sign-in could not be completed. Please try again or use email and password.',
      INVALID_RESPONSE: 'Sign-in could not be completed right now. Please try again.',
      CONFIGURATION_ERROR: 'Sign-in is temporarily unavailable. Please try again later.',
    };
    const message = messages[code] || 'Sign-in could not be completed. Please check your details and try again.';
    throw new FirebaseAuthError(message, code);
  }
  return data as T;
}

function saveSession(session: FirebaseSession) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ID_TOKEN_KEY, session.idToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
}

function clearActiveSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ID_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function clearFirebaseSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ID_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(PENDING_EMAIL_KEY);
  localStorage.removeItem('paygo_pending_phone');
  localStorage.removeItem('paygo_token');
}

export function setPendingAccountRole(role: string) {
  if (typeof window !== 'undefined') localStorage.setItem(ROLE_KEY, role === 'OWNER' ? 'OWNER' : 'BUYER');
}

export function getPendingAccountRole() {
  if (typeof window === 'undefined') return 'BUYER';
  return localStorage.getItem(ROLE_KEY) === 'OWNER' ? 'OWNER' : 'BUYER';
}

export function setPendingPhone(phone?: string) {
  if (typeof window === 'undefined') return;
  if (phone?.trim()) localStorage.setItem('paygo_pending_phone', phone.trim());
  else localStorage.removeItem('paygo_pending_phone');
}

export function getPendingPhone() {
  if (typeof window === 'undefined') return undefined;
  return localStorage.getItem('paygo_pending_phone') || undefined;
}

export function setPendingSignup(email: string, phone: string | undefined, role: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PENDING_EMAIL_KEY, email.trim().toLowerCase());
  setPendingPhone(phone);
  setPendingAccountRole(role);
}

export function getPendingSignup(email: string) {
  if (typeof window === 'undefined') return undefined;
  const pendingEmail = localStorage.getItem(PENDING_EMAIL_KEY);
  if (!pendingEmail || pendingEmail !== email.trim().toLowerCase()) return undefined;
  return {
    phone: getPendingPhone(),
    role: getPendingAccountRole(),
  };
}

export function hasPendingSignup() {
  return typeof window !== 'undefined' && Boolean(localStorage.getItem(PENDING_EMAIL_KEY));
}

export function clearPendingSignup() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PENDING_EMAIL_KEY);
  localStorage.removeItem('paygo_pending_phone');
  localStorage.removeItem(ROLE_KEY);
}

export async function createFirebaseAccount(email: string, password: string): Promise<FirebaseSession> {
  const session = await requestFirebase<FirebaseSession>('accounts:signUp', {
    email: email.trim().toLowerCase(),
    password,
    returnSecureToken: true,
  });
  saveSession(session);
  return session;
}

export async function signInFirebase(email: string, password: string): Promise<FirebaseSession> {
  clearActiveSession();
  const session = await requestFirebase<FirebaseSession>('accounts:signInWithPassword', {
    email: email.trim().toLowerCase(),
    password,
    returnSecureToken: true,
  });
  saveSession(session);
  return session;
}

export async function signInFirebaseWithGoogle(googleIdToken: string): Promise<FirebaseSession> {
  clearActiveSession();
  const session = await requestFirebase<FirebaseSession>('accounts:signInWithIdp', {
    postBody: `id_token=${encodeURIComponent(googleIdToken)}&providerId=google.com`,
    requestUri: typeof window !== 'undefined' ? window.location.origin : 'https://pay-go-frontend.vercel.app',
    returnIdpCredential: true,
    returnSecureToken: true,
  });
  saveSession(session);
  return session;
}

export async function getFirebaseAccount(idToken: string): Promise<{ email: string; emailVerified: boolean }> {
  const data = await requestFirebase<{ users?: Array<{ email?: string; emailVerified?: boolean }> }>('accounts:lookup', { idToken });
  const user = data.users?.[0];
  if (!user?.email) throw new FirebaseAuthError('Firebase did not return an email address.', 'MISSING_EMAIL');
  return { email: user.email, emailVerified: user.emailVerified === true };
}

export async function sendFirebaseVerificationEmail(idToken: string) {
  const continueUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/verify-email`
    : 'https://pay-go-frontend.vercel.app/verify-email';
  await requestFirebase('accounts:sendOobCode', {
    requestType: 'VERIFY_EMAIL',
    idToken,
    continueUrl,
    canHandleCodeInApp: false,
  });
}

export async function verifyFirebaseEmailCode(oobCode: string): Promise<FirebaseSession> {
  const session = await requestFirebase<FirebaseSession>('accounts:update', {
    oobCode,
    returnSecureToken: true,
  });
  saveSession(session);
  return session;
}

export async function sendFirebasePasswordReset(email: string) {
  await requestFirebase('accounts:sendOobCode', {
    requestType: 'PASSWORD_RESET',
    email: email.trim().toLowerCase(),
  });
}

export async function updateFirebaseCredentials(updates: { email?: string; password?: string }): Promise<FirebaseSession> {
  const idToken = await getFirebaseIdToken();
  if (!idToken) throw new FirebaseAuthError('Please sign in again before changing your account details.', 'AUTH_REQUIRED');
  const session = await requestFirebase<FirebaseSession>('accounts:update', {
    idToken,
    ...(updates.email ? { email: updates.email.trim().toLowerCase() } : {}),
    ...(updates.password ? { password: updates.password } : {}),
    returnSecureToken: true,
  });
  saveSession(session);
  return session;
}

export async function getFirebaseIdToken(forceRefresh = false): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem(ID_TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!token || !refreshToken) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (!forceRefresh && typeof payload.exp === 'number' && payload.exp * 1000 > Date.now() + 60_000) return token;
  } catch {
    // Refresh a malformed or unreadable token rather than sending it to the API.
  }

  requireApiKey();
  const response = await fetch(`${TOKEN_URL}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken }),
  });
  const data = await response.json();
  if (!response.ok || !data.id_token || !data.refresh_token) {
    clearFirebaseSession();
    return null;
  }
  const refreshed: FirebaseSession = {
    idToken: data.id_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    localId: data.user_id,
  };
  saveSession(refreshed);
  return refreshed.idToken;
}

export async function signOutFirebase() {
  clearFirebaseSession();
}
