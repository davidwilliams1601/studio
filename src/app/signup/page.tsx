"use client";

import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useCsrf } from "@/hooks/use-csrf";

function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signup } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token: csrfToken } = useCsrf();

  // Get plan from URL parameter (e.g., /signup?plan=pro)
  const selectedPlan = searchParams.get('plan');

  const planDetails = {
    pro: { name: 'Pro', price: '£10/month', priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO },
    business: { name: 'Business', price: '£29/month', priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS },
    enterprise: { name: 'Enterprise', price: 'Custom pricing', priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE }
  };

  const plan = selectedPlan && planDetails[selectedPlan as keyof typeof planDetails]
    ? planDetails[selectedPlan as keyof typeof planDetails]
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // If user selected a paid plan, create account then redirect to checkout
      if (plan && plan.priceId && csrfToken) {
        // Create account without auto-redirect (pass empty string)
        const newUser = await signup(email, password, '');

        // Get ID token for the new user
        const idToken = await newUser.getIdToken();

        // Create Stripe checkout session
        const response = await fetch('/api/subscription/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
            'X-CSRF-Token': csrfToken,
          },
          body: JSON.stringify({
            priceId: plan.priceId,
          }),
        });

        const data = await response.json();

        if (data.success && data.url) {
          // Create session cookie first, then redirect to Stripe
          await fetch('/api/auth/create-session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              idToken,
            }),
          });

          // Now redirect to Stripe checkout
          window.location.href = data.url;
          return;
        } else {
          throw new Error(data.error || 'Failed to create checkout session');
        }
      } else {
        // Free signup - just create account and go to dashboard
        await signup(email, password);
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
    // Note: Don't setLoading(false) here if successful - page will redirect
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
      <div style={{ background: "white", padding: "2rem", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", width: "400px" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "#1e293b", marginBottom: "0.5rem" }}>
            {plan ? `Sign up for ${plan.name}` : 'Create Account'}
          </h1>
          <p style={{ color: "#64748b" }}>
            {plan ? `Get started with LinkStream ${plan.name}` : 'Start analyzing your LinkedIn data'}
          </p>
          {plan && (
            <div style={{
              marginTop: "1rem",
              padding: "0.75rem 1rem",
              background: "#dbeafe",
              border: "2px solid #3b82f6",
              borderRadius: "8px",
              display: "inline-block"
            }}>
              <div style={{ fontSize: "0.875rem", color: "#1e40af", fontWeight: "bold" }}>
                💎 {plan.name} Plan
              </div>
              <div style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#1e40af" }}>
                {plan.price}
              </div>
            </div>
          )}
        </div>
        
        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "0.75rem", borderRadius: "4px", marginBottom: "1rem", fontSize: "0.875rem" }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <input 
            type="text" 
            placeholder="Full Name" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "4px", width: "100%", boxSizing: "border-box" }} 
          />
          <input 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "4px", width: "100%", boxSizing: "border-box" }} 
          />
          <input 
            type="password" 
            placeholder="Password (6+ characters)" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={{ padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "4px", width: "100%", boxSizing: "border-box" }} 
          />
          <button
            type="submit"
            disabled={loading || (!!plan && !csrfToken)}
            style={{
              padding: "0.75rem",
              background: loading || (!!plan && !csrfToken) ? "#9ca3af" : (plan ? "#3b82f6" : "#10b981"),
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading || (!!plan && !csrfToken) ? "not-allowed" : "pointer",
              fontWeight: "bold"
            }}
          >
            {loading
              ? (plan ? "Creating Account & Setting Up Payment..." : "Creating Account...")
              : (!!plan && !csrfToken)
                ? "Loading..."
                : (plan ? `Continue to ${plan.name} Checkout` : "Create Free Account")
            }
          </button>
          <p style={{ textAlign: "center", fontSize: "0.875rem", color: "#64748b" }}>
            Already have an account? <a href="/login" style={{ color: "#3b82f6", textDecoration: "none" }}>Sign in</a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function Signup() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🔄</div>
          <h3>Loading...</h3>
        </div>
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}
