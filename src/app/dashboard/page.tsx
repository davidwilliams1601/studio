"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AnalysisStorageService } from '@/lib/analysis-storage';

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

  const processLinkedInZip = async (file) => {
    setUploadProgress("Reading ZIP file...");
    
    const JSZip = (await import('jszip')).default;
    
    const zip = await JSZip.loadAsync(file);
    const results = {
      fileName: file.name,
      processedAt: new Date().toISOString(),
      stats: {
        connections: 0,
        messages: 0,
        posts: 0,
        companies: 0
      },
      insights: [],
      rawData: {}
    };

    setUploadProgress("Analyzing connections...");
    
    const connectionsFile = Object.keys(zip.files).find(name => 
      name.toLowerCase().includes('connections') && name.endsWith('.csv')
    );
    
    if (connectionsFile) {
      const connectionsContent = await zip.files[connectionsFile].async('text');
      const lines = connectionsContent.split('\n').filter(line => line.trim());
      results.stats.connections = Math.max(0, lines.length - 1);
      console.log(`Found ${results.stats.connections} connections`);
    }

    setUploadProgress("Analyzing messages...");
    
    const messagesFile = Object.keys(zip.files).find(name => 
      name.toLowerCase().includes('messages') && name.endsWith('.csv')
    );
    
    if (messagesFile) {
      const messagesContent = await zip.files[messagesFile].async('text');
      const lines = messagesContent.split('\n').filter(line => line.trim());
      results.stats.messages = Math.max(0, lines.length - 1);
      console.log(`Found ${results.stats.messages} messages`);
    }

    setUploadProgress("Analyzing posts...");
    
    const postsFile = Object.keys(zip.files).find(name => 
      (name.toLowerCase().includes('posts') || name.toLowerCase().includes('articles')) && name.endsWith('.csv')
    );
    
    if (postsFile) {
      const postsContent = await zip.files[postsFile].async('text');
      const lines = postsContent.split('\n').filter(line => line.trim());
      results.stats.posts = Math.max(0, lines.length - 1);
      console.log(`Found ${results.stats.posts} posts/articles`);
    }

    results.insights = [
      `You have ${results.stats.connections} professional connections`,
      `Your messaging activity shows ${results.stats.messages} conversation threads`,
      `You've created ${results.stats.posts} posts and articles`,
      `Analysis based on your actual LinkedIn data export`
    ];

    console.log("Final analysis results:", results);
    return results;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.zip')) {
      alert('Please upload a ZIP file from LinkedIn data export');
      return;
    }

    setUploading(true);
    
    try {
      const results = await processLinkedInZip(file);
      
      setUploadProgress("Analysis complete!");
      
      console.log('About to save analysis for user:', user?.uid);
      console.log('User object:', user);
      
      const analysisData = {
        userId: user.uid,
        fileName: file.name,
        processedAt: new Date().toISOString(),
        stats: results.stats,
        insights: results.insights
      };

      console.log('Calling AnalysisStorageService.saveAnalysis...');
      const analysisId = await AnalysisStorageService.saveAnalysis(analysisData);
      console.log('Analysis saved with ID:', analysisId);
      
      setTimeout(() => {
        router.push("/dashboard/results");
      }, 1000);
      
    } catch (error) {
      console.error("Processing error:", error);
      alert("Error processing file: " + error.message);
      setUploading(false);
      setUploadProgress("");
    }
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
            <div>
              <p>Processing your LinkedIn data...</p>
              <p style={{ color: "#64748b", fontSize: "0.875rem" }}>{uploadProgress}</p>
            </div>
          ) : (
            <>
              <input type="file" accept=".zip" onChange={handleFileUpload} />
              <p style={{ fontSize: "0.875rem", color: "#64748b", marginTop: "1rem" }}>
                Upload your LinkedIn data export ZIP file for real analysis
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
