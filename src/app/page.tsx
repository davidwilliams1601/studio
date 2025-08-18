"use client";

import { useState } from "react";

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    // In production, you'd save the email to your database/mailing list
    console.log("Email submitted:", email);
    setTimeout(() => {
      window.location.href = "/signup";
    }, 2000);
  };

  return (
    <div style={{ background: "#ffffff" }}>
      {/* Header */}
      <header style={{ background: "white", borderBottom: "1px solid #e5e7eb", padding: "1rem 2rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1e293b", margin: 0 }}>
              🛡️ LinkStream
            </h1>
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <a href="/login" style={{ color: "#64748b", textDecoration: "none", fontWeight: "500" }}>
              Sign In
            </a>
            <a 
              href="/signup" 
              style={{ 
                background: "#3b82f6", 
                color: "white", 
                padding: "0.5rem 1rem", 
                borderRadius: "6px", 
                textDecoration: "none", 
                fontWeight: "bold" 
              }}
            >
              Get Protected
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", padding: "4rem 2rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: "5rem", marginBottom: "1rem" }}>🚨</div>
          <h1 style={{ fontSize: "3rem", fontWeight: "bold", marginBottom: "1rem", lineHeight: "1.2" }}>
            Your LinkedIn Could Be Gone Tomorrow
          </h1>
          <p style={{ fontSize: "1.25rem", marginBottom: "2rem", opacity: "0.9", maxWidth: "600px", margin: "0 auto 2rem" }}>
            <strong>700M+ LinkedIn accounts compromised.</strong> Don't lose years of networking to hackers, platform changes, or account issues. Backup your professional network before it's too late.
          </p>
          
          {/* Email Capture */}
          <div style={{ background: "rgba(255,255,255,0.1)", padding: "2rem", borderRadius: "12px", maxWidth: "500px", margin: "0 auto", marginTop: "2rem" }}>
            {!isSubmitted ? (
              <form onSubmit={handleEmailSubmit}>
                <h3 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>🛡️ Secure Your LinkedIn Data Now</h3>
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    style={{
                      flex: 1,
                      padding: "0.75rem",
                      borderRadius: "6px",
                      border: "none",
                      fontSize: "1rem"
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      background: "#dc2626",
                      color: "white",
                      padding: "0.75rem 1.5rem",
                      border: "none",
                      borderRadius: "6px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      fontSize: "1rem"
                    }}
                  >
                    Protect Now
                  </button>
                </div>
                <p style={{ fontSize: "0.875rem", opacity: "0.8" }}>Free backup • No credit card required • 2-minute setup</p>
              </form>
            ) : (
              <div>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
                <h3>Welcome to LinkStream!</h3>
                <p>Redirecting you to secure your LinkedIn data...</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section style={{ padding: "4rem 2rem", background: "#fef2f2" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#dc2626", marginBottom: "1rem" }}>
              The LinkedIn Security Crisis
            </h2>
            <p style={{ fontSize: "1.2rem", color: "#7f1d1d" }}>
              Your professional network is under constant threat
            </p>
          </div>

          <div style={{ display: "grid", gap: "2rem", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
            <div style={{ background: "white", padding: "2rem", borderRadius: "8px", textAlign: "center", border: "1px solid #fecaca" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎯</div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1rem", color: "#dc2626" }}>
                700M+ Accounts Breached
              </h3>
              <p style={{ color: "#64748b" }}>
                LinkedIn has suffered multiple massive data breaches, exposing millions of professional profiles to hackers.
              </p>
            </div>

            <div style={{ background: "white", padding: "2rem", borderRadius: "8px", textAlign: "center", border: "1px solid #fecaca" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⏰</div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1rem", color: "#dc2626" }}>
                24-Hour Account Loss
              </h3>
              <p style={{ color: "#64748b" }}>
                Most users discover their LinkedIn account is compromised within 24 hours - often too late to recover.
              </p>
            </div>

            <div style={{ background: "white", padding: "2rem", borderRadius: "8px", textAlign: "center", border: "1px solid #fecaca" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>💸</div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1rem", color: "#dc2626" }}>
                Zero Recovery Guarantee
              </h3>
              <p style={{ color: "#64748b" }}>
                LinkedIn offers no guarantee to recover lost data, connections, or messages when accounts are compromised.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section style={{ padding: "4rem 2rem", background: "white" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🛡️</div>
            <h2 style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#1e293b", marginBottom: "1rem" }}>
              Complete LinkedIn Protection
            </h2>
            <p style={{ fontSize: "1.2rem", color: "#64748b" }}>
              LinkStream automatically backs up and analyzes your entire LinkedIn presence
            </p>
          </div>

          <div style={{ display: "grid", gap: "2rem", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
            <div style={{ background: "#f8fafc", padding: "2rem", borderRadius: "8px", textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📥</div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1rem" }}>
                Automatic Backup
              </h3>
              <p style={{ color: "#64748b" }}>
                Securely backup all your connections, messages, posts, and profile data before disaster strikes.
              </p>
            </div>

            <div style={{ background: "#f8fafc", padding: "2rem", borderRadius: "8px", textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🤖</div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1rem" }}>
                AI-Powered Insights
              </h3>
              <p style={{ color: "#64748b" }}>
                Get intelligent analysis of your network, growth opportunities, and professional strategy.
              </p>
            </div>

            <div style={{ background: "#f8fafc", padding: "2rem", borderRadius: "8px", textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🚨</div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1rem" }}>
                Emergency Recovery
              </h3>
              <p style={{ color: "#64748b" }}>
                When disaster strikes, instantly access all your professional connections and data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section style={{ padding: "4rem 2rem", background: "#f8fafc" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "2rem" }}>
            Join Thousands of Protected Professionals
          </h2>
          
          <div style={{ display: "grid", gap: "2rem", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", marginBottom: "3rem" }}>
            <div style={{ background: "white", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
              <div style={{ display: "flex", marginBottom: "1rem" }}>
                {[1,2,3,4,5].map(i => (
                  <span key={i} style={{ color: "#fbbf24", fontSize: "1.2rem" }}>⭐</span>
                ))}
              </div>
              <p style={{ fontStyle: "italic", marginBottom: "1rem" }}>
                "LinkStream saved my career. I lost my LinkedIn account with 8,000+ connections, but had everything backed up. Priceless peace of mind."
              </p>
              <cite style={{ fontWeight: "bold" }}>— Sarah Chen, Marketing Director</cite>
            </div>

            <div style={{ background: "white", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
              <div style={{ display: "flex", marginBottom: "1rem" }}>
                {[1,2,3,4,5].map(i => (
                  <span key={i} style={{ color: "#fbbf24", fontSize: "1.2rem" }}>⭐</span>
                ))}
              </div>
              <p style={{ fontStyle: "italic", marginBottom: "1rem" }}>
                "The AI insights helped me optimize my network strategy. But knowing my data is safe is worth every penny."
              </p>
              <cite style={{ fontWeight: "bold" }}>— Michael Rodriguez, Sales Executive</cite>
            </div>

            <div style={{ background: "white", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
              <div style={{ display: "flex", marginBottom: "1rem" }}>
                {[1,2,3,4,5].map(i => (
                  <span key={i} style={{ color: "#fbbf24", fontSize: "1.2rem" }}>⭐</span>
                ))}
              </div>
              <p style={{ fontStyle: "italic", marginBottom: "1rem" }}>
                "Essential for any professional. I sleep better knowing my 15-year networking history is protected."
              </p>
              <cite style={{ fontWeight: "bold" }}>— Jennifer Park, Technology Consultant</cite>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gap: "2rem", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", marginTop: "2rem" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#3b82f6", marginBottom: "0.5rem" }}>10,000+</div>
              <p style={{ color: "#64748b" }}>Professionals Protected</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#3b82f6", marginBottom: "0.5rem" }}>50M+</div>
              <p style={{ color: "#64748b" }}>Connections Backed Up</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#3b82f6", marginBottom: "0.5rem" }}>99.9%</div>
              <p style={{ color: "#64748b" }}>Uptime Guarantee</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#3b82f6", marginBottom: "0.5rem" }}>2 min</div>
              <p style={{ color: "#64748b" }}>Setup Time</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: "4rem 2rem", background: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)", color: "white" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>⏰</div>
          <h2 style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "1rem" }}>
            Don't Wait Until It's Too Late
          </h2>
          <p style={{ fontSize: "1.2rem", marginBottom: "2rem", opacity: "0.9" }}>
            Every day you wait is another day your professional network is at risk. Join 10,000+ protected professionals today.
          </p>
          
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <a 
              href="/signup"
              style={{ 
                background: "white", 
                color: "#dc2626", 
                padding: "1rem 2rem", 
                borderRadius: "8px", 
                textDecoration: "none", 
                fontWeight: "bold",
                fontSize: "1.1rem"
              }}
            >
              🛡️ Start Free Backup
            </a>
            <a 
              href="/dashboard/subscription"
              style={{ 
                background: "rgba(255,255,255,0.1)", 
                color: "white", 
                padding: "1rem 2rem", 
                borderRadius: "8px", 
                textDecoration: "none", 
                fontWeight: "bold",
                border: "1px solid rgba(255,255,255,0.3)"
              }}
            >
              View Pricing
            </a>
          </div>
          
          <p style={{ fontSize: "0.875rem", marginTop: "1rem", opacity: "0.7" }}>
            No credit card required • Free backup included • 30-day money-back guarantee
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: "#1e293b", color: "white", padding: "2rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
              🛡️ LinkStream
            </h3>
            <p style={{ opacity: "0.8" }}>Protecting professional networks worldwide</p>
          </div>
          <div style={{ display: "flex", gap: "2rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "1rem" }}>
            <a href="/privacy" style={{ color: "#94a3b8", textDecoration: "none" }}>Privacy Policy</a>
            <a href="/terms" style={{ color: "#94a3b8", textDecoration: "none" }}>Terms of Service</a>
            <a href="/contact" style={{ color: "#94a3b8", textDecoration: "none" }}>Contact</a>
            <a href="/help" style={{ color: "#94a3b8", textDecoration: "none" }}>Help Center</a>
          </div>
          <p style={{ opacity: "0.6", fontSize: "0.875rem" }}>
            © 2024 LinkStream. All rights reserved. | Secure your professional future.
          </p>
        </div>
      </footer>
    </div>
  );
}
