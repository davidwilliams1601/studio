"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function Subscription() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [subscription, setSubscription] = useState(null);
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleUpgrade = async (plan) => {
    setUpgradeLoading(true);
    try {
      // For now, just show an alert - we'll connect to Stripe later
      alert(`Upgrading to ${plan.name} plan! Stripe integration coming soon.`);
    } catch (error) {
      console.error('Error upgrading:', error);
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
        "1 LinkedIn analysis per month",
        "Basic insights and metrics",
        "Standard charts and visualizations",
        "Basic PDF reports"
      ],
      limitations: ["Limited to 1 analysis", "No AI insights", "Basic support"],
      current: true // For demo purposes
    },
    {
      name: "Pro",
      price: "$19",
      interval: "month",
      priceId: "price_pro_monthly",
      features: [
        "Unlimited LinkedIn analyses",
        "Advanced AI-powered insights",
        "Professional PDF reports",
        "Historical data tracking",
        "Priority email support"
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
        "Team collaboration features",
        "Custom branding and white-label",
        "API access for integrations",
        "Dedicated account manager",
        "Custom analytics and reporting"
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

        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#1e293b", marginBottom: "1rem" }}>
            🚀 Choose Your LinkStream Plan
          </h1>
          <p style={{ fontSize: "1.2rem", color: "#64748b" }}>
            Unlock powerful LinkedIn analytics and AI insights to grow your professional network
          </p>
        </div>

        {/* Current Plan Status */}
        <div style={{ background: "white", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", marginBottom: "3rem", textAlign: "center" }}>
          <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "0.5rem" }}>Current Plan: Free</h3>
          <p style={{ color: "#64748b" }}>You have <strong>1 analysis remaining</strong> this month. Upgrade for unlimited access!</p>
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
                  ⭐ Most Popular
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
                <h4 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "1rem", color: "#10b981" }}>✅ What's included:</h4>
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
                  <h4 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "1rem", color: "#ef4444" }}>❌ Limitations:</h4>
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
                onMouseOver={(e) => {
                  if (!plan.current) e.target.style.opacity = "0.9";
                }}
                onMouseOut={(e) => {
                  if (!plan.current) e.target.style.opacity = "1";
                }}
              >
                {plan.current ? "✅ Current Plan" : upgradeLoading ? "🔄 Processing..." : `🚀 Upgrade to ${plan.name}`}
              </button>
            </div>
          ))}
        </div>

        {/* Features Comparison */}
        <div style={{ background: "white", padding: "2rem", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", marginTop: "3rem" }}>
          <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", textAlign: "center", marginBottom: "2rem" }}>
            🎯 Why Upgrade to Pro?
          </h3>
          <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
            <div style={{ textAlign: "center", padding: "1rem" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🤖</div>
              <h4 style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>AI-Powered Insights</h4>
              <p style={{ color: "#64748b", fontSize: "0.875rem" }}>Get personalized recommendations and strategic advice</p>
            </div>
            <div style={{ textAlign: "center", padding: "1rem" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📊</div>
              <h4 style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>Unlimited Analysis</h4>
              <p style={{ color: "#64748b", fontSize: "0.875rem" }}>Analyze your LinkedIn data as often as you want</p>
            </div>
            <div style={{ textAlign: "center", padding: "1rem" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📈</div>
              <h4 style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>Historical Tracking</h4>
              <p style={{ color: "#64748b", fontSize: "0.875rem" }}>Track your network growth and engagement over time</p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div style={{ textAlign: "center", marginTop: "3rem", padding: "2rem", background: "white", borderRadius: "8px" }}>
          <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1rem" }}>Questions? We're here to help!</h3>
          <p style={{ color: "#64748b", marginBottom: "1rem" }}>
            Need a custom solution or have questions about our plans?
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button style={{ padding: "0.75rem 2rem", background: "#10b981", color: "white", border: "none", borderRadius: "6px", fontWeight: "bold" }}>
              💬 Contact Sales
            </button>
            <button style={{ padding: "0.75rem 2rem", background: "#f8fafc", color: "#64748b", border: "1px solid #e5e7eb", borderRadius: "6px", fontWeight: "bold" }}>
              📚 View Documentation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
