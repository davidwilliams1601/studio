export default function Login() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
      <div style={{ background: "white", padding: "2rem", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", width: "400px" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "#1e293b", marginBottom: "0.5rem" }}>Welcome Back</h1>
          <p style={{ color: "#64748b" }}>Sign in to your LinkStream account</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <input type="email" placeholder="Email" style={{ padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "4px", width: "100%", boxSizing: "border-box" }} />
          <input type="password" placeholder="Password" style={{ padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "4px", width: "100%", boxSizing: "border-box" }} />
          <button style={{ padding: "0.75rem", background: "#3b82f6", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>Sign In</button>
          <p style={{ textAlign: "center", fontSize: "0.875rem", color: "#64748b" }}>Don&apos;t have an account? <a href="/signup" style={{ color: "#3b82f6", textDecoration: "none" }}>Sign up</a></p>
        </div>
      </div>
    </div>
  )
}
