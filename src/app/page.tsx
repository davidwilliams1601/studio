export default function Home() {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>🛡️ LinkStream</h1>
      <p>Protect your LinkedIn data</p>
      <div style={{ marginTop: "2rem" }}>
        <a href="/dashboard" style={{ padding: "1rem 2rem", background: "#3b82f6", color: "white", textDecoration: "none", borderRadius: "6px", marginRight: "1rem" }}>
          Dashboard
        </a>
        <a href="/test-stripe" style={{ padding: "1rem 2rem", background: "#10b981", color: "white", textDecoration: "none", borderRadius: "6px" }}>
          Test Stripe
        </a>
      </div>
    </div>
  );
}
