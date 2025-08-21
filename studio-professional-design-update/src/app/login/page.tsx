"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, signup, loginWithGoogle, firebaseReady } = useAuth();
  const router = useRouter();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Authentication error:', error);
      setError(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError('');

    try {
      await loginWithGoogle();
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Google auth error:', error);
      setError(error.message || 'Google authentication failed');
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
      {/* Mobile-First Login Container */}
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
            🛡️ LinkStream
          </h1>
          <h2 style={{ 
            fontSize: "1.25rem", 
            fontWeight: "600", 
            color: "#374151",
            margin: 0
          }}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p style={{ 
            color: "#6b7280", 
            fontSize: "0.875rem",
            margin: "0.5rem 0 0 0"
          }}>
            {isLogin ? 'Sign in to access your dashboard' : 'Start protecting your LinkedIn today'}
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
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              style={{ 
                width: "100%", 
                padding: "0.75rem", 
                border: "1px solid #d1d5db", 
                borderRadius: "8px",
                fontSize: "16px", // Prevents zoom on iOS
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
                fontSize: "16px", // Prevents zoom on iOS
                boxSizing: "border-box"
              }}
              disabled={loading}
            />
          </div>

          {/* Mobile-Optimized Submit Button */}
          <button
            type="submit"
            disabled={loading || !firebaseReady}
            style={{ 
              width: "100%", 
              padding: "0.875rem", 
              background: loading ? "#9ca3af" : "#3b82f6", 
              color: "white", 
              border: "none", 
              borderRadius: "8px", 
              fontWeight: "bold",
              fontSize: "16px", // Consistent with inputs
              cursor: loading ? "not-allowed" : "pointer",
              minHeight: "48px" // Touch-friendly height
            }}
          >
            {loading ? (
              <span>🔄 {isLogin ? 'Signing In...' : 'Creating Account...'}</span>
            ) : (
              <span>{isLogin ? '🛡️ Sign In' : '🚀 Create Account'}</span>
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

        {/* Google Sign-In Button */}
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
            gap: "0.5rem"
          }}
        >
          <span>🔑</span>
          <span>Continue with Google</span>
        </button>

        {/* Toggle Sign In / Sign Up */}
        <div style={{ textAlign: "center" }}>
          <p style={{ 
            fontSize: "0.875rem", 
            color: "#6b7280", 
            margin: 0 
          }}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            {' '}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              style={{ 
                color: "#3b82f6", 
                background: "none", 
                border: "none", 
                textDecoration: "underline", 
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: "500"
              }}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        {/* Back to Home */}
        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <a 
            href="/"
            style={{ 
              color: "#6b7280", 
              fontSize: "0.875rem", 
              textDecoration: "none"
            }}
          >
            ← Back to home
          </a>
        </div>
      </div>
    </div>
  );
}
