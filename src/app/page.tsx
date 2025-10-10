export default function Home() {
  return (
    <div style={{ background: "#ffffff", minHeight: "100vh" }}>
      {/* Header */}
      <header style={{ 
        background: "white", 
        borderBottom: "1px solid #e5e7eb", 
        padding: "1rem",
        position: "sticky",
        top: 0,
        zIndex: 50
      }}>
        <div style={{ 
          maxWidth: "1200px", 
          margin: "0 auto", 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center"
        }}>
          <h1 style={{ 
            fontSize: "1.25rem", 
            fontWeight: "bold", 
            color: "#1e293b", 
            margin: 0
          }}>
            🛡️ LinkStream
          </h1>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <a 
              href="/login" 
              style={{ 
                color: "#64748b", 
                textDecoration: "none", 
                fontWeight: "500",
                fontSize: "0.875rem",
                padding: "0.5rem"
              }}
            >
              Sign In
            </a>
            <a 
              href="/login" 
              style={{ 
                background: "#3b82f6", 
                color: "white", 
                padding: "0.75rem 1rem", 
                borderRadius: "8px", 
                textDecoration: "none", 
                fontWeight: "bold",
                fontSize: "0.875rem",
                whiteSpace: "nowrap"
              }}
            >
              Get Started
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ 
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
        color: "white", 
        padding: "4rem 1rem",
        textAlign: "center"
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🚨</div>
          <h1 style={{ 
            fontSize: "3rem", 
            fontWeight: "bold", 
            marginBottom: "1rem", 
            lineHeight: "1.2"
          }}>
            Your LinkedIn Could Be Gone Tomorrow
          </h1>
          <p style={{ 
            fontSize: "1.25rem", 
            marginBottom: "2rem", 
            opacity: "0.9", 
            lineHeight: "1.6"
          }}>
            <strong>700M+ LinkedIn accounts compromised.</strong> Don't lose years of networking to hackers or platform changes.
          </p>
          
          <a 
            href="/login"
            style={{ 
              background: "#dc2626", 
              color: "white", 
              padding: "1.25rem 2.5rem", 
              borderRadius: "12px", 
              textDecoration: "none", 
              fontWeight: "bold",
              fontSize: "1.25rem",
              display: "inline-block",
              boxShadow: "0 4px 14px 0 rgba(220, 38, 38, 0.39)"
            }}
          >
            🛡️ Start Free Protection
          </a>
          <p style={{ 
            fontSize: "1rem", 
            marginTop: "1rem", 
            opacity: "0.8"
          }}>
            Free • No credit card • 2-minute setup
          </p>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "4rem 1rem", background: "white" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ 
            fontSize: "2.5rem", 
            fontWeight: "bold", 
            marginBottom: "3rem"
          }}>
            Complete LinkedIn Protection
          </h2>
          
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
            gap: "2rem"
          }}>
            <div style={{ padding: "2rem", textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📥</div>
              <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Automatic Backup</h3>
              <p style={{ color: "#64748b", lineHeight: "1.6" }}>
                Securely backup all your connections, messages, posts, and profile data before disaster strikes.
              </p>
            </div>

            <div style={{ padding: "2rem", textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🤖</div>
              <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>AI-Powered Insights</h3>
              <p style={{ color: "#64748b", lineHeight: "1.6" }}>
                Get intelligent analysis of your network, growth opportunities, and professional strategy.
              </p>
            </div>

            <div style={{ padding: "2rem", textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🚨</div>
              <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Emergency Recovery</h3>
              <p style={{ color: "#64748b", lineHeight: "1.6" }}>
                When disaster strikes, instantly access all your professional connections and data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ 
        padding: "4rem 1rem", 
        background: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)", 
        color: "white", 
        textAlign: "center" 
      }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
            Don't Wait Until It's Too Late
          </h2>
          <p style={{ fontSize: "1.25rem", marginBottom: "2rem", opacity: "0.9" }}>
            Every day you wait is another day your professional network is at risk.
          </p>
          
          <a 
            href="/login"
            style={{ 
              background: "white", 
              color: "#dc2626", 
              padding: "1.25rem 2.5rem", 
              borderRadius: "12px", 
              textDecoration: "none", 
              fontWeight: "bold",
              fontSize: "1.25rem",
              display: "inline-block"
            }}
          >
            🛡️ Start Free Account
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ 
        background: "#1e293b", 
        color: "white", 
        padding: "2rem 1rem", 
        textAlign: "center" 
      }}>
        <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>🛡️ LinkStream</h3>
        <p style={{ opacity: "0.8" }}>Protecting professional networks worldwide</p>
        <p style={{ opacity: "0.6", fontSize: "0.875rem", marginTop: "1rem" }}>
          © 2024 LinkStream. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
