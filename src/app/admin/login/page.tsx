"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, loginWithGoogle, firebaseReady } = useAuth();
  const router = useRouter();

  const verifyAdminStatus = async (user: any) => {
    try {
      // Get fresh ID token
      const idToken = await user.getIdToken();

      // Check admin role via API
      const response = await fetch('/api/admin/check-role', {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Access denied: Admin privileges required');
      }

      return true;
    } catch (error: any) {
      throw new Error(error.message || 'Admin verification failed');
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await login(email, password);

      // Verify admin status
      await verifyAdminStatus(user);

      // Redirect to admin dashboard
      router.push('/dashboard/admin');
    } catch (error: any) {
      console.error('Admin authentication error:', error);
      setError(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError('');

    try {
      const user = await loginWithGoogle();

      // Verify admin status
      await verifyAdminStatus(user);

      // Redirect to admin dashboard
      router.push('/dashboard/admin');
    } catch (error: any) {
      // Silently ignore popup cancellation
      if (error.message === 'POPUP_CANCELLED' || error.code === 'auth/popup-cancelled') {
        console.log('User cancelled Google login popup');
        return;
      }

      console.error('Admin Google auth error:', error);
      setError(error.message || 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem"
    }}>
      {/* Admin Login Container */}
      <div style={{
        background: "white",
        borderRadius: "16px",
        padding: "2rem",
        width: "100%",
        maxWidth: "400px",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1)"
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            fontSize: "2.5rem",
            marginBottom: "0.5rem"
          }}>
            ⚙️
          </div>
          <h1 style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            color: "#1e293b",
            marginBottom: "0.5rem",
            margin: 0
          }}>
            Admin Portal
          </h1>
          <p style={{
            color: "#6b7280",
            fontSize: "0.875rem",
            margin: "0.5rem 0 0 0"
          }}>
            Secure access for administrators only
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#dc2626",
            padding: "0.75rem",
            borderRadius: "8px",
            marginBottom: "1rem",
            fontSize: "0.875rem"
          }}>
            {error}
          </div>
        )}

        {/* Firebase Ready Check */}
        {!firebaseReady && (
          <div style={{
            background: "#fef3c7",
            border: "1px solid #fcd34d",
            color: "#92400e",
            padding: "0.75rem",
            borderRadius: "8px",
            marginBottom: "1rem",
            fontSize: "0.875rem"
          }}>
            🔄 Connecting to authentication service...
          </div>
        )}

        {/* Email/Password Form */}
        <form onSubmit={handleEmailAuth} style={{ marginBottom: "1.5rem" }}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: "500",
              color: "#374151",
              marginBottom: "0.5rem"
            }}>
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "16px",
                boxSizing: "border-box"
              }}
              disabled={loading}
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: "500",
              color: "#374151",
              marginBottom: "0.5rem"
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "16px",
                boxSizing: "border-box"
              }}
              disabled={loading}
            />
          </div>

          {/* Forgot Password Link */}
          <div style={{ textAlign: "right", marginBottom: "1rem" }}>
            <Link
              href="/forgot-password"
              style={{
                color: "#1e293b",
                fontSize: "0.875rem",
                textDecoration: "none"
              }}
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !firebaseReady}
            style={{
              width: "100%",
              padding: "0.875rem",
              background: loading ? "#9ca3af" : "#1e293b",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: "bold",
              fontSize: "16px",
              cursor: loading ? "not-allowed" : "pointer",
              minHeight: "48px"
            }}
          >
            {loading ? (
              <span>🔄 Verifying Admin Access...</span>
            ) : (
              <span>🔐 Sign In as Admin</span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "1.5rem"
        }}>
          <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }}></div>
          <span style={{
            padding: "0 1rem",
            fontSize: "0.875rem",
            color: "#6b7280"
          }}>
            or
          </span>
          <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }}></div>
        </div>

        {/* Google Auth Button */}
        <button
          onClick={handleGoogleAuth}
          disabled={loading || !firebaseReady}
          style={{
            width: "100%",
            padding: "0.875rem",
            background: "white",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            fontWeight: "500",
            fontSize: "16px",
            cursor: loading ? "not-allowed" : "pointer",
            marginBottom: "1.5rem",
            minHeight: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? (
            <>
              <span>🔄</span>
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>🔑</span>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {/* Security Notice */}
        <div style={{
          background: "#f3f4f6",
          padding: "0.75rem",
          borderRadius: "8px",
          marginBottom: "1rem"
        }}>
          <p style={{
            fontSize: "0.75rem",
            color: "#6b7280",
            margin: 0,
            lineHeight: "1.5"
          }}>
            🔒 This portal is for authorized administrators only. All access attempts are logged and monitored.
          </p>
        </div>

        {/* Back to Site */}
        <div style={{ textAlign: "center" }}>
          <a
            href="/"
            style={{
              color: "#6b7280",
              fontSize: "0.875rem",
              textDecoration: "none"
            }}
          >
            ← Back to site
          </a>
        </div>
      </div>
    </div>
  );
}
