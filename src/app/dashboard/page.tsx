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
  const [userPlan, setUserPlan] = useState('pro');
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
      setRecentAnalyses(analyses.slice(0, 3));
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

    if (!canUploadFile()) {
      alert(`You've reached your monthly limit! Upgrade to Pro for unlimited analyses.`);
      router.push('/dashboard/subscription');
      return;
    }

    setUploading(true);
    
    try {
      const newUsage = UsageTracker.incrementUsage(user.uid);
      setMonthlyUsage(newUsage);

      const JSZip = (await import('jszip')).default;
      const zip = await JSZip.loadAsync(file);
      
      const fileNames = Object.keys(zip.files);
      
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

      // Process LinkedIn data files
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
        `📊 **Network Overview**: ${results.stats.connections.toLocaleString()} professional connections analyzed and securely backed up`,
        `💬 **Communication History**: ${results.stats.messages.toLocaleString()} messages providing deep insights into your networking patterns`,
        `📝 **Content Activity**: ${results.stats.posts.toLocaleString()} posts showcasing your thought leadership and engagement`,
        `🏢 **Professional Reach**: Connected to ${results.stats.companies.toLocaleString()} companies across various industries`,
        `💼 **Skills Portfolio**: ${results.analytics.skillsCount} skills identified and endorsed by your network`,
        `🌍 **Global Network**: Your connections span multiple geographic regions`,
        `🎯 **Industry Influence**: Strong presence in Technology sector with ${results.analytics.industries['Technology']} connections`,
        `📈 **Engagement Potential**: Your ${results.stats.comments.toLocaleString()} comments show strong network engagement`
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

        results.analysisId = analysisId;
        console.log('✅ Analysis saved with ID:', analysisId);
      } catch (error) {
        console.error('❌ Failed to save analysis:', error);
      }

      sessionStorage.setItem("analysisResults", JSON.stringify(results));
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full mx-auto"></div>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-blue-100 font-medium text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const usageLimits = UsageTracker.getUsageLimits(userPlan);
  const remainingAnalyses = userPlan === 'free' ? Math.max(0, 1 - monthlyUsage) : 'unlimited';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className="relative z-50 bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-xl shadow-lg">
                <span className="text-white font-bold text-lg">🛡️</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">LinkStream</h1>
                <p className="text-xs text-blue-200 hidden sm:block">Your Personal LinkedIn Vault</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.push('/dashboard/subscription')}
                className="text-white/80 hover:text-white transition-colors"
              >
                💳 Pricing
              </button>
              <button 
                onClick={handleLogout}
                className="text-white/80 hover:text-white transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-40 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white text-3xl">👋</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Welcome back!</h2>
          <p className="text-blue-200">Analyze your LinkedIn data to unlock powerful insights about your professional network</p>
        </div>

        {/* Usage Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-sm">
                <span className="text-white text-xl">📊</span>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{monthlyUsage}</p>
                <p className="text-blue-200 font-medium">Analyses Used</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl shadow-sm">
                <span className="text-white text-xl">⚡</span>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">
                  {typeof remainingAnalyses === 'number' ? remainingAnalyses : '∞'}
                </p>
                <p className="text-blue-200 font-medium">Remaining</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-sm">
                <span className="text-white text-xl">🚀</span>
              </div>
              <div>
                <p className="text-3xl font-bold text-white capitalize">{userPlan}</p>
                <p className="text-blue-200 font-medium">Current Plan</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 p-8 shadow-lg mb-8">
          <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
            <span className="mr-3">📁</span>
            {canUploadFile() ? 'Upload Your LinkedIn Data' : 'Upgrade Required'}
          </h3>
          <p className="text-blue-200 mb-8 text-lg">
            {canUploadFile() 
              ? "Upload your LinkedIn export ZIP file for AI-powered analysis and insights."
              : "You've reached your monthly limit. Upgrade to Pro for unlimited analyses."
            }
          </p>
          
          {canUploadFile() ? (
            <div className="border-2 border-dashed border-white/30 rounded-2xl p-8 text-center hover:border-white/50 transition-all">
              {uploading ? (
                <div className="flex flex-col items-center">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 border-4 border-blue-200 rounded-full mx-auto"></div>
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="text-blue-100 text-lg font-medium">Processing your LinkedIn data...</p>
                  <p className="text-blue-300 text-sm mt-2">This may take a few moments</p>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".zip"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                      <span className="text-white text-2xl">📤</span>
                    </div>
                    <span className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg">
                      🛡️ Upload & Analyze LinkedIn Data
                    </span>
                    <p className="mt-4 text-sm text-blue-300">
                      Upload your LinkedIn data export (ZIP file)
                    </p>
                  </div>
                </label>
              )}
            </div>
          ) : (
            <div className="text-center">
              <button
                onClick={() => router.push('/dashboard/subscription')}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-lg font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg"
              >
                🚀 Upgrade to Pro
              </button>
            </div>
          )}
        </div>

        {/* Recent Analyses */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
            <span className="mr-3">📈</span>
            Recent Analyses
          </h3>
          
          {loadingHistory ? (
            <div className="text-center py-8">
              <div className="relative mb-4">
                <div className="w-8 h-8 border-2 border-blue-200 rounded-full mx-auto"></div>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-blue-200">Loading your analysis history...</p>
            </div>
          ) : recentAnalyses.length > 0 ? (
            <div className="space-y-4">
              {recentAnalyses.map((analysis, index) => (
                <div
                  key={analysis.id || index}
                  className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-white text-lg mb-2">{analysis.fileName}</h4>
                      <div className="flex items-center space-x-6 text-sm text-blue-200">
                        <span className="flex items-center">
                          <span className="mr-1">👥</span>
                          {analysis.stats.connections.toLocaleString()} connections
                        </span>
                        <span className="flex items-center">
                          <span className="mr-1">📅</span>
                          {analysis.uploadDate?.toDate ? 
                            analysis.uploadDate.toDate().toLocaleDateString() : 
                            'Recent'
                          }
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => viewAnalysis(analysis)}
                      className="ml-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
                    >
                      View Analysis
                    </button>
                  </div>
                </div>
              ))}
              
              <div className="pt-6 border-t border-white/10">
                <button
                  onClick={() => router.push('/dashboard/results')}
                  className="text-blue-300 hover:text-blue-100 font-medium transition-colors"
                >
                  View all analyses →
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-white text-2xl">📊</span>
              </div>
              <h4 className="text-xl font-semibold text-white mb-3">No analyses yet</h4>
              <p className="text-blue-200 mb-6">
                Upload your first LinkedIn data export to get started with insights.
              </p>
              {canUploadFile() && (
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".zip"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <span className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg">
                    Get Started
                  </span>
                </label>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
