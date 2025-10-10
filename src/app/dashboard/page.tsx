"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { validateLinkedInFile, formatFileSize } from "@/lib/file-upload";

export default function Dashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateLinkedInFile(file);
    if (!validation.valid) {
      setError(validation.error || "Invalid file");
      setSelectedFile(null);
      return;
    }

    setError("");
    setSelectedFile(file);
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !user) return;

    setUploading(true);
    setError("");
    setUploadProgress(0);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('userId', user.uid);

      // Send to analyze API
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      // Store results and redirect to results page
      sessionStorage.setItem('analysisResults', JSON.stringify(data.data));
      router.push('/dashboard/results');

    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🔄</div>
          <h3>Loading...</h3>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "2rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>🛡️ LinkStream Dashboard</h1>
        <p style={{ fontSize: "1.125rem", color: "#64748b", marginBottom: "2rem" }}>
          Welcome, {user.email}!
        </p>

        <div style={{
          background: "white",
          padding: "2rem",
          borderRadius: "12px",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)"
        }}>
          <h2 style={{ marginBottom: "1rem" }}>Upload Your LinkedIn Data</h2>
          <p style={{ color: "#64748b", marginBottom: "2rem" }}>
            Upload your LinkedIn data export to analyze your network and create a secure backup.
          </p>

          {error && (
            <div style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#dc2626",
              padding: "0.75rem",
              borderRadius: "6px",
              marginBottom: "1rem",
              fontSize: "0.875rem"
            }}>
              {error}
            </div>
          )}

          {uploading ? (
            <div style={{ padding: "2rem" }}>
              <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⚙️</div>
              <h3>Analyzing Your LinkedIn Data...</h3>
              <p style={{ color: "#64748b", marginTop: "0.5rem" }}>
                This may take a few moments depending on your network size.
              </p>
              <div style={{
                width: "100%",
                height: "8px",
                background: "#e5e7eb",
                borderRadius: "4px",
                marginTop: "1rem",
                overflow: "hidden"
              }}>
                <div style={{
                  width: "50%",
                  height: "100%",
                  background: "#10b981",
                  animation: "pulse 1.5s ease-in-out infinite"
                }} />
              </div>
            </div>
          ) : (
            <>
              <input
                type="file"
                accept=".zip"
                onChange={handleFileChange}
                disabled={uploading}
                style={{
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  marginBottom: "1rem",
                  width: "100%",
                  cursor: uploading ? "not-allowed" : "pointer"
                }}
              />

              {selectedFile && (
                <div style={{
                  background: "#f0fdf4",
                  border: "1px solid #86efac",
                  padding: "0.75rem",
                  borderRadius: "6px",
                  marginBottom: "1rem",
                  fontSize: "0.875rem"
                }}>
                  ✓ {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={!selectedFile || uploading}
                style={{
                  background: selectedFile ? "#10b981" : "#9ca3af",
                  color: "white",
                  padding: "0.75rem 1.5rem",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  cursor: selectedFile ? "pointer" : "not-allowed",
                  opacity: selectedFile ? 1 : 0.6
                }}
              >
                🛡️ Analyze & Protect
              </button>
            </>
          )}
        </div>
        
        <div style={{ marginTop: "2rem" }}>
          <a 
            href="/"
            style={{ 
              color: "#3b82f6", 
              textDecoration: "none"
            }}
          >
            ← Back to home
          </a>
        </div>
      </div>
    </div>
  );
}
