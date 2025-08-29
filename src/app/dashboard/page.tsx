"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { AnalysisStorageService } from '@/lib/analysis-storage';
import { SubscriptionService } from '@/lib/subscription-storage';
import SubscriptionCard from '@/components/SubscriptionCard';

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [analyses, setAnalyses] = useState([]);
  const [loadingAnalyses, setLoadingAnalyses] = useState(true);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      
      try {
        const [userAnalyses, userSubscription] = await Promise.all([
          AnalysisStorageService.getUserAnalyses(user.uid),
          SubscriptionService.getUserSubscription(user.uid)
        ]);
        
        setAnalyses(userAnalyses);
        console.log("Loaded subscription:", userSubscription);
        setSubscription(userSubscription);
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoadingAnalyses(false);
      }
    };

    if (user && !loading) {
      loadUserData();
    }
  }, [user, loading]);

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

    if (!file.name.endsWith('.zip')) {
      alert('Please upload a ZIP file from LinkedIn data export');
      return;
    }

    // Check subscription limits
    if (subscription && subscription.analysesUsed >= subscription.analysesLimit && subscription.analysesLimit !== -1) {
      alert('You have reached your monthly analysis limit. Please upgrade to continue.');
      return;
    }

    alert('Processing temporarily disabled - fixing subscription integration');
  };

  if (loading || loadingAnalyses) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "2rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem" }}>
          <h1>LinkStream Dashboard</h1>
          <button onClick={handleLogout} style={{ background: "#ef4444", color: "white", padding: "0.5rem 1rem", border: "none", borderRadius: "4px" }}>
            Sign Out
          </button>
        </div>
        
        {/* Subscription Card */}
        {subscription && <SubscriptionCard />}
        
        {/* Upload Section */}
        <div style={{ background: "white", padding: "2rem", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
          <h2>Upload New LinkedIn Data</h2>
          <input type="file" accept=".zip" onChange={handleFileUpload} />
          <p style={{ fontSize: "0.875rem", color: "#64748b", marginTop: "1rem" }}>
            Testing subscription integration...
          </p>
        </div>
      </div>
    </div>
  );
}
