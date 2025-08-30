"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { AnalysisStorageService } from '@/lib/analysis-storage';
import { SubscriptionService } from '@/lib/subscription-storage';
import AIInsights from '@/components/AIInsights';

export default function Results() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [analysis, setAnalysis] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const loadAnalysisData = async () => {
      if (!user) return;
      
      try {
        const selectedAnalysisId = sessionStorage.getItem("selectedAnalysisId");
        
        let analysisData;
        if (selectedAnalysisId) {
          const userAnalyses = await AnalysisStorageService.getUserAnalyses(user.uid);
          analysisData = userAnalyses.find(a => a.id === selectedAnalysisId);
        }
        
        if (!analysisData) {
          analysisData = await AnalysisStorageService.getLatestAnalysis(user.uid);
        }
        
        const subscriptionData = await SubscriptionService.getUserSubscription(user.uid);
        
        setAnalysis(analysisData);
        setSubscription(subscriptionData);
      } catch (error) {
        console.error('Error loading analysis:', error);
      } finally {
        setLoadingData(false);
      }
    };

    if (user && !loading) {
      loadAnalysisData();
    }
  }, [user, loading]);

  if (loading || loadingData) return <div>Loading...</div>;
  if (!user || !analysis) return <div>No analysis data found</div>;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "2rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        <div style={{ marginBottom: "2rem" }}>
          <button 
            onClick={() => router.push("/dashboard")} 
            style={{ 
              background: "none", 
              border: "none", 
              color: "#3b82f6", 
              fontSize: "1rem", 
              cursor: "pointer", 
              marginBottom: "1rem" 
            }}
          >
            ← Back to Dashboard
          </button>
          
          <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
            Analysis Results
          </h1>
          <p style={{ color: "#6b7280" }}>
            File: {analysis.fileName} • Processed: {new Date(analysis.processedAt).toLocaleDateString()}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
          
          <div style={{ background: "white", padding: "2rem", borderRadius: "8px" }}>
            <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              Network Overview
            </h2>
            <div style={{ fontSize: "3rem", fontWeight: "bold", color: "#3b82f6", marginBottom: "0.5rem" }}>
              {analysis.stats.connections.toLocaleString()}
            </div>
            <p style={{ color: "#6b7280" }}>Total Connections</p>
          </div>

          <div style={{ background: "white", padding: "2rem", borderRadius: "8px" }}>
            <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              Messages
            </h2>
            <div style={{ fontSize: "3rem", fontWeight: "bold", color: "#10b981", marginBottom: "0.5rem" }}>
              {analysis.stats.messages.toLocaleString()}
            </div>
            <p style={{ color: "#6b7280" }}>Conversations</p>
          </div>

          <div style={{ background: "white", padding: "2rem", borderRadius: "8px" }}>
            <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              Content
            </h2>
            <div style={{ fontSize: "3rem", fontWeight: "bold", color: "#f59e0b", marginBottom: "0.5rem" }}>
              {analysis.stats.posts}
            </div>
            <p style={{ color: "#6b7280" }}>Posts & Articles</p>
          </div>

        </div>

        {subscription && subscription.plan !== 'free' && analysis.aiInsights && analysis.aiInsights.length > 0 && (
          <AIInsights insights={analysis.aiInsights} userTier={subscription.plan} />
        )}

        <div style={{ background: "white", padding: "2rem", borderRadius: "8px", marginBottom: "2rem" }}>
          <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
            Key Insights
          </h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {analysis.insights.map((insight, index) => (
              <li key={index} style={{ 
                padding: "0.75rem 0", 
                borderBottom: index < analysis.insights.length - 1 ? "1px solid #e5e7eb" : "none",
                color: "#374151"
              }}>
                {insight}
              </li>
            ))}
          </ul>
        </div>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <button style={{ 
            background: "#3b82f6", 
            color: "white", 
            padding: "0.75rem 2rem", 
            border: "none", 
            borderRadius: "4px", 
            fontWeight: "bold" 
          }}>
            Print Report
          </button>
          <button style={{ 
            background: "#10b981", 
            color: "white", 
            padding: "0.75rem 2rem", 
            border: "none", 
            borderRadius: "4px", 
            fontWeight: "bold" 
          }}>
            Download Data
          </button>
        </div>

      </div>
    </div>
  );
}
