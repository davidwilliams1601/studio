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

  const processLinkedInZip = async (file) => {
    const JSZip = (await import('jszip')).default;
    const zip = await JSZip.loadAsync(file);
    
    const fileNames = Object.keys(zip.files);
    
    const results = {
      fileName: file.name,
      processedAt: new Date().toISOString(),
      stats: {
        connections: 0,
        messages: 0,
        posts: 0,
        comments: 0,
        companies: 0
      },
      insights: []
    };

    // Connections
    const connectionsFile = fileNames.find(name => name === 'Connections.csv');
    if (connectionsFile) {
      const content = await zip.files[connectionsFile].async('text');
      const lines = content.split('\n').filter(line => line.trim());
      results.stats.connections = Math.max(0, lines.length - 1);
      console.log(`✅ CONNECTIONS: ${results.stats.connections}`);
    }

    // Messages - use the main messages.csv file
    const messagesFile = fileNames.find(name => name === 'messages.csv');
    if (messagesFile) {
      const content = await zip.files[messagesFile].async('text');
      const lines = content.split('\n').filter(line => line.trim());
      results.stats.messages = Math.max(0, lines.length - 1);
      console.log(`✅ MESSAGES: ${results.stats.messages}`);
    }

    // Posts/Shares
    const sharesFile = fileNames.find(name => name === 'Shares.csv');
    if (sharesFile) {
      const content = await zip.files[sharesFile].async('text');
      const lines = content.split('\n').filter(line => line.trim());
      results.stats.posts = Math.max(0, lines.length - 1);
      console.log(`✅ POSTS/SHARES: ${results.stats.posts}`);
    }

    // Comments
    const commentsFile = fileNames.find(name => name === 'Comments.csv');
    if (commentsFile) {
      const content = await zip.files[commentsFile].async('text');
      const lines = content.split('\n').filter(line => line.trim());
      results.stats.comments = Math.max(0, lines.length - 1);
      console.log(`✅ COMMENTS: ${results.stats.comments}`);
    }

    // Company Follows
    const companyFile = fileNames.find(name => name === 'Company Follows.csv');
    if (companyFile) {
      const content = await zip.files[companyFile].async('text');
      const lines = content.split('\n').filter(line => line.trim());
      results.stats.companies = Math.max(0, lines.length - 1);
      console.log(`✅ COMPANY FOLLOWS: ${results.stats.companies}`);
    }

    // Generate insights based on real data
    results.insights = [
      `You have ${results.stats.connections.toLocaleString()} professional connections`,
      `Your messaging activity includes ${results.stats.messages.toLocaleString()} conversation threads`,
      `You've shared ${results.stats.posts.toLocaleString()} posts and content`,
      `You've made ${results.stats.comments.toLocaleString()} comments on LinkedIn`,
      `You follow ${results.stats.companies.toLocaleString()} companies`,
      `Analysis based on your actual LinkedIn data export`
    ];

    console.log("📊 FINAL STATS:", results.stats);
    return results;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    
    try {
      const results = await processLinkedInZip(file);
      sessionStorage.setItem("analysisResults", JSON.stringify(results));
      setTimeout(() => router.push("/dashboard/results"), 1000);
    } catch (error) {
      console.error("Processing error:", error);
      alert("Error processing file: " + error.message);
      setUploading(false);
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
            <p>Processing your LinkedIn data...</p>
          ) : (
            <>
              <input type="file" accept=".zip" onChange={handleFileUpload} />
              <p style={{ fontSize: "0.875rem", color: "#64748b", marginTop: "1rem" }}>
                Real LinkedIn analysis: 5,460 connections + 489 posts! 🎉
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
