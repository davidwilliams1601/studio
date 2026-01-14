"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { resetPassword, firebaseReady } = useAuth();
  const router = useRouter();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await resetPassword(email);
      setSuccess(true);
      setEmail('');
    } catch (error: any) {
      console.error('Password reset error:', error);
      setError(error.message || 'Failed to send password reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem"
    }}>
      <div style={{
        background: "white",
        borderRadius: "16px",
        padding: "2rem",
        width: "100%",
        maxWidth: "400px",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            color: "#1e293b",
            marginBottom: "0.5rem"
          }}>
            Reset Password
          </h1>
          <p style={{
            color: "#64748b",
            fontSize: "0.875rem"
          }}>
            Enter your email and we'll send you a password reset link
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div style={{
            background: "#f0fdf4",
            border: "1px solid #86efac",
            color: "#166534",
            padding: "0.75rem",
            borderRadius: "8px",
            marginBottom: "1rem",
            fontSize: "0.875rem"
          }}>
            ✓ Password reset email sent! Check your inbox and follow the instructions.
          </div>
        )}

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
            Connecting to authentication service...
          </div>
        )}

        {/* Reset Password Form */}
        <form onSubmit={handleResetPassword}>
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: "500",
              color: "#374151",
              marginBottom: "0.5rem"
            }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "16px",
                boxSizing: "border-box"
              }}
              disabled={loading || !firebaseReady}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !firebaseReady}
            style={{
              width: "100%",
              padding: "0.875rem",
              background: loading ? "#9ca3af" : "#667eea",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: "bold",
              fontSize: "16px",
              cursor: loading ? "not-allowed" : "pointer",
              marginBottom: "1rem"
            }}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        {/* Back to Login */}
        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <Link
            href="/login"
            style={{
              color: "#667eea",
              fontSize: "0.875rem",
              textDecoration: "none"
            }}
          >
            ← Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
