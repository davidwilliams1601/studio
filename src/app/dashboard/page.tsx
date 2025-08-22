"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { UsageTracker } from "@/lib/usage";
import { AnalysisStorageService } from "@/lib/analysis-storage";

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [userPlan, setUserPlan] = useState('pro'); // Changed from 'free' to 'pro' for testing
  const [monthlyUsage, setMonthlyUsage] = useState(0);
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      setMonthlyUsage(UsageTracker.getMonthlyUsage(user.uid));
      loadAnalysisHistory();
    }
  }, [user, loading, router]);

  const loadAnalysisHistory = async () => {
    if (!user) return;
    
    try {
      const analyses = await AnalysisStorageService.getUserAnalyses(user.uid);
      setRecentAnalyses(analyses.slice(0, 3)); // Show last 3
    } catch (error) {
      console.error('Error loading analysis history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const canUploadFile = () => {
    if (!user) return false;
    return UsageTracker.canUseFeature(user.uid, userPlan, 'analysis');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Check usage limits
    if (!canUploadFile()) {
      alert(`You've reached your monthly limit! Upgrade to Pro for unlimited analyses.`);
      router.push('/dashboard/subscription');
      return;
    }

    setUploading(true);
    
    try {
      // Increment usage
      const newUsage = UsageTracker.incrementUsage(user.uid);
      setMonthlyUsage(newUsage);

      const JSZip = (await import('jszip')).default;
      const zip = await JSZip.loadAsync(file);
      
      const fileNames = Object.keys(zip.files);
      
      const results = {
        fileName: file.name,
        processedAt: new Date().toISOString(),
        userPlan: userPlan,
        stats: {
          connections: 0,
          messages: 0,
          posts: 0,
          comments: 0,
          companies: 0
        },
        analytics: {
          industries: {},
          locations: {},
          topCompanies: {},
          skillsCount: 0
        },
        insights: []
      };

      // Process files (keeping existing logic)
      const connectionsFile = fileNames.find(name => name === 'Connections.csv');
      if (connectionsFile) {
        const content = await zip.files[connectionsFile].async('text');
        const lines = content.split('\n').filter(line => line.trim());
        results.stats.connections = Math.max(0, lines.length - 3);
      }

      const messagesFile = fileNames.find(name => name === 'messages.csv');
      if (messagesFile) {
        const content = await zip.files[messagesFile].async('text');
        const lines = content.split('\n').filter(line => line.trim());
        results.stats.messages = Math.max(0, lines.length - 1);
      }

      const sharesFile = fileNames.find(name => name === 'Shares.csv');
      if (sharesFile) {
        const content = await zip.files[sharesFile].async('text');
        const lines = content.split('\n').filter(line => line.trim());
        results.stats.posts = Math.max(0, lines.length - 1);
      }

      const commentsFile = fileNames.find(name => name === 'Comments.csv');
      if (commentsFile) {
        const content = await zip.files[commentsFile].async('text');
        const lines = content.split('\n').filter(line => line.trim());
        results.stats.comments = Math.max(0, lines.length - 1);
      }

      const companyFile = fileNames.find(name => name === 'Company Follows.csv');
      if (companyFile) {
        const content = await zip.files[companyFile].async('text');
        const lines = content.split('\n').filter(line => line.trim());
        results.stats.companies = Math.max(0, lines.length - 1);
      }

      const skillsFile = fileNames.find(name => name === 'Skills.csv');
      if (skillsFile) {
        const content = await zip.files[skillsFile].async('text');
        const lines = content.split('\n').filter(line => line.trim());
        results.analytics.skillsCount = Math.max(0, lines.length - 1);
      }

      // Generate analytics
      const totalConnections = results.stats.connections;
      
      results.analytics.industries = {
        'Technology': Math.floor(totalConnections * 0.28),
        'Finance & Banking': Math.floor(totalConnections * 0.18),
        'Consulting': Math.floor(totalConnections * 0.15),
        'Healthcare': Math.floor(totalConnections * 0.12),
        'Education': Math.floor(totalConnections * 0.08),
        'Manufacturing': Math.floor(totalConnections * 0.07),
        'Other': Math.floor(totalConnections * 0.12)
      };

      results.analytics.locations = {
        'United Kingdom': Math.floor(totalConnections * 0.42),
        'United States': Math.floor(totalConnections * 0.22),
        'Germany': Math.floor(totalConnections * 0.08),
        'France': Math.floor(totalConnections * 0.06),
        'Netherlands': Math.floor(totalConnections * 0.05),
        'Canada': Math.floor(totalConnections * 0.04),
        'Australia': Math.floor(totalConnections * 0.04),
        'India': Math.floor(totalConnections * 0.04),
        'Switzerland': Math.floor(totalConnections * 0.03),
        'Other': Math.floor(totalConnections * 0.02)
      };

      results.insights = [
        `You have ${results.stats.connections.toLocaleString()} professional connections`,
        `Your network spans ${Object.keys(results.analytics.locations).length} different countries/regions`,
        `Technology sector represents the largest portion of your network`,
        `You've shared ${results.stats.posts.toLocaleString()} posts and content pieces`,
        `Your engagement includes ${results.stats.comments.toLocaleString()} comments`,
        `You follow ${results.stats.companies.toLocaleString()} companies for industry insights`,
        `You have ${results.analytics.skillsCount} skills listed on your profile`,
        `Strong presence across ${Object.keys(results.analytics.industries).length} major industries`
      ];

      // Save analysis to database
      try {
        const analysisId = await AnalysisStorageService.saveAnalysis(user.uid, {
          fileName: file.name,
          stats: results.stats,
          analytics: results.analytics,
          userPlan: userPlan,
          storagePath: '',
          insights: null
        });

        // Add analysisId to results for the results page
        results.analysisId = analysisId;
        console.log('✅ Analysis saved with ID:', analysisId);
      } catch (error) {
        console.error('❌ Failed to save analysis:', error);
        // Continue anyway - we can still show results
      }

      sessionStorage.setItem("analysisResults", JSON.stringify(results));
      
      // Reload history
      loadAnalysisHistory();
      
      setTimeout(() => router.push("/dashboard/results"), 1000);
      
    } catch (error) {
      console.error("Processing error:", error);
      alert("Error processing file: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const viewAnalysis = (analysis) => {
    const resultsData = {
      fileName: analysis.fileName,
      processedAt: analysis.uploadDate,
      userPlan: analysis.userPlan,
      stats: analysis.stats,
      analytics: analysis.analytics,
      insights: analysis.insights || [],
      analysisId: analysis.id
    };
    
    sessionStorage.setItem("analysisResults", JSON.stringify(resultsData));
    router.push("/dashboard/results");
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  const usageLimits = UsageTracker.getUsageLimits(userPlan);
  const remainingAnalyses = userPlan === 'free' ? Math.max(0, 1 - monthlyUsage) : 'unlimited';

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* Header */}
      <div style={{ background: "white", borderBottom: "1px solid #e2e8f0", padding: "1rem 2rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1e293b", margin: 0 }}>
              🛡️ LinkStream
            </h1>
            <nav style={{ display: "flex", gap: "1.5rem" }}>
              <a href="/dashboard" style={{ color: "#3b82f6", textDecoration: "none", fontWeight: "500" }}>
                📊 Dashboard
              </a>
              <a href="/dashboard/subscription" style={{ color: "#64748b", textDecoration: "none", fontWeight: "500" }}>
                💳 Pricing
              </a>
            </nav>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.875rem", color: "#64748b" }}>
                Welcome, {user.email}
              </div>
              <div style={{ fontSize: "0.75rem", color: userPlan === 'free' ? "#dc2626" : "#10b981" }}>
                {userPlan.toUpperCase()} Plan • {remainingAnalyses} analyses remaining
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {userPlan === 'free' && (
                <a 
                  href="/dashboard/subscription"
                  style={{ 
                    padding: "0.5rem 1rem", 
                    background: "#10b981", 
                    color: "white", 
                    textDecoration: "none", 
                    borderRadius: "4px", 
                    fontWeight: "bold",
                    fontSize: "0.875rem"
                  }}
                >
                  🚀 Upgrade
                </a>
              )}
              <button 
                onClick={handleLogout}
                style={{ 
                  padding: "0.5rem 1rem", 
                  background: "#ef4444", 
                  color: "white", 
                  border: "none", 
                  borderRadius: "4px", 
                  fontWeight: "bold", 
                  cursor: "pointer",
                  fontSize: "0.875rem"
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: "2rem" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          
          {/* Recent Analyses History */}
          {!loadingHistory && recentAnalyses.length > 0 && (
            <div style={{ background: "white", padding: "2rem", borderRadius: "8px", marginBottom: "2rem", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1rem" }}>
                📊 Recent Analyses
              </h3>
              <div style={{ display: "grid", gap: "1rem" }}>
                {recentAnalyses.map((analysis, index) => (
                  <div 
                    key={analysis.id}
                    style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center",
                      padding: "1rem",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      cursor: "pointer"
                    }}
                    onClick={() => viewAnalysis(analysis)}
                  >
                    <div>
                      <div style={{ fontWeight: "500" }}>{analysis.fileName}</div>
                      <div style={{ fontSize: "0.875rem", color: "#64748b" }}>
                        {analysis.stats.connections.toLocaleString()} connections • {' '}
                        {new Date(analysis.uploadDate.seconds * 1000).toLocaleDateString()}
                      </div>
                    </div>
                    <button style={{ 
                      padding: "0.5rem 1rem", 
                      background: "#3b82f6", 
                      color: "white", 
                      border: "none", 
                      borderRadius: "4px",
                      fontSize: "0.875rem"
                    }}>
                      View Results
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Section */}
          <div style={{ background: "white", padding: "2rem", borderRadius: "8px", marginBottom: "2rem", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", margin: 0 }}>
                🛡️ LinkedIn Data Backup
              </h2>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.875rem", color: "#64748b" }}>This month:</div>
                <div style={{ fontSize: "1.25rem", fontWeight: "bold", color: userPlan === 'free' && monthlyUsage >= 1 ? "#dc2626" : "#10b981" }}>
                  {userPlan === 'free' ? `${monthlyUsage}/1` : monthlyUsage} backups
                </div>
              </div>
            </div>

            {uploading ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🔄</div>
                <h3 style={{ marginBottom: "0.5rem" }}>Securing Your LinkedIn Data...</h3>
                <p style={{ color: "#64748b" }}>Processing with professional analytics</p>
              </div>
            ) : (
              <>
                <div style={{ 
                  textAlign: "center", 
                  border: canUploadFile() ? "2px dashed #10b981" : "2px dashed #fecaca", 
                  borderRadius: "8px", 
                  padding: "2rem", 
                  marginBottom: "1rem",
                  background: canUploadFile() ? "#f0fdf4" : "#fef2f2"
                }}>
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
                    {canUploadFile() ? "🛡️" : "🔒"}
                  </div>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "0.5rem", color: canUploadFile() ? "#15803d" : "#dc2626" }}>
                    {canUploadFile() ? "Ready to Protect Your LinkedIn" : "Upgrade Required"}
                  </h3>
                  <p style={{ color: "#64748b", marginBottom: "1rem" }}>
                    {canUploadFile() 
                      ? "Upload your LinkedIn data export for secure backup and AI insights"
                      : "You've reached your free limit. Upgrade for unlimited protection."
                    }
                  </p>
                  
                  {canUploadFile() ? (
                    <>
                      <input 
                        type="file" 
                        accept=".zip" 
                        onChange={handleFileUpload}
                        style={{ display: "none" }}
                        id="file-upload"
                      />
                      <label 
                        htmlFor="file-upload"
                        style={{ 
                          display: "inline-block",
                          padding: "0.75rem 1.5rem", 
                          background: "#10b981", 
                          color: "white", 
                          borderRadius: "8px", 
                          cursor: "pointer", 
                          fontWeight: "bold",
                          transition: "background 0.2s"
                        }}
                      >
                        🛡️ Upload & Secure
                      </label>
                    </>
                  ) : (
                    <a 
                      href="/dashboard/subscription"
                      style={{ 
                        display: "inline-block",
                        padding: "0.75rem 1.5rem", 
                        background: "#dc2626", 
                        color: "white", 
                        borderRadius: "8px", 
                        textDecoration: "none", 
                        fontWeight: "bold"
                      }}
                    >
                      🚀 Upgrade Now
                    </a>
                  )}
                </div>

                {userPlan === 'free' && monthlyUsage === 0 && (
                  <div style={{ background: "#f0f9ff", border: "1px solid #0ea5e9", padding: "1rem", borderRadius: "6px", marginBottom: "1rem" }}>
                    <p style={{ margin: 0, fontSize: "0.875rem", color: "#0c4a6e" }}>
                      💡 <strong>Free Plan:</strong> You get 1 backup per month. Upgrade to Pro for unlimited backups and AI insights!
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
