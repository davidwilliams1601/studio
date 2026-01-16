'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAdmin() {
      if (authLoading) return;

      if (!user) {
        console.log('🚫 No user, redirecting to login');
        router.push('/login');
        return;
      }

      try {
        const idToken = await user.getIdToken();
        const response = await fetch('/api/admin/check-role', {
          headers: { Authorization: `Bearer ${idToken}` },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Admin check passed:', data);
          setIsAdmin(true);
        } else {
          console.log('🚫 Admin check failed, redirecting to dashboard');
          setIsAdmin(false);
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Admin check error:', error);
        setIsAdmin(false);
        router.push('/dashboard');
      } finally {
        setChecking(false);
      }
    }

    checkAdmin();
  }, [user, authLoading, router]);

  if (authLoading || checking) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#64748b' }}>Checking admin access...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Router will redirect
  }

  return <>{children}</>;
}
