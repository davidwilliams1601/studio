import { auth } from '@/firebase/config';
import { handleApiResponse } from './error-handler';

interface ApiOptions extends RequestInit {
  requiresCsrf?: boolean;
  skipAuth?: boolean;
}

/**
 * Authenticated fetch wrapper with CSRF protection
 * Automatically adds Firebase ID token and CSRF token to requests
 */
export async function authenticatedFetch(
  url: string,
  options: ApiOptions = {}
): Promise<any> {
  const {
    requiresCsrf = true,
    skipAuth = false,
    headers = {},
    ...restOptions
  } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  // Add Firebase ID token for authentication
  if (!skipAuth && auth?.currentUser) {
    try {
      const idToken = await auth.currentUser.getIdToken();
      requestHeaders['Authorization'] = `Bearer ${idToken}`;
    } catch (error) {
      console.error('Failed to get ID token:', error);
      throw new Error('Authentication failed. Please log in again.');
    }
  }

  // Add CSRF token for mutation requests
  const method = (restOptions.method || 'GET').toUpperCase();
  const requiresCsrfToken = requiresCsrf && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);

  if (requiresCsrfToken) {
    try {
      const csrfResponse = await fetch('/api/csrf');
      if (csrfResponse.ok) {
        const csrfData = await csrfResponse.json();
        requestHeaders['X-CSRF-Token'] = csrfData.token;
      }
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
      // Continue without CSRF token - server will reject if required
    }
  }

  // Make request
  const response = await fetch(url, {
    ...restOptions,
    headers: requestHeaders,
  });

  return handleApiResponse(response);
}

/**
 * Simple GET request (no auth required)
 */
export async function publicFetch(url: string): Promise<any> {
  const response = await fetch(url);
  return handleApiResponse(response);
}

/**
 * GET request with authentication
 */
export async function apiGet(url: string): Promise<any> {
  return authenticatedFetch(url, { method: 'GET', requiresCsrf: false });
}

/**
 * POST request with authentication and CSRF
 */
export async function apiPost(url: string, data?: any): Promise<any> {
  return authenticatedFetch(url, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PUT request with authentication and CSRF
 */
export async function apiPut(url: string, data?: any): Promise<any> {
  return authenticatedFetch(url, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * DELETE request with authentication and CSRF
 */
export async function apiDelete(url: string): Promise<any> {
  return authenticatedFetch(url, {
    method: 'DELETE',
  });
}
