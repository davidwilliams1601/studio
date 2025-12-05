import { useState, useEffect } from 'react';

/**
 * Hook to fetch and manage CSRF token
 * Token is automatically refreshed when it expires
 */
export function useCsrf() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchToken() {
      try {
        const response = await fetch('/api/csrf');

        if (!response.ok) {
          throw new Error('Failed to fetch CSRF token');
        }

        const data = await response.json();

        if (mounted) {
          setToken(data.token);
          setError(null);
        }
      } catch (err) {
        console.error('CSRF token fetch error:', err);
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchToken();

    // Refresh token every 23 hours (before 24h expiry)
    const intervalId = setInterval(fetchToken, 23 * 60 * 60 * 1000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, []);

  return { token, loading, error, refetch: () => setLoading(true) };
}
