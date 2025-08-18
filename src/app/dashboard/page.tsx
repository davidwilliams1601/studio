"use client";

import { useState } from "react";

export default function Dashboard() {
  const user = { email: 'test@example.com' }; // Mock user for testing

  const handleLogout = () => {
    alert('Logout clicked');
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>🛡️ LinkStream Dashboard</h1>
      <p>Welcome, {user.email}</p>
      <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
        <a 
          href="/dashboard/subscription" 
          style={{ 
            padding: "1rem 2rem", 
            background: "#3b82f6", 
            color: "white", 
            textDecoration: "none", 
            borderRadius: "6px",
            fontWeight: "bold"
          }}
        >
          💳 View Subscription Plans
        </a>
        <a 
          href="/test-stripe" 
          style={{ 
            padding: "1rem 2rem", 
            background: "#10b981", 
            color: "white", 
            textDecoration: "none", 
            borderRadius: "6px",
            fontWeight: "bold"
          }}
        >
          🧪 Test Stripe Integration
        </a>
        <button 
          onClick={handleLogout} 
          style={{ 
            padding: "1rem 2rem", 
            background: "#ef4444", 
            color: "white", 
            border: "none", 
            borderRadius: "6px",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
}
