"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
      <div style={{ background: "white", padding: "2rem", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", width: "400px" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "#1e293b", marginBottom: "0.5rem" }}>Welcome Back</h1>
          <p style={{ color: "#64748b" }}>Sign in to your LinkStream account</p>
        </div>
        
        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "0.75rem", borderRadius: "4px", marginBottom: "1rem", fontSize: "0.875rem" }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <input 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "4px", width: "100%", boxSizing: "border-box" }} 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "4px", width: "100%", boxSizing: "border-box" }} 
          />
          <button 
            type="submit"
            disabled={loading}
            style={{ 
              padding: "0.75rem", 
              background: loading ? "#9ca3af" : "#3b82f6", 
              color: "white", 
              border: "none", 
              borderRadius: "4px", 
              cursor: loading ? "not-allowed" : "pointer", 
              fontWeight: "bold" 
            }}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
          <p style={{ textAlign: "center", fontSize: "0.875rem", color: "#64748b" }}>
            Don&apos;t have an account? <a href="/signup" style={{ color: "#3b82f6", textDecoration: "none" }}>Sign up</a>
          </p>
        </form>
      </div>
    </div>
  );
}
