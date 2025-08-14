"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.name.endsWith(".zip")) {
      alert("Please upload a ZIP file containing your LinkedIn data export.");
      return;
    }

    setUploading(true);
    setUploadProgress("Uploading file...");

    try {
      // Upload to Firebase Storage
      const storagePath = `uploads/${user.uid}/${Date.now()}-${file.name}`;
      const storageRef = ref(storage, storagePath);
      
      setUploadProgress("Uploading to cloud storage...");
      await uploadBytes(storageRef, file);
      
      setUploadProgress("Processing file...");
      const downloadURL = await getDownloadURL(storageRef);
      
      // Here we will add file processing next
      setUploadProgress("Analysis complete!");
      
      // Redirect to results page (we will create this next)
      setTimeout(() => {
        router.push("/dashboard/results");
      }, 1000);
      
    } catch (error: any) {
      console.error("Upload error:", error);
      alert("Upload failed: " + error.message);
      setUploadProgress("");
    } finally {
      setUploading(false);
    }
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
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <div style={{ background: "white", borderBottom: "1px solid #e2e8f0", padding: "1rem 2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "1200px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1e293b" }}>LinkStream Dashboard</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ color: "#64748b", fontSize: "0.875rem" }}>Welcome, {user.email}</span>
            <button 
              onClick={handleLogout}
              style={{ padding: "0.5rem 1rem", background: "#ef4444", color: "white", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
      
      <div style={{ padding: "2rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: "bold", color: "#1e293b", marginBottom: "1rem" }}>Upload Your LinkedIn Data</h2>
          <p style={{ color: "#64748b", marginBottom: "2rem" }}>Upload your LinkedIn data export to analyze your network and activity.</p>
          
          <div style={{ background: "white", padding: "2rem", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", marginBottom: "2rem" }}>
            {uploading ? (
              <div style={{ textAlign: "center", padding: "3rem" }}>
                <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⏳</div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "0.5rem" }}>Processing Your Data</h3>
                <p style={{ color: "#64748b" }}>{uploadProgress}</p>
                <div style={{ background: "#e5e7eb", borderRadius: "4px", height: "8px", margin: "1rem auto", maxWidth: "300px" }}>
                  <div style={{ background: "#3b82f6", height: "100%", borderRadius: "4px", width: "70%", animation: "pulse 2s infinite" }}></div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", border: "2px dashed #d1d5db", borderRadius: "8px", padding: "3rem" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📁</div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "0.5rem" }}>Upload LinkedIn Data</h3>
                <p style={{ color: "#64748b", marginBottom: "1rem" }}>Select your LinkedIn data export ZIP file</p>
                <input 
                  type="file" 
                  accept=".zip"
                  style={{ display: "none" }}
                  id="file-upload"
                  onChange={handleFileUpload}
                />
                <label 
                  htmlFor="file-upload"
                  style={{ 
                    display: "inline-block",
                    padding: "0.75rem 1.5rem", 
                    background: "#3b82f6", 
                    color: "white", 
                    borderRadius: "4px", 
                    cursor: "pointer", 
                    fontWeight: "bold" 
                  }}
                >
                  Choose File
                </label>
              </div>
            )}
          </div>
          
          <div style={{ background: "white", padding: "2rem", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1rem" }}>How to Export Your LinkedIn Data</h3>
            <ol style={{ color: "#64748b", lineHeight: "1.6", paddingLeft: "1.5rem" }}>
              <li>Go to LinkedIn Settings & Privacy</li>
              <li>Click on Data Privacy in the left sidebar</li>
              <li>Select Get a copy of your data</li>
              <li>Choose the data types you want</li>
              <li>Click Request archive and wait for the email</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
