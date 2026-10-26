function getBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!envUrl) {
    return typeof window !== 'undefined'
      ? ''
      : (process.env.API_URL || 'https://paygo-backend-6w4q.onrender.com').trim().replace(/\/+$/, '').replace(/\/api$/, '');
  }

  // Remove trailing slashes and trailing /api to prevent duplicate /api segments
  let sanitized = envUrl.trim().replace(/\/+$/, '');
  if (sanitized.endsWith('/api')) {
    sanitized = sanitized.slice(0, -4);
  }
  return sanitized;
}

export class ApiError extends Error {
  public status: number;
  public data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
}

/**
 * Retrieves the stored JWT token.
 * For client-side, this gets it from localStorage.
 * For server-side rendering, you'd need to pass it explicitly or extract from cookies.
 */
function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('paygo_token');
  }
  return null;
}

/**
 * Centralized API client wrapper around fetch.
 */
export async function apiClient<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { requireAuth = true, ...customConfig } = options;

  const headers = new Headers(customConfig.headers || {});
  
  if (!headers.has('Content-Type') && !(customConfig.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (requireAuth) {
    const token = getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const config: RequestInit = {
    ...customConfig,
    headers,
  };

  const baseUrl = getBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  let url: string;
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    url = endpoint;
  } else if (!baseUrl) {
    url = cleanEndpoint;
  } else {
    // Avoid double /api when endpoint already begins with /api
    if (baseUrl.endsWith('/api') && cleanEndpoint.startsWith('/api/')) {
      url = `${baseUrl.slice(0, -4)}${cleanEndpoint}`;
    } else {
      url = `${baseUrl}${cleanEndpoint}`;
    }
  }

  try {
    const response = await fetch(url, config);
    const contentType = response.headers.get('content-type');
    
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      throw new ApiError(
        data?.error || data?.message || 'An API error occurred',
        response.status,
        data
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network or parsing errors
    throw new ApiError(error instanceof Error ? error.message : 'Network error', 0);
  }
}
