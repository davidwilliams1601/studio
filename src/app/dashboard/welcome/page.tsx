"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

export default function Welcome() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const markOnboardingComplete = async () => {
    if (!user) return;

    setMarking(true);
    try {
      // Mark onboarding as complete in Firestore
      const idToken = await user.getIdToken();
      await fetch('/api/users/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ completed: true }),
      });
    } catch (error) {
      console.error('Failed to mark onboarding complete:', error);
      // Continue anyway - don't block the user
    } finally {
      setMarking(false);
    }
  };

  const handleShowGuide = async () => {
    await markOnboardingComplete();
    router.push("/dashboard/guide");
  };

  const handleHaveData = async () => {
    await markOnboardingComplete();
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem"
    }}>
      <div style={{
        background: "white",
        borderRadius: "16px",
        padding: "3rem",
        maxWidth: "700px",
        width: "100%",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
      }}>
        {/* Welcome Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>👋</div>
          <h1 style={{
            fontSize: "2rem",
            fontWeight: "bold",
            color: "#1e293b",
            marginBottom: "0.5rem"
          }}>
            Welcome to LinkStream!
          </h1>
          <p style={{ fontSize: "1.125rem", color: "#64748b" }}>
            Let's get you set up in 3 easy steps
          </p>
        </div>

        {/* Steps */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{
            display: "flex",
            gap: "1.5rem",
            marginBottom: "1.5rem",
            alignItems: "start"
          }}>
            <div style={{
              background: "#3b82f6",
              color: "white",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: "1.25rem",
              flexShrink: 0
            }}>
              1
            </div>
            <div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.5rem", color: "#1e293b" }}>
                Export Your LinkedIn Data
              </h3>
              <p style={{ color: "#64748b", lineHeight: "1.6" }}>
                Request your data archive from LinkedIn. It takes about 10 minutes and LinkedIn will email it to you within 24 hours.
              </p>
            </div>
          </div>

          <div style={{
            display: "flex",
            gap: "1.5rem",
            marginBottom: "1.5rem",
            alignItems: "start"
          }}>
            <div style={{
              background: "#10b981",
              color: "white",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: "1.25rem",
              flexShrink: 0
            }}>
              2
            </div>
            <div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.5rem", color: "#1e293b" }}>
                Upload to LinkStream
              </h3>
              <p style={{ color: "#64748b", lineHeight: "1.6" }}>
                Once you receive the ZIP file from LinkedIn, upload it here. We'll analyze your network and create a secure backup.
              </p>
            </div>
          </div>

          <div style={{
            display: "flex",
            gap: "1.5rem",
            alignItems: "start"
          }}>
            <div style={{
              background: "#8b5cf6",
              color: "white",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: "1.25rem",
              flexShrink: 0
            }}>
              3
            </div>
            <div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.5rem", color: "#1e293b" }}>
                Get AI Insights & Backup
              </h3>
              <p style={{ color: "#64748b", lineHeight: "1.6" }}>
                View detailed analytics about your network, get AI-powered recommendations, and download your secure backup.
              </p>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div style={{
          background: "#f0f9ff",
          border: "1px solid #bfdbfe",
          borderRadius: "8px",
          padding: "1rem",
          marginBottom: "2rem"
        }}>
          <p style={{ color: "#1e40af", fontSize: "0.875rem", margin: 0 }}>
            <strong>⏱️ Time estimate:</strong> 10 minutes to request data, 24 hours to receive it from LinkedIn
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <button
            onClick={handleShowGuide}
            disabled={marking}
            style={{
              background: "#3b82f6",
              color: "white",
              padding: "1rem 2rem",
              borderRadius: "8px",
              border: "none",
              fontWeight: "bold",
              fontSize: "1rem",
              cursor: marking ? "not-allowed" : "pointer",
              opacity: marking ? 0.6 : 1
            }}
          >
            📖 Show Me How to Export My Data
          </button>

          <button
            onClick={handleHaveData}
            disabled={marking}
            style={{
              background: "white",
              color: "#3b82f6",
              padding: "1rem 2rem",
              borderRadius: "8px",
              border: "2px solid #3b82f6",
              fontWeight: "bold",
              fontSize: "1rem",
              cursor: marking ? "not-allowed" : "pointer",
              opacity: marking ? 0.6 : 1
            }}
          >
            ✅ I Already Have My LinkedIn Data
          </button>
        </div>

        {/* Skip Link */}
        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <button
            onClick={handleHaveData}
            disabled={marking}
            style={{
              background: "none",
              border: "none",
              color: "#64748b",
              textDecoration: "underline",
              cursor: marking ? "not-allowed" : "pointer",
              fontSize: "0.875rem"
            }}
          >
            Skip for now
          </button>
        </div>

        {/* Footer Links */}
        <div style={{
          display: "flex",
          gap: "1rem",
          justifyContent: "center",
          marginTop: "2rem",
          padding: "1rem",
          borderTop: "1px solid #e5e7eb"
        }}>
          <Link href="/privacy" style={{
            color: "#64748b",
            textDecoration: "none",
            fontSize: "0.75rem"
          }}>
            Privacy Policy
          </Link>
          <span style={{ color: "#e5e7eb" }}>•</span>
          <Link href="/terms" style={{
            color: "#64748b",
            textDecoration: "none",
            fontSize: "0.75rem"
          }}>
            Terms of Service
          </Link>
          <span style={{ color: "#e5e7eb" }}>•</span>
          <Link href="/contact" style={{
            color: "#64748b",
            textDecoration: "none",
            fontSize: "0.75rem"
          }}>
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
