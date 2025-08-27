"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { AnalysisStorageService, AnalysisData } from '@/lib/analysis-storage';

export default function Results() {
  const [results, setResults] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    const loadResults = async () => {
      try {
        console.log("Loading analysis from database for user:", user.uid);
        const latestAnalysis = await AnalysisStorageService.getLatestAnalysis(user.uid);
        
        if (latestAnalysis) {
          console.log("Loaded analysis:", latestAnalysis);
          setResults(latestAnalysis);
        } else {
          console.log("No analysis found for user");
          setResults(null);
        }
      } catch (error) {
        console.error("Error loading analysis:", error);
        setResults(null);
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div>Loading results...</div>
      </div>
    );
  }

  if (!results) {
    return (
      <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "2rem" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
          <h1>No Results Found</h1>
          <p>No analysis data available. Please upload a file first.</p>
          <a href="/dashboard" style={{ color: "#3b82f6", textDecoration: "none" }}>← Back to Dashboard</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "2rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ marginBottom: "2rem" }}>
          <a href="/dashboard" style={{ color: "#3b82f6", textDecoration: "none" }}>← Back to Dashboard</a>
        </div>
        
        <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "#1e293b", marginBottom: "1rem" }}>Analysis Results</h1>
        <p style={{ color: "#64748b", marginBottom: "2rem" }}>
          File: {results.fileName} • Processed: {new Date(results.processedAt).toLocaleDateString()}
        </p>
        
        <div style={{ display: "grid", gap: "2rem", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", marginBottom: "2rem" }}>
          <div style={{ background: "white", padding: "2rem", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1rem" }}>📊 Network Overview</h3>
            <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#3b82f6", marginBottom: "0.5rem" }}>
              {results.stats.connections.toLocaleString()}
            </div>
            <p style={{ color: "#64748b" }}>Total Connections</p>
          </div>
          
          <div style={{ background: "white", padding: "2rem", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1rem" }}>💬 Messages</h3>
            <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#10b981", marginBottom: "0.5rem" }}>
              {results.stats.messages.toLocaleString()}
            </div>
            <p style={{ color: "#64748b" }}>Conversations</p>
          </div>
          
          <div style={{ background: "white", padding: "2rem", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1rem" }}>📝 Content</h3>
            <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#f59e0b", marginBottom: "0.5rem" }}>
              {results.stats.posts.toLocaleString()}
            </div>
            <p style={{ color: "#64748b" }}>Posts & Articles</p>
          </div>
        </div>
        
        <div style={{ background: "white", padding: "2rem", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", marginBottom: "2rem" }}>
          <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1rem" }}>🎯 Key Insights</h3>
          <ul style={{ lineHeight: "1.6", color: "#64748b" }}>
            {results.insights.map((insight, index) => (
              <li key={index}>{insight}</li>
            ))}
          </ul>
        </div>
        
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <button 
            onClick={() => window.print()}
            style={{ 
              padding: "1rem 2rem", 
              background: "#3b82f6", 
              color: "white", 
              border: "none", 
              borderRadius: "8px", 
              fontWeight: "bold", 
              cursor: "pointer" 
            }}
          >
            Print Report
          </button>
          <button 
            onClick={() => {
              const dataStr = JSON.stringify(results, null, 2);
              const dataBlob = new Blob([dataStr], {type: 'application/json'});
              const url = URL.createObjectURL(dataBlob);
              const link = document.createElement('a');
              link.href = url;
              link.download = 'linkedin-analysis.json';
              link.click();
            }}
            style={{ 
              padding: "1rem 2rem", 
              background: "#10b981", 
              color: "white", 
              border: "none", 
              borderRadius: "8px", 
              fontWeight: "bold", 
              cursor: "pointer" 
            }}
          >
            Download Data
          </button>
        </div>
      </div>
    </div>
  );
}
