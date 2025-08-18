"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [verifying, setVerifying] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);

  useEffect(() => {
    if (sessionId) {
      verifyPayment(sessionId);
    } else {
      setVerifying(false);
      setPaymentStatus({ success: false, error: 'No session ID found' });
    }
  }, [sessionId]);

  const verifyPayment = async (sessionId) => {
    try {
      const response = await fetch(`/api/subscription/verify?session_id=${sessionId}`);
      const data = await response.json();
      setPaymentStatus(data);
    } catch (error) {
      console.error('Error verifying payment:', error);
      setPaymentStatus({ success: false, error: 'Verification failed' });
    } finally {
      setVerifying(false);
    }
  };

  if (verifying) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        <div style={{ textAlign: "center", background: "white", padding: "3rem", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔄</div>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Verifying Your Payment...</h2>
          <p style={{ color: "#64748b" }}>Please wait while we confirm your subscription.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
      <div style={{ textAlign: "center", background: "white", padding: "3rem", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", maxWidth: "500px" }}>
        {paymentStatus?.success ? (
          <>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🎉</div>
            <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "#10b981", marginBottom: "1rem" }}>
              Welcome to LinkStream Pro!
            </h1>
            <p style={{ color: "#64748b", marginBottom: "2rem", lineHeight: "1.6" }}>
              Your payment was successful! Your LinkedIn data is now fully protected with unlimited backups and AI insights.
            </p>
            
            <div style={{ background: "#f0fdf4", border: "1px solid #10b981", padding: "1rem", borderRadius: "8px", marginBottom: "2rem" }}>
              <h3 style={{ fontSize: "1.125rem", fontWeight: "bold", color: "#15803d", marginBottom: "0.5rem" }}>
                🛡️ You're Now Protected With:
              </h3>
              <ul style={{ textAlign: "left", color: "#166534", fontSize: "0.875rem", margin: 0, paddingLeft: "1rem" }}>
                <li>Unlimited LinkedIn backups</li>
                <li>AI-powered professional insights</li>
                <li>Advanced analytics and reporting</li>
                <li>Priority customer support</li>
                <li>Professional PDF reports</li>
              </ul>
            </div>

            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <a 
                href="/dashboard"
                style={{ 
                  background: "#10b981", 
                  color: "white", 
                  padding: "0.75rem 1.5rem", 
                  borderRadius: "6px", 
                  textDecoration: "none", 
                  fontWeight: "bold" 
                }}
              >
                🚀 Start Using Pro Features
              </a>
              <a 
                href="/dashboard/subscription"
                style={{ 
                  background: "#f8fafc", 
                  color: "#64748b", 
                  padding: "0.75rem 1.5rem", 
                  borderRadius: "6px", 
                  textDecoration: "none", 
                  fontWeight: "bold",
                  border: "1px solid #e5e7eb"
                }}
              >
                View Subscription
              </a>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>❌</div>
            <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "#dc2626", marginBottom: "1rem" }}>
              Payment Verification Failed
            </h1>
            <p style={{ color: "#64748b", marginBottom: "2rem" }}>
              {paymentStatus?.error || "There was an issue verifying your payment."}
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <a 
                href="/dashboard/subscription"
                style={{ 
                  background: "#dc2626", 
                  color: "white", 
                  padding: "0.75rem 1.5rem", 
                  borderRadius: "6px", 
                  textDecoration: "none", 
                  fontWeight: "bold" 
                }}
              >
                Try Again
              </a>
              <a 
                href="/dashboard"
                style={{ 
                  background: "#f8fafc", 
                  color: "#64748b", 
                  padding: "0.75rem 1.5rem", 
                  borderRadius: "6px", 
                  textDecoration: "none", 
                  fontWeight: "bold",
                  border: "1px solid #e5e7eb"
                }}
              >
                Back to Dashboard
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
