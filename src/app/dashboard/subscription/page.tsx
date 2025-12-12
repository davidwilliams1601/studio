"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useCsrf } from "@/hooks/use-csrf";

export default function Subscription() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { token: csrfToken } = useCsrf();
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleUpgrade = async (plan: any) => {
    if (!plan.priceId) {
      alert('This plan is not available for purchase.');
      return;
    }

    setUpgradeLoading(true);
    try {
      // Get ID token for authentication
      const idToken = await user?.getIdToken();
      if (!idToken) {
        throw new Error('Authentication required');
      }

      // Create Stripe checkout session
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      };

      if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken;
      }

      const response = await fetch('/api/subscription/create', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          priceId: plan.priceId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe checkout
      window.location.href = data.url;
    } catch (error: any) {
      console.error('Error upgrading:', error);
      alert(error.message || 'Failed to start checkout. Please try again.');
    } finally {
      setUpgradeLoading(false);
    }
  };

  const plans = [
    {
      name: "Free",
      price: "$0",
      interval: "forever",
      features: [
        "1 LinkedIn backup per month",
        "Basic data export analysis",
        "Standard charts and visualizations",
        "Basic PDF reports",
        "Essential data preservation"
      ],
      limitations: ["Limited to 1 backup", "No AI insights", "Basic support"],
      current: true
    },
    {
      name: "Pro",
      price: "$19",
      interval: "month",
      priceId: "price_pro_monthly",
      features: [
        "Unlimited LinkedIn backups",
        "Advanced AI-powered insights",
        "Professional PDF reports",
        "Historical data tracking & comparison",
        "Account security monitoring",
        "Priority recovery support"
      ],
      popular: true,
      current: false
    },
    {
      name: "Enterprise",
      price: "$99",
      interval: "month",
      priceId: "price_enterprise_monthly",
      features: [
        "Everything in Pro",
        "Team-wide LinkedIn protection",
        "Custom security alerts",
        "API access for integrations",
        "Dedicated security consultant",
        "Priority incident response"
      ],
      current: false
    }
  ];

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "2rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ marginBottom: "2rem" }}>
          <a href="/dashboard" style={{ color: "#3b82f6", textDecoration: "none" }}>← Back to Dashboard</a>
        </div>

        {/* Hero Section - Security Focus */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🛡️</div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#1e293b", marginBottom: "1rem" }}>
            Protect Your LinkedIn Profile
          </h1>
          <p style={{ fontSize: "1.2rem", color: "#64748b", maxWidth: "600px", margin: "0 auto" }}>
            <strong>Don't lose years of networking.</strong> Backup your LinkedIn data before hackers, platform changes, or account issues destroy your professional network.
          </p>
        </div>

        {/* Security Stats */}
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", padding: "2rem", borderRadius: "8px", marginBottom: "3rem" }}>
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#dc2626", marginBottom: "0.5rem" }}>
              ⚠️ LinkedIn Security Reality Check
            </h3>
          </div>
          <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#dc2626", marginBottom: "0.5rem" }}>700M+</div>
              <p style={{ color: "#7f1d1d", fontSize: "0.875rem" }}>LinkedIn accounts compromised in data breaches</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#dc2626", marginBottom: "0.5rem" }}>24 hrs</div>
              <p style={{ color: "#7f1d1d", fontSize: "0.875rem" }}>Average time to lose access to hacked accounts</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#dc2626", marginBottom: "0.5rem" }}>$0</div>
              <p style={{ color: "#7f1d1d", fontSize: "0.875rem" }}>What LinkedIn pays you when your data is lost</p>
            </div>
          </div>
        </div>

        {/* Current Plan Status */}
        <div style={{ background: "white", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", marginBottom: "3rem", textAlign: "center" }}>
          <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "0.5rem" }}>Current Protection: Free Plan</h3>
          <p style={{ color: "#64748b" }}>You have <strong>1 backup remaining</strong> this month. Upgrade for continuous protection!</p>
        </div>

        {/* Pricing Plans */}
        <div style={{ display: "grid", gap: "2rem", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
          {plans.map((plan, index) => (
            <div 
              key={plan.name}
              style={{ 
                background: "white", 
                padding: "2rem", 
                borderRadius: "12px", 
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                border: plan.popular ? "2px solid #3b82f6" : "1px solid #e5e7eb",
                position: "relative",
                transform: plan.popular ? "scale(1.05)" : "scale(1)",
                transition: "transform 0.2s ease"
              }}
            >
              {plan.popular && (
                <div style={{ 
                  position: "absolute", 
                  top: "-12px", 
                  left: "50%", 
                  transform: "translateX(-50%)",
                  background: "#3b82f6", 
                  color: "white", 
                  padding: "0.5rem 1rem", 
                  borderRadius: "20px", 
                  fontSize: "0.875rem",
                  fontWeight: "bold"
                }}>
                  🛡️ Best Protection
                </div>
              )}

              <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>{plan.name}</h3>
                <div style={{ fontSize: "3rem", fontWeight: "bold", color: "#3b82f6", marginBottom: "0.5rem" }}>
                  {plan.price}
                  {plan.interval !== "forever" && <span style={{ fontSize: "1rem", color: "#64748b" }}>/{plan.interval}</span>}
                </div>
              </div>

              <div style={{ marginBottom: "2rem" }}>
                <h4 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "1rem", color: "#10b981" }}>🛡️ Protection included:</h4>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} style={{ display: "flex", alignItems: "center", marginBottom: "0.75rem" }}>
                      <span style={{ color: "#10b981", marginRight: "0.5rem", fontSize: "1.2rem" }}>✓</span>
                      <span style={{ fontSize: "0.875rem" }}>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {plan.limitations && (
                <div style={{ marginBottom: "2rem" }}>
                  <h4 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "1rem", color: "#ef4444" }}>⚠️ Limitations:</h4>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {plan.limitations.map((limitation, limitIndex) => (
                      <li key={limitIndex} style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
                        <span style={{ color: "#ef4444", marginRight: "0.5rem" }}>×</span>
                        <span style={{ fontSize: "0.875rem", color: "#64748b" }}>{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={() => handleUpgrade(plan)}
                disabled={plan.current || upgradeLoading}
                style={{
                  width: "100%",
                  padding: "1rem",
                  background: plan.current ? "#9ca3af" : plan.popular ? "#3b82f6" : "#64748b",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  cursor: plan.current ? "not-allowed" : "pointer",
                  fontSize: "1rem",
                  transition: "background 0.2s ease"
                }}
              >
                {plan.current ? "✅ Current Plan" : upgradeLoading ? "🔄 Processing..." : `🛡️ Secure with ${plan.name}`}
              </button>
            </div>
          ))}
        </div>

        {/* Why This Matters */}
        <div style={{ background: "white", padding: "2rem", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", marginTop: "3rem" }}>
          <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", textAlign: "center", marginBottom: "2rem" }}>
            🚨 What Happens When LinkedIn Accounts Get Compromised?
          </h3>
          <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
            <div style={{ textAlign: "center", padding: "1rem" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>💼</div>
              <h4 style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>Lost Professional Network</h4>
              <p style={{ color: "#64748b", fontSize: "0.875rem" }}>Years of networking and connections vanish instantly</p>
            </div>
            <div style={{ textAlign: "center", padding: "1rem" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📞</div>
              <h4 style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>Missing Contact Information</h4>
              <p style={{ color: "#64748b", fontSize: "0.875rem" }}>No way to reach important business contacts</p>
            </div>
            <div style={{ textAlign: "center", padding: "1rem" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔒</div>
              <h4 style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>Account Recovery Nightmare</h4>
              <p style={{ color: "#64748b", fontSize: "0.875rem" }}>LinkedIn's recovery process can take weeks or fail completely</p>
            </div>
          </div>
        </div>

        {/* Testimonial/Social Proof */}
        <div style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", padding: "2rem", borderRadius: "8px", marginTop: "3rem", textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>💬</div>
          <blockquote style={{ fontSize: "1.1rem", marginBottom: "1rem", fontStyle: "italic" }}>
            "I lost my LinkedIn account with 8,000+ connections due to a security breach. LinkStream's backup saved my entire professional network and career prospects."
          </blockquote>
          <cite style={{ fontSize: "0.9rem", opacity: "0.8" }}>— Sarah Chen, Marketing Director</cite>
        </div>

        {/* FAQ Section */}
        <div style={{ textAlign: "center", marginTop: "3rem", padding: "2rem", background: "white", borderRadius: "8px" }}>
          <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1rem" }}>🛡️ Secure Your Professional Future Today</h3>
          <p style={{ color: "#64748b", marginBottom: "1rem" }}>
            Don't wait until it's too late. Your LinkedIn network is irreplaceable.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button style={{ padding: "0.75rem 2rem", background: "#dc2626", color: "white", border: "none", borderRadius: "6px", fontWeight: "bold" }}>
              🚨 Emergency Recovery Help
            </button>
            <button style={{ padding: "0.75rem 2rem", background: "#f8fafc", color: "#64748b", border: "1px solid #e5e7eb", borderRadius: "6px", fontWeight: "bold" }}>
              💬 Security Consultation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
