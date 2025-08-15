"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("File selected:", file.name);
    setUploading(true);
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create mock results and store them
    const mockResults = {
      fileName: file.name,
      processedAt: new Date().toISOString(),
      stats: {
        connections: Math.floor(Math.random() * 2000) + 500,
        messages: Math.floor(Math.random() * 200) + 50,
        posts: Math.floor(Math.random() * 100) + 10,
      }
    };
    
    console.log("Storing results:", mockResults);
    sessionStorage.setItem("analysisResults", JSON.stringify(mockResults));
    
    // Verify it was stored
    const stored = sessionStorage.getItem("analysisResults");
    console.log("Stored data:", stored);
    
    setUploading(false);
    router.push("/dashboard/results");
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "2rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem" }}>
          <h1>LinkStream Dashboard</h1>
          <button onClick={handleLogout} style={{ background: "#ef4444", color: "white", padding: "0.5rem 1rem", border: "none", borderRadius: "4px" }}>
            Sign Out
          </button>
        </div>
        
        <div style={{ background: "white", padding: "2rem", borderRadius: "8px", marginBottom: "2rem" }}>
          <h2>Upload LinkedIn Data</h2>
          {uploading ? (
            <p>Processing your file...</p>
          ) : (
            <>
              <input type="file" accept=".zip" onChange={handleFileUpload} />
              <p style={{ fontSize: "0.875rem", color: "#64748b", marginTop: "1rem" }}>
                Upload your LinkedIn data export ZIP file for analysis
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
