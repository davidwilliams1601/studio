"use client";

import { useState } from "react";

export default function Subscription() {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: 'price_1RrErpIpQXRH010BG7mAhEqD' }),
      });

      const data = await response.json();
      
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      alert('Failed to start checkout: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Subscription Plans</h1>
      <div style={{ background: "white", padding: "2rem", borderRadius: "8px", marginBottom: "2rem" }}>
        <h2>Pro Plan - $19/month</h2>
        <p>Unlimited LinkedIn backups and AI insights</p>
        <button 
          onClick={handleUpgrade}
          disabled={loading}
          style={{ 
            padding: "1rem 2rem", 
            background: loading ? "#9ca3af" : "#3b82f6", 
            color: "white", 
            border: "none", 
            borderRadius: "6px", 
            cursor: loading ? "not-allowed" : "pointer" 
          }}
        >
          {loading ? "🔄 Loading..." : "🛡️ Secure with Pro"}
        </button>
      </div>
    </div>
  );
}
