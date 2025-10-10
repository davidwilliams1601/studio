export const dynamic = "force-dynamic";
"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function SuccessContent() {
  const searchParams = useSearchParams();
  const session_id = searchParams.get('session_id');

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      background: "#f0fdf4" 
    }}>
      <div style={{ 
        background: "white", 
        padding: "2rem", 
        borderRadius: "12px", 
        textAlign: "center",
        maxWidth: "500px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
      }}>
        <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🎉</div>
        <h1 style={{ 
          fontSize: "2rem", 
          fontWeight: "bold", 
          color: "#15803d", 
          marginBottom: "1rem" 
        }}>
          Welcome to LinkStream Pro!
        </h1>
        <p style={{ 
          color: "#374151", 
          marginBottom: "2rem",
          lineHeight: "1.6"
        }}>
          Your subscription has been activated successfully. You now have unlimited LinkedIn backups and AI-powered insights.
        </p>
        {session_id && (
          <p style={{ 
            fontSize: "0.875rem", 
            color: "#6b7280", 
            marginBottom: "2rem" 
          }}>
            Session ID: {session_id}
          </p>
        )}
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
          🛡️ Go to Dashboard
        </a>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div style={{ 
        minHeight: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center" 
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🔄</div>
          <h3>Loading...</h3>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
