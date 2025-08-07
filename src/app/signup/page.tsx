export default function Signup() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
      <div style={{ background: "white", padding: "2rem", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", width: "400px" }}>
        <h1 style={{ textAlign: "center", marginBottom: "2rem" }}>Create Account</h1>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <input type="text" placeholder="Full Name" style={{ padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "4px" }} />
          <input type="email" placeholder="Email" style={{ padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "4px" }} />
          <input type="password" placeholder="Password" style={{ padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "4px" }} />
          <button style={{ padding: "0.75rem", background: "#10b981", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Create Account</button>
          <p style={{ textAlign: "center", fontSize: "0.875rem", color: "#64748b" }}>Already have an account? <a href="/login" style={{ color: "#3b82f6" }}>Sign in</a></p>
        </div>
      </div>
    </div>
  )
}
