"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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

export default function Results() {
  const router = useRouter();
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Load analysis data from session storage
    try {
      const data = sessionStorage.getItem("analysisResults");
      if (data) {
        const parsed = JSON.parse(data);
        setAnalysisData(parsed);
      } else {
        // Redirect back to dashboard if no data
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error loading analysis data:', error);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleExportPDF = () => {
    // Implement PDF export functionality
    alert('PDF export functionality will be implemented here');
  };

  const handleShareReport = () => {
    // Implement share functionality
    alert('Share functionality will be implemented here');
  };

  const handleExportCSV = () => {
    // Implement CSV export functionality
    alert('CSV export functionality will be implemented here');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading your analysis...</p>
        </div>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 font-medium mb-4">No analysis data found</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Process data for visualizations
  const industryData = Object.entries(analysisData.analytics.industries).map(([name, value]) => ({
    name,
    value,
    percentage: ((value / analysisData.stats.connections) * 100).toFixed(1),
    percentageNum: (value / analysisData.stats.connections) * 100 // Add numeric version
  }));

  const locationData = Object.entries(analysisData.analytics.locations).map(([name, value]) => ({
    name,
    value,
    percentage: ((value / analysisData.stats.connections) * 100).toFixed(1),
    percentageNum: (value / analysisData.stats.connections) * 100 // Add numeric version
  }));

  const companyData = Object.entries(analysisData.analytics.topCompanies).map(([name, value]) => ({
    name,
    value,
    percentage: ((value / analysisData.stats.connections) * 100).toFixed(1),
    percentageNum: (value / analysisData.stats.connections) * 100 // Add numeric version
  }));

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Professional Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Back Button */}
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.push('/dashboard')}
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <span className="text-lg">←</span>
                <span className="font-medium">Back to Dashboard</span>
              </button>
              
              <div className="h-6 w-px bg-slate-300"></div>
              
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-2 rounded-lg">
                  <span className="text-white font-bold text-lg">🛡️</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">LinkStream</h1>
                  <p className="text-xs text-slate-500 hidden sm:block">Professional LinkedIn Analytics</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleShareReport}
                className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <span className="text-lg">📤</span>
                <span className="hidden sm:inline">Share</span>
              </button>
              <button 
                onClick={handleExportPDF}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span className="text-lg">📥</span>
                <span className="hidden sm:inline">Export PDF</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Executive Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">LinkedIn Network Analysis</h1>
              <p className="text-slate-600">
                Report generated on {new Date(analysisData.processedAt).toLocaleDateString()} • 
                <span className="font-medium"> {analysisData.fileName}</span>
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-amber-500 text-lg">⭐</span>
                <span className="font-semibold text-slate-900">{analysisData.userPlan.toUpperCase()} Analysis</span>
              </div>
              <p className="text-sm text-slate-500">Advanced Insights Enabled</p>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 text-2xl">👥</span>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">{analysisData.stats.connections.toLocaleString()}</div>
              <div className="text-sm text-slate-500">Connections</div>
              <div className="text-xs text-emerald-600 font-medium mt-1">
                {analysisData.stats.connections > 1000 ? 'Top 15% globally' : 'Growing network'}
              </div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-emerald-600 text-2xl">💬</span>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">{analysisData.stats.messages.toLocaleString()}</div>
              <div className="text-sm text-slate-500">Messages</div>
              <div className="text-xs text-emerald-600 font-medium mt-1">
                {analysisData.stats.messages > 100 ? 'Active networker' : 'Growing engagement'}
              </div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 text-2xl">📝</span>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">{analysisData.stats.posts.toLocaleString()}</div>
              <div className="text-sm text-slate-500">Posts</div>
              <div className="text-xs text-emerald-600 font-medium mt-1">
                {analysisData.stats.posts > 10 ? 'Thought leader' : 'Content creator'}
              </div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-orange-600 text-2xl">🏢</span>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">{analysisData.stats.companies.toLocaleString()}</div>
              <div className="text-sm text-slate-500">Companies</div>
              <div className="text-xs text-emerald-600 font-medium mt-1">Diverse network</div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-amber-600 text-2xl">🏆</span>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">{analysisData.analytics.skillsCount}</div>
              <div className="text-sm text-slate-500">Skills</div>
              <div className="text-xs text-emerald-600 font-medium mt-1">Expert profile</div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-rose-600 text-2xl">📈</span>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">
                {analysisData.stats.connections > 1000 ? 'Elite' : 'Growing'}
              </div>
              <div className="text-sm text-slate-500">Network Tier</div>
              <div className="text-xs text-emerald-600 font-medium mt-1">Professional level</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-8">
          <div className="border-b border-slate-200">
            <nav className="flex space-x-8 px-6 overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'industries', label: 'Industries', icon: '🏢' },
                { id: 'geography', label: 'Geography', icon: '🌍' },
                { id: 'insights', label: 'Insights', icon: '🎯' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Network Summary */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                    <h3 className="font-semibold text-blue-900 mb-2">Network Strength</h3>
                    <p className="text-3xl font-bold text-blue-800 mb-1">
                      {analysisData.stats.connections > 1000 ? 'Elite' : 'Professional'}
                    </p>
                    <p className="text-blue-700 text-sm">
                      {analysisData.stats.connections > 1000 ? 'Top 15% of LinkedIn users' : 'Growing professional network'}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl">
                    <h3 className="font-semibold text-emerald-900 mb-2">Communication</h3>
                    <p className="text-3xl font-bold text-emerald-800 mb-1">
                      {analysisData.stats.messages > 100 ? 'Active' : 'Moderate'}
                    </p>
                    <p className="text-emerald-700 text-sm">
                      {analysisData.stats.messages.toLocaleString()} total messages
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
                    <h3 className="font-semibold text-purple-900 mb-2">Content Creation</h3>
                    <p className="text-3xl font-bold text-purple-800 mb-1">
                      {analysisData.stats.posts > 50 ? 'Prolific' : 'Regular'}
                    </p>
                    <p className="text-purple-700 text-sm">
                      {analysisData.stats.posts.toLocaleString()} posts published
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl">
                    <h3 className="font-semibold text-amber-900 mb-2">Industry Reach</h3>
                    <p className="text-3xl font-bold text-amber-800 mb-1">
                      {Object.keys(analysisData.analytics.industries).length}
                    </p>
                    <p className="text-amber-700 text-sm">
                      Industry sectors represented
                    </p>
                  </div>
                </div>

                {/* Top Companies */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Company Connections</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {companyData.slice(0, 6).map((company, index) => (
                      <div key={company.name} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          ></div>
                          <span className="font-medium text-slate-900">{company.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-slate-900">{company.value.toLocaleString()}</div>
                          <div className="text-sm text-slate-500">{company.percentage}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'industries' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-6">Industry Distribution</h3>
                  <div className="space-y-4">
                    {industryData.map((industry, index) => (
                      <div key={industry.name} className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          ></div>
                          <span className="font-medium text-slate-900">{industry.name}</span>
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="text-right">
                            <div className="font-semibold text-slate-900">{industry.value.toLocaleString()}</div>
                            <div className="text-sm text-slate-500">{industry.percentage}% of network</div>
                          </div>
                          <div className="w-32 bg-slate-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full transition-all duration-500"
                              style={{ 
                                width: `${industry.percentageNum}%`,
                                backgroundColor: COLORS[index % COLORS.length]
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Industry Insights */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 bg-blue-50 rounded-xl border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">🚀 Technology Leadership</h4>
                    <p className="text-blue-800 text-sm">
                      {(industryData.find(i => i.name === 'Technology')?.percentageNum || 0) > 25 ? 
                        'Strong technology sector presence indicates innovation focus and digital transformation expertise.' :
                        'Growing technology connections suggest emerging interest in digital innovation.'
                      }
                    </p>
                  </div>
                  <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-200">
                    <h4 className="font-semibold text-emerald-900 mb-2">💼 Industry Diversity</h4>
                    <p className="text-emerald-800 text-sm">
                      Your network spans {Object.keys(analysisData.analytics.industries).length} major industries, 
                      providing cross-sector insights and collaboration opportunities.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'geography' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-6">Geographic Distribution</h3>
                  <div className="space-y-4">
                    {locationData.map((location, index) => (
                      <div key={location.name} className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          ></div>
                          <span className="font-medium text-slate-900">{location.name}</span>
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="text-right">
                            <div className="font-semibold text-slate-900">{location.value.toLocaleString()}</div>
                            <div className="text-sm text-slate-500">{location.percentage}% of network</div>
                          </div>
                          <div className="w-32 bg-slate-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full transition-all duration-500"
                              style={{ 
                                width: `${Math.min(location.percentageNum, 100)}%`,
                                backgroundColor: COLORS[index % COLORS.length]
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Geographic Insights */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="p-6 bg-blue-50 rounded-xl border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">🌍 Global Reach</h4>
                    <p className="text-blue-800 text-sm">
                      Your network spans {Object.keys(analysisData.analytics.locations).length} major regions, 
                      indicating strong international presence.
                    </p>
                  </div>
                  <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-200">
                    <h4 className="font-semibold text-emerald-900 mb-2">🏙️ Market Access</h4>
                    <p className="text-emerald-800 text-sm">
                      Strong presence in key business hubs provides access to major markets and opportunities.
                    </p>
                  </div>
                  <div className="p-6 bg-amber-50 rounded-xl border border-amber-200">
                    <h4 className="font-semibold text-amber-900 mb-2">🤝 Cultural Diversity</h4>
                    <p className="text-amber-800 text-sm">
                      Diverse geographic network enables cross-cultural collaboration and global perspectives.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'insights' && (
              <div className="space-y-8">
                {/* Key Insights */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-6">Strategic Insights</h3>
                  <div className="space-y-4">
                    {analysisData.insights.map((insight, index) => (
                      <div key={index} className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                        <div className="flex items-start space-x-4">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-white text-sm font-bold">{index + 1}</span>
                          </div>
                          <p className="text-slate-700 leading-relaxed">{insight}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-6">Strategic Recommendations</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-200">
                      <h4 className="font-semibold text-emerald-900 mb-3 flex items-center">
                        <span className="mr-2">🎯</span>
                        Network Expansion
                      </h4>
                      <p className="text-emerald-800 mb-4 text-sm leading-relaxed">
                        {analysisData.stats.connections < 1000 ? 
                          'Focus on quality connections in your target industries to reach the 1,000+ milestone and unlock elite networking benefits.' :
                          'Consider expanding into emerging markets and adjacent industries to diversify your professional network further.'
                        }
                      </p>
                      <div className="text-emerald-700 font-medium text-sm">
                        → Recommended: +{Math.max(50, Math.floor(analysisData.stats.connections * 0.1))} targeted connections
                      </div>
                    </div>

                    <div className="p-6 bg-blue-50 rounded-xl border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                        <span className="mr-2">📈</span>
                        Content Strategy
                      </h4>
                      <p className="text-blue-800 mb-4 text-sm leading-relaxed">
                        {analysisData.stats.posts < 50 ? 
                          'Increase your posting frequency to establish thought leadership and engage your growing network more effectively.' :
                          'Maintain your excellent content creation pace and consider diversifying into video content and industry insights.'
                        }
                      </p>
                      <div className="text-blue-700 font-medium text-sm">
                        → Recommended: {analysisData.stats.posts < 50 ? '2-3 posts per week' : 'Maintain current frequency'}
                      </div>
                    </div>

                    <div className="p-6 bg-purple-50 rounded-xl border border-purple-200">
                      <h4 className="font-semibold text-purple-900 mb-3 flex items-center">
                        <span className="mr-2">🤝</span>
                        Engagement Optimization
                      </h4>
                      <p className="text-purple-800 mb-4 text-sm leading-relaxed">
                        {analysisData.stats.messages < 100 ? 
                          'Increase direct messaging and commenting to build stronger relationships with your existing connections.' :
                          'Your communication level is excellent. Focus on strategic relationship building with key industry leaders.'
                        }
                      </p>
                      <div className="text-purple-700 font-medium text-sm">
                        → Target: {analysisData.stats.messages < 100 ? 'Increase by 50%' : 'Quality over quantity'}
                      </div>
                    </div>

                    <div className="p-6 bg-amber-50 rounded-xl border border-amber-200">
                      <h4 className="font-semibold text-amber-900 mb-3 flex items-center">
                        <span className="mr-2">🏆</span>
                        Skills Development
                      </h4>
                      <p className="text-amber-800 mb-4 text-sm leading-relaxed">
                        {analysisData.analytics.skillsCount < 15 ? 
                          'Add more skills to your profile and seek endorsements to increase your professional credibility and discoverability.' :
                          'Excellent skills portfolio. Focus on getting endorsements from your network to validate your expertise.'
                        }
                      </p>
                      <div className="text-amber-700 font-medium text-sm">
                        → Goal: {analysisData.analytics.skillsCount < 15 ? '15+ skills with endorsements' : 'Increase endorsement quality'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Export Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Export & Share</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <button 
              onClick={handleExportPDF}
              className="flex items-center space-x-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <span className="text-slate-600 text-xl">📥</span>
              <div className="text-left">
                <div className="font-medium text-slate-900">Download PDF Report</div>
                <div className="text-sm text-slate-500">Full analysis with insights</div>
              </div>
            </button>

            <button 
              onClick={handleExportCSV}
              className="flex items-center space-x-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <span className="text-slate-600 text-xl">📊</span>
              <div className="text-left">
                <div className="font-medium text-slate-900">Export Data (CSV)</div>
                <div className="text-sm text-slate-500">Raw data for analysis</div>
              </div>
            </button>

            <button 
              onClick={handleShareReport}
              className="flex items-center space-x-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <span className="text-slate-600 text-xl">📤</span>
              <div className="text-left">
                <div className="font-medium text-slate-900">Share Report</div>
                <div className="text-sm text-slate-500">Generate shareable link</div>
              </div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
