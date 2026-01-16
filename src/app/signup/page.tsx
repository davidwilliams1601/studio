"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useCsrf } from "@/hooks/use-csrf";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [teamToken, setTeamToken] = useState<string | null>(null);
  const [teamInfo, setTeamInfo] = useState<any>(null);
  const [validatingInvite, setValidatingInvite] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();
  const { token: csrfToken } = useCsrf();

  // Get plan or team invite from URL parameter on client side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const plan = params.get('plan');
      const team = params.get('team');

      setSelectedPlan(plan);

      if (team) {
        setTeamToken(team);
        validateTeamInvite(team);
      }
    }
  }, []);

  const validateTeamInvite = async (token: string) => {
    setValidatingInvite(true);
    try {
      const response = await fetch(`/api/team/validate-invite/${token}`);
      const data = await response.json();

      if (data.success && data.valid) {
        setTeamInfo(data.team);
        // Pre-fill email if provided in invite
        if (data.invite.email) {
          setEmail(data.invite.email);
        }
      } else {
        setError(data.error || 'Invalid invitation link');
      }
    } catch (err) {
      setError('Failed to validate invitation');
    } finally {
      setValidatingInvite(false);
    }
  };

  const planDetails = {
    pro: { name: 'Pro', price: '£10/month', priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO },
    business: { name: 'Business', price: '£75/month for up to 10 users', priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS },
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
      // Create account
      const newUser = await signup(email, password, '');
      const idToken = await newUser.getIdToken();

      // If this is a team invite, accept it
      if (teamToken && teamInfo) {
        const acceptResponse = await fetch('/api/team/accept-invite', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            token: teamToken,
          }),
        });

        const acceptData = await acceptResponse.json();

        if (!acceptData.success) {
          throw new Error(acceptData.error || 'Failed to join team');
        }

        // Create session cookie
        await fetch('/api/auth/create-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            idToken,
          }),
        });

        // Redirect to dashboard
        window.location.href = '/dashboard';
        return;
      }

      // If user selected a paid plan, redirect to checkout
      if (plan && plan.priceId && csrfToken) {
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

  if (validatingInvite) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🔄</div>
          <h3>Validating invitation...</h3>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
      <div style={{ background: "white", padding: "2rem", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", width: "400px" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          {teamInfo ? (
            <>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>👥</div>
              <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "#1e293b", marginBottom: "0.5rem" }}>
                Join Team
              </h1>
              <div style={{
                marginTop: "1rem",
                padding: "0.75rem 1rem",
                background: "#dbeafe",
                border: "2px solid #3b82f6",
                borderRadius: "8px",
                display: "inline-block"
              }}>
                <div style={{ fontSize: "0.875rem", color: "#1e40af", fontWeight: "bold" }}>
                  Invited by {teamInfo.ownerName}
                </div>
                <div style={{ fontSize: "0.875rem", color: "#1e40af" }}>
                  {teamInfo.ownerEmail}
                </div>
              </div>
              <p style={{ color: "#64748b", marginTop: "1rem", fontSize: "0.875rem" }}>
                You'll get Business tier benefits for free!
              </p>
            </>
          ) : (
            <>
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
            </>
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
            readOnly={!!teamInfo} // Lock email if from team invite
            style={{
              padding: "0.75rem",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              width: "100%",
              boxSizing: "border-box",
              background: teamInfo ? "#f9fafb" : "white"
            }}
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
              background: loading || (!!plan && !csrfToken) ? "#9ca3af" : (teamInfo ? "#10b981" : plan ? "#3b82f6" : "#10b981"),
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading || (!!plan && !csrfToken) ? "not-allowed" : "pointer",
              fontWeight: "bold"
            }}
          >
            {loading
              ? (teamInfo ? "Joining Team..." : plan ? "Creating Account & Setting Up Payment..." : "Creating Account...")
              : (!!plan && !csrfToken)
                ? "Loading..."
                : (teamInfo ? "Accept Invitation & Create Account" : plan ? `Continue to ${plan.name} Checkout` : "Create Free Account")
            }
          </button>
          <p style={{ textAlign: "center", fontSize: "0.875rem", color: "#64748b" }}>
            Already have an account? <a href="/login" style={{ color: "#3b82f6", textDecoration: "none" }}>Sign in</a>
          </p>

          {/* Footer Links */}
          <div style={{
            textAlign: "center",
            marginTop: "2rem",
            paddingTop: "1.5rem",
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            gap: "1.5rem",
            justifyContent: "center",
            flexWrap: "wrap"
          }}>
            <a href="/privacy" style={{ color: "#6b7280", fontSize: "0.75rem", textDecoration: "none" }}>
              Privacy Policy
            </a>
            <a href="/terms" style={{ color: "#6b7280", fontSize: "0.75rem", textDecoration: "none" }}>
              Terms of Service
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
