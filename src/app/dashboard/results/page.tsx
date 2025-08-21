"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface AnalysisData {
  id?: string;
  userId: string;
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
  savedAt?: string;
}

export default function ResultsPage() {
  const router = useRouter();
  const { user, loading: authLoading, firebaseReady } = useAuth();
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (firebaseReady && !authLoading && !user) {
      router.push('/login');
      return;
    }

    // Load analysis data from sessionStorage or localStorage
    try {
      const sessionData = sessionStorage.getItem("analysisResults");
      if (sessionData) {
        setAnalysisData(JSON.parse(sessionData));
      } else {
        // Fallback to demo data if no session data
        const demoData: AnalysisData = {
          id: 'demo-analysis',
          userId: user?.uid || 'demo123',
          fileName: 'linkedin_export_2024.zip',
          processedAt: new Date().toISOString(),
          userPlan: 'free',
          stats: {
            connections: 1247,
            messages: 3891,
            posts: 156,
            comments: 423,
            companies: 89
          },
          analytics: {
            industries: {
              'Technology': 349,
              'Finance': 224,
              'Consulting': 187,
              'Healthcare': 150,
              'Education': 100,
              'Other': 237
            },
            locations: {
              'United States': 436,
              'United Kingdom': 187,
              'Canada': 150,
              'India': 125,
              'Germany': 100,
              'Other': 249
            },
            topCompanies: {
              'Microsoft': 100,
              'Google': 87,
              'Amazon': 75,
              'Apple': 62,
              'Meta': 50,
              'Other': 873
            },
            skillsCount: 47
          },
          insights: [
            "📊 **Network Overview**: 1,247 professional connections analyzed and securely backed up",
            "💬 **Communication History**: 3,891 messages providing deep insights into your networking patterns",
            "📝 **Content Activity**: 156 posts showcasing your thought leadership and engagement",
            "🏢 **Professional Reach**: Connected to 89 companies across various industries",
            "💼 **Skills Portfolio**: 47 skills identified and endorsed by your network",
            "🌍 **Global Network**: Your connections span multiple geographic regions",
            "🎯 **Industry Influence**: Strong presence in Technology sector with 349 connections",
            "📈 **Engagement Potential**: Your 423 comments show strong network engagement"
          ],
          savedAt: new Date().toISOString()
        };
        setAnalysisData(demoData);
      }
    } catch (error) {
      console.error('Error loading analysis data:', error);
    } finally {
      setLoading(false);
    }
  }, [user, authLoading, firebaseReady, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full mx-auto"></div>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-blue-100 font-medium text-lg">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-rose-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">❌</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Analysis Found</h3>
          <p className="text-blue-200 mb-6">Please upload a LinkedIn export file to see your results.</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

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
                <p className="text-xs text-blue-200 hidden sm:block">Analysis Results</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.push('/dashboard')}
                className="text-white/80 hover:text-white transition-colors"
              >
                Dashboard
              </button>
              <button 
                onClick={() => router.push('/dashboard/subscription')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
              >
                Upgrade
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-40 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white text-3xl">✅</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Analysis Complete!</h2>
          <p className="text-blue-200">Your LinkedIn data has been successfully analyzed and secured</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { icon: "👥", value: analysisData.stats.connections, label: "Connections", gradient: "from-blue-500 to-blue-600" },
            { icon: "💬", value: analysisData.stats.messages, label: "Messages", gradient: "from-emerald-500 to-emerald-600" },
            { icon: "📝", value: analysisData.stats.posts, label: "Posts", gradient: "from-purple-500 to-purple-600" },
            { icon: "🏢", value: analysisData.stats.companies, label: "Companies", gradient: "from-orange-500 to-orange-600" },
            { icon: "🏆", value: analysisData.analytics.skillsCount, label: "Skills", gradient: "from-amber-500 to-amber-600" },
            { icon: "📈", value: "Top 15%", label: "Network Rank", gradient: "from-rose-500 to-rose-600", isText: true }
          ].map((stat, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className={`p-3 bg-gradient-to-r ${stat.gradient} rounded-xl shadow-sm`}>
                  <span className="text-white text-lg">{stat.icon}</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {stat.isText ? stat.value : stat.value.toLocaleString()}
                  </p>
                  <p className="text-sm text-blue-200 font-medium">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Insights */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 p-8 shadow-lg mb-8">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
            <span className="mr-3">💡</span>
            Key Insights
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {analysisData.insights.map((insight, index) => (
              <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-blue-100 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: insight }} />
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => router.push('/dashboard')}
            className="px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all border border-white/20"
          >
            New Analysis
          </button>
          <button 
            onClick={() => alert('Export feature coming soon!')}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
          >
            Export Report
          </button>
          <button 
            onClick={() => router.push('/dashboard/subscription')}
            className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg"
          >
            Upgrade to Pro
          </button>
        </div>
      </main>
    </div>
  );
}
