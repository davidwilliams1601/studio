# Frontend Integration Guide for Security Fixes

This guide helps you integrate the security fixes into your frontend code.

---

## 🚨 Breaking Changes

### 1. CSRF Token Required for Mutations

All POST, PUT, and DELETE requests now require a CSRF token for security.

---

## 🔧 Implementation Steps

### Step 1: Create CSRF Hook

Create `src/hooks/use-csrf.ts`:

```typescript
import { useState, useEffect } from 'react';

export function useCsrf() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchToken() {
      try {
        const response = await fetch('/api/csrf');
        const data = await response.json();
        setToken(data.token);
      } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchToken();
  }, []);

  return { token, loading };
}
```

---

### Step 2: Create Authenticated Fetch Helper

Create `src/lib/api-client.ts`:

```typescript
import { auth } from '@/firebase/config';

interface ApiOptions extends RequestInit {
  requiresCsrf?: boolean;
}

export async function authenticatedFetch(
  url: string,
  options: ApiOptions = {}
): Promise<Response> {
  const { requiresCsrf = true, headers = {}, ...restOptions } = options;

  // Get Firebase ID token
  const user = auth?.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }

  const idToken = await user.getIdToken();

  // Get CSRF token if needed
  let csrfToken = null;
  if (requiresCsrf && ['POST', 'PUT', 'DELETE'].includes(restOptions.method || 'GET')) {
    const csrfResponse = await fetch('/api/csrf');
    const csrfData = await csrfResponse.json();
    csrfToken = csrfData.token;
  }

  // Build headers
  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${idToken}`,
    ...headers,
  };

  if (csrfToken) {
    requestHeaders['X-CSRF-Token'] = csrfToken;
  }

  // Make request
  const response = await fetch(url, {
    ...restOptions,
    headers: requestHeaders,
  });

  // Handle rate limiting
  if (response.status === 429) {
    const errorData = await response.json();
    const retryAfter = errorData.retryAfter || 60;
    throw new Error(
      `Too many requests. Please try again in ${retryAfter} seconds.`
    );
  }

  // Handle CSRF errors
  if (response.status === 403) {
    const errorData = await response.json();
    if (errorData.error?.includes('CSRF')) {
      throw new Error('Security token expired. Please refresh the page.');
    }
  }

  return response;
}
```

---

### Step 3: Update API Calls

#### Before:
```typescript
const createSubscription = async (priceId: string) => {
  const user = auth?.currentUser;
  const idToken = await user.getIdToken();

  const response = await fetch('/api/subscription/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
    },
    body: JSON.stringify({ priceId }),
  });

  return response.json();
};
```

#### After:
```typescript
import { authenticatedFetch } from '@/lib/api-client';

const createSubscription = async (priceId: string) => {
  const response = await authenticatedFetch('/api/subscription/create', {
    method: 'POST',
    body: JSON.stringify({ priceId }),
  });

  return response.json();
};
```

---

### Step 4: Update Components

#### Example: Subscription Manager

```typescript
'use client';

import { useState } from 'react';
import { authenticatedFetch } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';

export function SubscriptionManager() {
  const { subscription } = useAuth(); // Now fetched from server
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async (priceId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authenticatedFetch('/api/subscription/create', {
        method: 'POST',
        body: JSON.stringify({ priceId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const data = await response.json();
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Current Plan: {subscription?.plan || 'free'}</h2>
      <p>Monthly Usage: {subscription?.monthlyUsage || 0}</p>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <button
        onClick={() => handleUpgrade('price_pro_monthly')}
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Upgrade to Pro'}
      </button>
    </div>
  );
}
```

---

### Step 5: Update File Upload Component

```typescript
'use client';

import { useState } from 'react';
import { authenticatedFetch } from '@/lib/api-client';

export function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      // Step 1: Get signed upload URL
      const response = await authenticatedFetch('/api/backups/upload', {
        method: 'POST',
        body: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
          contentType: file.type,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const { uploadUrl, backupId } = await response.json();

      // Step 2: Upload file directly to Firebase Storage
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }

      // Step 3: Process the backup
      await authenticatedFetch(`/api/backups/${backupId}/process`, {
        method: 'POST',
      });

      alert('Upload successful!');
    } catch (err: any) {
      // Handle rate limiting
      if (err.message.includes('Too many requests')) {
        setError(err.message);
      } else if (err.message.includes('Security token')) {
        setError('Session expired. Please refresh the page.');
      } else {
        setError(err.message || 'Upload failed');
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept=".zip"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
}
```

---

### Step 6: Handle Authentication Errors

Create `src/lib/error-handler.ts`:

```typescript
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function handleApiResponse(response: Response): Promise<any> {
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));

    // Handle specific status codes
    switch (response.status) {
      case 401:
        // Redirect to login
        window.location.href = '/login?error=session_expired';
        throw new ApiError('Authentication required', 401, data);

      case 403:
        if (data.error?.includes('CSRF')) {
          throw new ApiError('Security token expired. Please refresh the page.', 403, data);
        }
        throw new ApiError(data.error || 'Forbidden', 403, data);

      case 429:
        const retryAfter = data.retryAfter || 60;
        throw new ApiError(
          `Too many requests. Please try again in ${retryAfter} seconds.`,
          429,
          data
        );

      case 500:
        throw new ApiError(data.error || 'Server error. Please try again.', 500, data);

      default:
        throw new ApiError(data.error || 'Something went wrong', response.status, data);
    }
  }

  return response.json();
}
```

Update `api-client.ts`:

```typescript
import { handleApiResponse } from './error-handler';

export async function authenticatedFetch(
  url: string,
  options: ApiOptions = {}
): Promise<any> {
  // ... existing code ...

  const response = await fetch(url, {
    ...restOptions,
    headers: requestHeaders,
  });

  return handleApiResponse(response);
}
```

---

## ✅ Testing Checklist

### Authentication Flow
- [ ] Login with email/password works
- [ ] Signup creates new user
- [ ] Google OAuth login works
- [ ] LinkedIn OAuth login works
- [ ] Logout clears session
- [ ] Session expiration redirects to login

### CSRF Protection
- [ ] Mutation requests include CSRF token
- [ ] Requests without token are rejected (403)
- [ ] Token refresh works correctly
- [ ] Token expiration handled gracefully

### Rate Limiting
- [ ] Rate limits trigger correctly
- [ ] 429 errors show user-friendly messages
- [ ] Retry-after time is displayed
- [ ] Different limits for different endpoints work

### Subscription Management
- [ ] Current subscription fetched from server
- [ ] Cannot modify subscription in browser dev tools
- [ ] Stripe checkout flow works
- [ ] Usage limits enforced server-side

### File Uploads
- [ ] Upload process completes successfully
- [ ] Rate limits work (10 uploads per hour)
- [ ] File size validation works
- [ ] Invalid file types rejected

### Error Handling
- [ ] Authentication errors redirect to login
- [ ] Rate limit errors show retry time
- [ ] CSRF errors prompt page refresh
- [ ] Generic errors don't expose internals

---

## 🐛 Troubleshooting

### "Invalid CSRF token" Error
**Solution:** Refresh the page to get a new CSRF token.

### "Too many requests" Error
**Solution:** Wait for the time specified in `retryAfter` seconds.

### "Authentication required" Error
**Solution:** User is not logged in. Redirect to `/login`.

### Session Verification Fails
**Solution:** Check that Firebase session cookies are properly set and not expired.

### TypeScript Errors
**Solution:** Run `npm run typecheck` to see all type errors. Fix them one by one.

---

## 📚 Additional Resources

- [CSRF Protection Explained](https://owasp.org/www-community/attacks/csrf)
- [Rate Limiting Best Practices](https://www.cloudflare.com/learning/bots/what-is-rate-limiting/)
- [Firebase Authentication Best Practices](https://firebase.google.com/docs/auth/web/manage-users)

---

**Last Updated:** 2025-12-04
