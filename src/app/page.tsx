"use client";

import { useState } from "react";

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
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

      {/* Cost of Loss Section */}
      <section style={{ padding: "4rem 2rem", background: "#f8fafc" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>💰</div>
            <h2 style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#1e293b", marginBottom: "1rem" }}>
              The True Cost of Losing Your LinkedIn
            </h2>
            <p style={{ fontSize: "1.2rem", color: "#64748b" }}>
              What professionals lose when their LinkedIn account disappears
            </p>
          </div>

          <div style={{ display: "grid", gap: "2rem", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
            <div style={{ background: "white", padding: "2rem", borderRadius: "8px", textAlign: "center", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📈</div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1rem", color: "#dc2626" }}>
                $50,000+ in Lost Opportunities
              </h3>
              <p style={{ color: "#64748b", marginBottom: "1rem" }}>
                Average salary increase from networking connections over 5 years
              </p>
              <div style={{ background: "#fef2f2", padding: "1rem", borderRadius: "6px", fontSize: "0.875rem", color: "#7f1d1d" }}>
                <strong>Real Impact:</strong> Lost job referrals, business partnerships, and career advancement opportunities
              </div>
            </div>

            <div style={{ background: "white", padding: "2rem", borderRadius: "8px", textAlign: "center", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⏱️</div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1rem", color: "#dc2626" }}>
                500+ Hours to Rebuild
              </h3>
              <p style={{ color: "#64748b", marginBottom: "1rem" }}>
                Time needed to manually reconnect with your professional network
              </p>
              <div style={{ background: "#fef2f2", padding: "1rem", borderRadius: "6px", fontSize: "0.875rem", color: "#7f1d1d" }}>
                <strong>Reality Check:</strong> Most people never fully recover their original network size
              </div>
            </div>

            <div style={{ background: "white", padding: "2rem", borderRadius: "8px", textAlign: "center", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1rem", color: "#dc2626" }}>
                Years of Relationship History
              </h3>
              <p style={{ color: "#64748b", marginBottom: "1rem" }}>
                Professional conversations, project collaborations, and trust-building - gone forever
              </p>
              <div style={{ background: "#fef2f2", padding: "1rem", borderRadius: "6px", fontSize: "0.875rem", color: "#7f1d1d" }}>
                <strong>Irreplaceable:</strong> Context of how you know each connection and your shared history
              </div>
            </div>
          </div>

          {/* Additional Cost Breakdown */}
          <div style={{ background: "white", padding: "2rem", borderRadius: "8px", marginTop: "2rem", border: "2px solid #dc2626" }}>
            <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", textAlign: "center", marginBottom: "2rem", color: "#dc2626" }}>
              📊 By the Numbers: What You Lose
            </h3>
            <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
              <div style={{ textAlign: "center", padding: "1rem", border: "1px solid #fecaca", borderRadius: "6px" }}>
                <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#dc2626", marginBottom: "0.5rem" }}>5-15 years</div>
                <p style={{ color: "#64748b", fontSize: "0.875rem" }}>of networking effort lost instantly</p>
              </div>
              <div style={{ textAlign: "center", padding: "1rem", border: "1px solid #fecaca", borderRadius: "6px" }}>
                <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#dc2626", marginBottom: "0.5rem" }}>1,000s</div>
                <p style={{ color: "#64748b", fontSize: "0.875rem" }}>of professional contacts with no backup</p>
              </div>
              <div style={{ textAlign: "center", padding: "1rem", border: "1px solid #fecaca", borderRadius: "6px" }}>
                <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#dc2626", marginBottom: "0.5rem" }}>$0</div>
                <p style={{ color: "#64748b", fontSize: "0.875rem" }}>compensation from LinkedIn for your loss</p>
              </div>
              <div style={{ textAlign: "center", padding: "1rem", border: "1px solid #fecaca", borderRadius: "6px" }}>
                <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#dc2626", marginBottom: "0.5rem" }}>3-6 months</div>
                <p style={{ color: "#64748b", fontSize: "0.875rem" }}>to notice the career impact</p>
              </div>
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

      {/* Value Proposition */}
      <section style={{ padding: "4rem 2rem", background: "#f0f9ff" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "2rem" }}>
            🎯 Protection That Pays for Itself
          </h2>
          
          <div style={{ background: "white", padding: "2rem", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", maxWidth: "600px", margin: "0 auto" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>💡</div>
            <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem", color: "#1e293b" }}>
              Smart Investment Calculator
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "1rem", alignItems: "center", marginBottom: "2rem" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#dc2626" }}>$50,000+</div>
                <p style={{ fontSize: "0.875rem", color: "#64748b" }}>Potential career losses</p>
              </div>
              <div style={{ fontSize: "2rem" }}>vs</div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#10b981" }}>$19/month</div>
                <p style={{ fontSize: "0.875rem", color: "#64748b" }}>Complete protection</p>
              </div>
            </div>
            <div style={{ background: "#f0f9ff", padding: "1rem", borderRadius: "6px", border: "1px solid #0ea5e9" }}>
              <p style={{ margin: 0, fontSize: "0.875rem", color: "#0c4a6e" }}>
                <strong>ROI:</strong> If LinkStream prevents just one networking opportunity loss, it pays for itself 100x over.
              </p>
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
            Every day you wait is another day your professional network is at risk. Start protecting your career today.
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
