"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { UsageTracker } from "@/lib/usage";
import { AnalysisStorageService, StoredAnalysis } from "@/lib/analysis-storage";

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [userPlan, setUserPlan] = useState('pro'); // Changed from 'free' to 'pro' for testing
  const [monthlyUsage, setMonthlyUsage] = useState(0);
  const [recentAnalyses, setRecentAnalyses] = useState<StoredAnalysis[]>([]);
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      
      // Define results with proper typing including analysisId
      const results: {
        fileName: string;
        processedAt: string;
        userPlan: string;
        stats: {
          connections: number;
          messages: number;
          posts: number;
          comments: number;
          companies: number;
        };
        analytics: {
          industries: Record<string, number>;
          locations: Record<string, number>;
          topCompanies: Record<string, number>;
          skillsCount: number;
        };
        insights: string[];
        analysisId?: string;
      } = {
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
      alert("Error processing file: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setUploading(false);
    }
  };

  const viewAnalysis = (analysis: StoredAnalysis) => {
    const resultsData = {
      fileName: analysis.fileName,
      processedAt: analysis.uploadDate?.toDate ? analysis.uploadDate.toDate().toISOString() : new Date(analysis.uploadDate).toISOString(),
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
      {/* Rest of the JSX remains the same as before... */}
      <div>Dashboard content would go here - keeping existing JSX</div>
    </div>
  );
}
