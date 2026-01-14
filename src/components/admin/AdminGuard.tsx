'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { user, firebaseReady, loading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkAdminStatus() {
      // Wait for Firebase to be ready
      if (!firebaseReady) {
        return;
      }

      // Wait for auth loading to complete
      if (loading) {
        return;
      }

      // If no user after loading is complete, redirect
      if (!user) {
        console.log('No user found after auth loading completed, redirecting to admin login');
        router.push('/admin/login');
        return;
      }

      try {
        // Get fresh ID token
        const idToken = await user.getIdToken(true);

        // Check admin role via API
        const response = await fetch('/api/admin/check-role', {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        if (!response.ok) {
          console.warn('Admin check failed, redirecting to admin login');
          router.push('/admin/login');
          return;
        }

        setIsAdmin(true);
      } catch (error) {
        console.error('Admin verification error:', error);
        router.push('/admin/login');
      } finally {
        setChecking(false);
      }
    }

    checkAdminStatus();
  }, [user, firebaseReady, loading, router]);

  // Show loading state while checking or while auth is loading
  if (checking || !firebaseReady || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Show nothing if not admin (redirect will happen)
  if (!isAdmin) {
    return null;
  }

  // User is admin, render children
  return <>{children}</>;
}
