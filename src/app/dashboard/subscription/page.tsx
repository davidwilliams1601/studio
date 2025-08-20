"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function Subscription() {
  const { user, subscription, firebaseReady } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentPlan = subscription?.plan || 'free';
  const currentUser = firebaseReady ? user : { email: 'demo@linkstream.app', uid: 'demo123' };

  useEffect(() => {
    if (firebaseReady && !user) {
      router.push('/login');
    }
  }, [user, firebaseReady, router]);

  const handleUpgrade = async (planType: 'pro' | 'enterprise') => {
    setLoading(true);
    setError('');

    try {
      console.log('🚀 Starting upgrade process for:', planType);
      
      // Create Stripe checkout session
      const response = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          plan: planType,
          userId: currentUser?.uid,
          userEmail: currentUser?.email
        })
      });

      const data = await response.json();
      
      if (data.success && data.url) {
        console.log('✅ Redirecting to Stripe checkout:', data.url);
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error: any) {
      console.error('❌ Upgrade error:', error);
      setError(error.message || 'Failed to start upgrade process');
      setLoading(false);
    }
  };

  // Show Pro benefits for current Pro users
  if (currentPlan === 'pro') {
    return (
      <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "2rem" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ 
            background: "white", 
            padding: "2rem", 
            borderRadius: "12px", 
            textAlign: "center",
            marginBottom: "2rem"
          }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🎉</div>
            <h1 style={{ fontSize: "2rem", color: "#15803d", marginBottom: "1rem" }}>
              You're a LinkStream Pro Member!
            </h1>
            <p style={{ color: "#64748b", marginBottom: "2rem" }}>
              Enjoy unlimited LinkedIn analyses with enhanced AI insights.
            </p>
            
            <div style={{ 
              background: "#f0fdf4", 
              padding: "1.5rem", 
              borderRadius: "8px", 
              border: "1px solid #10b981",
              marginBottom: "2rem"
            }}>
              <h3 style={{ color: "#15803d", marginBottom: "1rem" }}>🚀 Your Pro Benefits:</h3>
              <ul style={{ textAlign: "left", color: "#065f46", paddingLeft: "1.5rem" }}>
                <li>✅ Unlimited LinkedIn data analyses</li>
                <li>✅ Enhanced AI insights and recommendations</li>
                <li>✅ Advanced competitor analysis</li>
                <li>✅ Network growth predictions</li>
                <li>✅ Industry trend analysis</li>
                <li>✅ Professional email support</li>
              </ul>
            </div>

            <a 
              href="/dashboard"
              style={{ 
                background: "#10b981", 
                color: "white", 
                padding: "1rem 2rem", 
                borderRadius: "8px", 
                textDecoration: "none", 
                fontWeight: "bold",
                display: "inline-block"
              }}
            >
              📊 Go to Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "2rem" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "1rem" }}>
            🚀 Upgrade to LinkStream Pro
          </h1>
          <p style={{ fontSize: "1.25rem", color: "#64748b" }}>
            Unlock unlimited analyses and AI-powered insights
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{ 
            background: "#fef2f2", 
            border: "1px solid #fecaca", 
            color: "#dc2626", 
            padding: "1rem", 
            borderRadius: "8px", 
            marginBottom: "2rem",
            textAlign: "center"
          }}>
            {error}
          </div>
        )}

        {/* Pricing Cards */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", 
          gap: "2rem",
          marginBottom: "3rem"
        }}>
          
          {/* Free Plan */}
          <div style={{ 
            background: "white", 
            padding: "2rem", 
            borderRadius: "12px", 
            border: "2px solid #e5e7eb",
            position: "relative"
          }}>
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
                Free Plan
              </h3>
              <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#64748b" }}>
                $0<span style={{ fontSize: "1rem", fontWeight: "normal" }}>/month</span>
              </div>
            </div>
            
            <ul style={{ paddingLeft: "1.5rem", marginBottom: "2rem", color: "#64748b" }}>
              <li>✅ 1 LinkedIn analysis per month</li>
              <li>✅ Basic connection insights</li>
              <li>✅ Industry breakdown</li>
              <li>✅ Geographic distribution</li>
              <li>❌ AI-powered recommendations</li>
              <li>❌ Unlimited analyses</li>
              <li>❌ Advanced insights</li>
            </ul>

            <div style={{ 
              background: "#f3f4f6", 
              color: "#6b7280", 
              padding: "0.75rem 1.5rem", 
              borderRadius: "8px", 
              textAlign: "center",
              fontWeight: "bold"
            }}>
              Current Plan
            </div>
          </div>

          {/* Pro Plan */}
          <div style={{ 
            background: "white", 
            padding: "2rem", 
            borderRadius: "12px", 
            border: "2px solid #10b981",
            position: "relative",
            transform: "scale(1.05)"
          }}>
            <div style={{ 
              position: "absolute",
              top: "-10px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "#10b981",
              color: "white",
              padding: "0.5rem 1rem",
              borderRadius: "20px",
              fontSize: "0.875rem",
              fontWeight: "bold"
            }}>
              🔥 RECOMMENDED
            </div>

            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem", color: "#10b981" }}>
                Pro Plan
              </h3>
              <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#10b981" }}>
                $29<span style={{ fontSize: "1rem", fontWeight: "normal" }}>/month</span>
              </div>
            </div>
            
            <ul style={{ paddingLeft: "1.5rem", marginBottom: "2rem", color: "#064e3b" }}>
              <li>✅ Unlimited LinkedIn analyses</li>
              <li>✅ Enhanced AI insights & recommendations</li>
              <li>✅ Advanced competitor analysis</li>
              <li>✅ Network growth predictions</li>
              <li>✅ Industry trend analysis</li>
              <li>✅ Professional email support</li>
              <li>✅ Monthly strategy reports</li>
            </ul>

            <button
              onClick={() => handleUpgrade('pro')}
              disabled={loading}
              style={{ 
                width: "100%",
                background: loading ? "#9ca3af" : "#10b981", 
                color: "white", 
                padding: "1rem 2rem", 
                border: "none",
                borderRadius: "8px", 
                fontWeight: "bold",
                fontSize: "1.1rem",
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              {loading ? "🔄 Processing..." : "🚀 Upgrade to Pro"}
            </button>
          </div>
        </div>

        {/* Benefits Section */}
        <div style={{ 
          background: "white", 
          padding: "3rem 2rem", 
          borderRadius: "12px", 
          textAlign: "center" 
        }}>
          <h2 style={{ fontSize: "2rem", marginBottom: "2rem" }}>
            🤖 What You Get with Pro
          </h2>
          
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
            gap: "2rem" 
          }}>
            <div>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🧠</div>
              <h3 style={{ marginBottom: "1rem" }}>AI-Powered Insights</h3>
              <p style={{ color: "#64748b" }}>
                Get personalized recommendations based on your LinkedIn data analysis
              </p>
            </div>
            
            <div>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📈</div>
              <h3 style={{ marginBottom: "1rem" }}>Growth Predictions</h3>
              <p style={{ color: "#64748b" }}>
                See how your network is growing and get predictions for future expansion
              </p>
            </div>
            
            <div>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎯</div>
              <h3 style={{ marginBottom: "1rem" }}>Competitor Analysis</h3>
              <p style={{ color: "#64748b" }}>
                Understand how your network compares to industry benchmarks
              </p>
            </div>
          </div>
        </div>

        {/* Back to Dashboard */}
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <a 
            href="/dashboard"
            style={{ 
              color: "#3b82f6", 
              textDecoration: "none",
              fontSize: "1.1rem"
            }}
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
