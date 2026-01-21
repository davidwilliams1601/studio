"use client";


import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface Stats {
  connections: number;
  posts: number;
  messages: number;
  comments: number;
  companies: number;
  skillsCount?: number;
}

interface Analytics {
  industries?: Record<string, number>;
  locations?: Record<string, number>;
}

interface AnalysisData {
  id?: string; // Backup ID for CSV export
  stats: Stats;
  analytics: Analytics;
  fileName?: string;
  processedAt?: string;
  insights?: string[];
  profile?: {
    firstName: string;
    lastName: string;
    headline: string;
    industry: string;
    summary: string;
  };
  topValueConnections?: Array<{
    name: string;
    company: string;
    position: string;
    reason: string;
  }>;
  contentStrategy?: {
    currentActivity: string;
    recommendations: string[];
    contentIdeas: string[];
    postingFrequency: string;
  };
  introductionMatches?: Array<{
    person1: string;
    person2: string;
    reason: string;
    introTemplate: string;
  }>;
}

interface NetworkHealth {
  score: number;
  assessment: string;
  recommendations?: string[];
}

interface ContentStrategy {
  rating: string;
  advice: string;
  suggestions?: string[];
}

interface ActionItem {
  priority: string;
  action: string;
  timeline: string;
  expectedImpact: string;
}

interface AiInsights {
  networkHealth?: NetworkHealth;
  contentStrategy?: ContentStrategy;
  keyInsights?: string[];
  actionItems?: ActionItem[];
}

export default function Results() {
  const [results, setResults] = useState<AnalysisData | null>(null);
  const [aiInsights, setAiInsights] = useState<AiInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);

  useEffect(() => {
    try {
      const storedResults = sessionStorage.getItem("analysisResults");
      if (storedResults) {
        const data = JSON.parse(storedResults);
        setResults(data);
        console.log("Data loaded for AI analysis:", data);
        console.log("📊 Connection count:", data.stats?.connections);
        console.log("📊 All stats:", data.stats);
      } else {
        console.warn("⚠️ No analysis results found in session storage");
      }
    } catch (error) {
      console.error("❌ Error loading results:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const generateAiInsights = async (data: AnalysisData) => {
    console.log("Starting AI insights generation...");
    setAiLoading(true);
    setAiError(null);
    
    try {
      const response = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stats: data.stats,
          analytics: data.analytics,
          fileName: data.fileName
        }),
      });

      const aiData = await response.json();
      
      if (aiData.success) {
        setAiInsights(aiData.insights);
        console.log('✅ AI insights generated successfully');
      } else {
        console.error('❌ AI insights generation failed:', aiData.error);
        setAiError(aiData.error);
      }
    } catch (error: any) {
      console.error('❌ Error generating AI insights:', error);
      setAiError(error?.message || 'Unknown error');
    } finally {
      setAiLoading(false);
    }
  };

  const generatePDF = async () => {
    setPdfLoading(true);
    try {
      console.log("Generating PDF report...");

      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysisData: results,
          aiInsights: aiInsights
        }),
      });

      const pdfData = await response.json();

      if (pdfData.success) {
        // Create a new window with the HTML content for PDF generation
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(pdfData.html);
          printWindow.document.close();

          // Wait for content to load, then trigger print
          setTimeout(() => {
            if (printWindow) {
              printWindow.focus();
              printWindow.print();
            }
          }, 1000);
        }


        console.log('✅ PDF generated successfully');
      } else {
        throw new Error(pdfData.error);
      }
    } catch (error: any) {
      console.error('❌ Error generating PDF:', error);
      alert('Failed to generate PDF: ' + (error?.message || 'Unknown error'));
    } finally {
      setPdfLoading(false);
    }
  };

  const exportConnectionsCSV = async () => {
    if (!results?.id) {
      alert('Backup ID not found. Please try re-uploading your data.');
      return;
    }

    setCsvLoading(true);
    try {
      console.log("Exporting connections as CSV...");

      // Get auth token (assuming you're using Firebase Auth)
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        throw new Error('Not authenticated');
      }

      const idToken = await user.getIdToken();

      const response = await fetch(`/api/backups/${results.id}/export-connections`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to export connections');
      }

      // Download the CSV file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `linkedin-connections-${results.id}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('✅ Connections exported successfully');
    } catch (error: any) {
      console.error('❌ Error exporting connections:', error);
      alert('Failed to export connections: ' + (error?.message || 'Unknown error'));
    } finally {
      setCsvLoading(false);
    }
  };

  if (loading) {
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

  // Prepare data for charts
  const activityData = [
    { name: 'Connections', value: results.stats.connections, color: '#3b82f6' },
    { name: 'Posts/Shares', value: results.stats.posts, color: '#10b981' },
    { name: 'Messages', value: results.stats.messages, color: '#f59e0b' },
    { name: 'Comments', value: results.stats.comments || 0, color: '#ef4444' },
    { name: 'Companies', value: results.stats.companies || 0, color: '#8b5cf6' }
  ];

  const industryData = results.analytics?.industries ?
    Object.entries(results.analytics.industries).map(([industry, count]) => ({
      name: industry,
      value: count as number,
      percentage: (((count as number) / results.stats.connections) * 100).toFixed(1)
    })) : [];

  const geographicData = results.analytics?.locations ?
    Object.entries(results.analytics.locations)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .map(([location, count]) => ({
        name: location,
        value: count as number,
        percentage: (((count as number) / results.stats.connections) * 100).toFixed(1)
      })) : [];

  const topRegions = geographicData.slice(0, 5);
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "2rem" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div style={{ marginBottom: "2rem" }}>
          <a href="/dashboard" style={{ color: "#3b82f6", textDecoration: "none" }}>← Back to Dashboard</a>
        </div>
        
        <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "#1e293b", marginBottom: "1rem" }}>AI-Powered LinkedIn Analytics</h1>
        <p style={{ color: "#64748b", marginBottom: "2rem" }}>
          File: {results.fileName} • Processed: {results.processedAt ? new Date(results.processedAt).toLocaleDateString() : 'N/A'}
        </p>

        {/* Generated Insights from Analysis */}
        {results.insights && results.insights.length > 0 && (
          <div style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "2rem", borderRadius: "12px", color: "white", marginBottom: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "1.5rem" }}>
              <div style={{ fontSize: "2rem", marginRight: "1rem" }}>✨</div>
              <div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.25rem" }}>AI-Powered Insights</h2>
                <p style={{ opacity: 0.9, fontSize: "0.875rem" }}>Personalized recommendations based on your LinkedIn network data</p>
              </div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.1)", padding: "1.5rem", borderRadius: "8px" }}>
              <div style={{ display: "grid", gap: "1rem" }}>
                {results.insights.map((insight: string, index: number) => (
                  <div key={index} style={{ display: "flex", gap: "0.75rem", alignItems: "start" }}>
                    <span style={{
                      minWidth: "24px",
                      height: "24px",
                      background: "rgba(255,255,255,0.2)",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                      fontSize: "0.875rem"
                    }}>
                      {index + 1}
                    </span>
                    <p style={{ margin: 0, lineHeight: "1.6", flex: 1 }}>{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Strategic Connection Recommendations */}
        {results.topValueConnections && results.topValueConnections.length > 0 && (
          <div style={{ background: "white", padding: "2rem", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", marginBottom: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "1.5rem" }}>
              <div style={{ fontSize: "2rem", marginRight: "1rem" }}>🎯</div>
              <div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1e293b", marginBottom: "0.25rem" }}>
                  Who You Should Be Reaching Out To
                </h2>
                <p style={{ fontSize: "0.875rem", color: "#64748b" }}>
                  Strategic connection types to seek out for maximum career impact based on your profile as {results.profile?.headline}
                </p>
              </div>
            </div>
            <div style={{ display: "grid", gap: "1rem" }}>
              {results.topValueConnections.map((connection, index) => (
                <div
                  key={index}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "1.25rem",
                    background: "#fafafa",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#3b82f6";
                    e.currentTarget.style.background = "#eff6ff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e5e7eb";
                    e.currentTarget.style.background = "#fafafa";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "start", gap: "1rem" }}>
                    <div style={{
                      minWidth: "32px",
                      height: "32px",
                      background: "#3b82f6",
                      color: "white",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                      fontSize: "1rem"
                    }}>
                      {index + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontWeight: "bold",
                        color: "#1e40af",
                        marginBottom: "0.5rem",
                        fontSize: "1.25rem",
                        textDecoration: "underline",
                        textDecorationColor: "#93c5fd",
                        textUnderlineOffset: "4px"
                      }}>
                        {connection.name}
                      </div>
                      <div style={{
                        fontSize: "0.9rem",
                        color: "#1e293b",
                        marginBottom: "0.75rem",
                        background: "#f1f5f9",
                        padding: "0.5rem 0.75rem",
                        borderRadius: "6px",
                        display: "inline-block"
                      }}>
                        <span style={{ fontWeight: "600" }}>{connection.position}</span> at <span style={{ fontWeight: "600", color: "#3b82f6" }}>{connection.company}</span>
                      </div>
                      <div style={{ fontSize: "0.875rem", color: "#374151", lineHeight: "1.6", marginTop: "0.75rem" }}>
                        <div style={{
                          borderLeft: "3px solid #3b82f6",
                          paddingLeft: "0.75rem",
                          fontStyle: "italic"
                        }}>
                          {connection.reason}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content Strategy */}
        {results.contentStrategy && (
          <div style={{ background: "white", padding: "2rem", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", marginBottom: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "1.5rem" }}>
              <div style={{ fontSize: "2rem", marginRight: "1rem" }}>📝</div>
              <div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1e293b", marginBottom: "0.25rem" }}>
                  Content Strategy & Ideas
                </h2>
                <p style={{ fontSize: "0.875rem", color: "#64748b" }}>
                  Personalized recommendations to grow your LinkedIn presence
                </p>
              </div>
            </div>

            {/* Current Activity */}
            {results.contentStrategy.currentActivity && (
              <div style={{ background: "#f0f9ff", padding: "1rem", borderRadius: "8px", marginBottom: "1.5rem", borderLeft: "4px solid #3b82f6" }}>
                <div style={{ fontSize: "0.875rem", fontWeight: "600", color: "#1e40af", marginBottom: "0.25rem" }}>
                  Current Activity Assessment
                </div>
                <div style={{ color: "#1e293b" }}>
                  {results.contentStrategy.currentActivity}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {results.contentStrategy.recommendations.length > 0 && (
              <div style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1.125rem", fontWeight: "bold", color: "#1e293b", marginBottom: "1rem" }}>
                  📊 Strategic Recommendations
                </h3>
                <div style={{ display: "grid", gap: "0.75rem" }}>
                  {results.contentStrategy.recommendations.map((rec, index) => (
                    <div key={index} style={{
                      padding: "1rem",
                      background: "#fafafa",
                      borderRadius: "6px",
                      borderLeft: "3px solid #10b981"
                    }}>
                      <div style={{ display: "flex", gap: "0.75rem" }}>
                        <span style={{
                          minWidth: "24px",
                          height: "24px",
                          background: "#10b981",
                          color: "white",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.875rem",
                          fontWeight: "bold",
                          flexShrink: 0
                        }}>
                          {index + 1}
                        </span>
                        <p style={{ margin: 0, color: "#374151", lineHeight: "1.6" }}>{rec}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Content Ideas */}
            {results.contentStrategy.contentIdeas.length > 0 && (
              <div style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1.125rem", fontWeight: "bold", color: "#1e293b", marginBottom: "1rem" }}>
                  💡 Content Ideas to Post About
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "0.75rem" }}>
                  {results.contentStrategy.contentIdeas.map((idea, index) => (
                    <div key={index} style={{
                      padding: "1rem",
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "white",
                      borderRadius: "8px",
                      fontSize: "0.875rem",
                      lineHeight: "1.6"
                    }}>
                      <div style={{ fontWeight: "600", marginBottom: "0.25rem" }}>Topic {index + 1}</div>
                      {idea}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Posting Frequency */}
            {results.contentStrategy.postingFrequency && (
              <div style={{ background: "#fef3c7", padding: "1rem", borderRadius: "8px", borderLeft: "4px solid #f59e0b" }}>
                <div style={{ fontSize: "0.875rem", fontWeight: "600", color: "#92400e", marginBottom: "0.25rem" }}>
                  Recommended Posting Frequency
                </div>
                <div style={{ color: "#78350f" }}>
                  {results.contentStrategy.postingFrequency}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Introduction Matchmaker */}
        {results.introductionMatches && results.introductionMatches.length > 0 && (
          <div style={{ background: "white", padding: "2rem", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", marginBottom: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "1.5rem" }}>
              <div style={{ fontSize: "2rem", marginRight: "1rem" }}>🤝</div>
              <div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1e293b", marginBottom: "0.25rem" }}>
                  Introduction Matchmaker
                </h2>
                <p style={{ fontSize: "0.875rem", color: "#64748b" }}>
                  Valuable introduction opportunities in your network - connect people who should know each other
                </p>
              </div>
            </div>

            <div style={{ display: "grid", gap: "1.5rem" }}>
              {results.introductionMatches.map((match, index) => (
                <div key={index} style={{
                  border: "2px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  background: "#fafafa",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#10b981";
                  e.currentTarget.style.background = "#f0fdf4";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e5e7eb";
                  e.currentTarget.style.background = "#fafafa";
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                    <div style={{
                      minWidth: "40px",
                      height: "40px",
                      background: "#10b981",
                      color: "white",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                      fontSize: "1.125rem"
                    }}>
                      {index + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "1.125rem", fontWeight: "bold", color: "#1e293b" }}>
                        {match.person1} <span style={{ color: "#10b981", fontSize: "1.5rem" }}>+</span> {match.person2}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: "1rem", paddingLeft: "3.5rem" }}>
                    <div style={{ fontSize: "0.875rem", fontWeight: "600", color: "#64748b", marginBottom: "0.25rem" }}>
                      Why This Introduction Matters:
                    </div>
                    <div style={{ color: "#374151", lineHeight: "1.6" }}>
                      {match.reason}
                    </div>
                  </div>

                  <div style={{
                    background: "#f8fafc",
                    padding: "1rem",
                    borderRadius: "8px",
                    borderLeft: "3px solid #10b981",
                    marginLeft: "3.5rem"
                  }}>
                    <div style={{ fontSize: "0.75rem", fontWeight: "600", color: "#64748b", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      📧 Introduction Template
                    </div>
                    <div style={{ color: "#1e293b", fontStyle: "italic", lineHeight: "1.6", fontSize: "0.875rem" }}>
                      "{match.introTemplate}"
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Insights Section */}
        <div style={{ background: "white", padding: "2rem", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", marginBottom: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1e293b" }}>🤖 AI Insights</h2>
            <button 
              onClick={() => generateAiInsights(results)}
              disabled={aiLoading}
              style={{ 
                padding: "0.75rem 1.5rem", 
                background: aiLoading ? "#9ca3af" : "#8b5cf6", 
                color: "white", 
                border: "none", 
                borderRadius: "6px", 
                fontWeight: "bold", 
                cursor: aiLoading ? "not-allowed" : "pointer" 
              }}
            >
              {aiLoading ? "🔄 Generating..." : "🧠 Generate AI Insights"}
            </button>
          </div>

          {aiLoading && (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⏳</div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "0.5rem" }}>Analyzing Your LinkedIn Data...</h3>
              <p style={{ color: "#64748b" }}>Our AI is generating personalized insights and recommendations</p>
            </div>
          )}

          {aiError && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "1rem", borderRadius: "6px" }}>
              <strong>AI Error:</strong> {aiError}
              <br />
              <button 
                onClick={() => generateAiInsights(results)}
                style={{ marginTop: "0.5rem", padding: "0.5rem 1rem", background: "#dc2626", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
              >
                Retry
              </button>
            </div>
          )}

          {!aiInsights && !aiLoading && !aiError && (
            <div style={{ textAlign: "center", padding: "2rem", border: "2px dashed #d1d5db", borderRadius: "8px" }}>
              <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🤖</div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "0.5rem" }}>Ready for AI Analysis</h3>
              <p style={{ color: "#64748b", marginBottom: "1rem" }}>Click "Generate AI Insights" to get personalized recommendations based on your LinkedIn data</p>
            </div>
          )}

          {aiInsights && (
            <div style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "2rem", borderRadius: "12px", color: "white" }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: "2rem" }}>
                <div style={{ fontSize: "2rem", marginRight: "1rem" }}>🎯</div>
                <div>
                  <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>Professional Insights</h3>
                  <p style={{ opacity: 0.9 }}>Personalized recommendations based on your data</p>
                </div>
              </div>

              {/* Network Health Score */}
              {aiInsights.networkHealth && (
                <div style={{ background: "rgba(255,255,255,0.1)", padding: "1.5rem", borderRadius: "8px", marginBottom: "2rem" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                    <h4 style={{ fontSize: "1.25rem", fontWeight: "bold" }}>Network Health Score</h4>
                    <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{aiInsights.networkHealth.score}/100</div>
                  </div>
                  <p style={{ opacity: 0.9, marginBottom: "1rem" }}>{aiInsights.networkHealth.assessment}</p>
                  <div style={{ display: "grid", gap: "0.5rem" }}>
                    {aiInsights.networkHealth.recommendations?.map((rec: string, index: number) => (
                      <div key={index} style={{ fontSize: "0.875rem", opacity: 0.8 }}>• {rec}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Insights */}
              {aiInsights.keyInsights && (
                <div style={{ background: "rgba(255,255,255,0.1)", padding: "1.5rem", borderRadius: "8px", marginBottom: "2rem" }}>
                  <h4 style={{ fontSize: "1.125rem", fontWeight: "bold", marginBottom: "1rem" }}>🎯 Key Insights</h4>
                  <div style={{ display: "grid", gap: "0.5rem" }}>
                    {aiInsights.keyInsights.slice(0, 5).map((insight: string, index: number) => (
                      <div key={index} style={{ fontSize: "0.875rem", opacity: 0.9 }}>• {insight}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Items */}
              {aiInsights.actionItems && (
                <div>
                  <h4 style={{ fontSize: "1.125rem", fontWeight: "bold", marginBottom: "1rem" }}>⚡ Priority Actions</h4>
                  <div style={{ display: "grid", gap: "1rem" }}>
                    {aiInsights.actionItems.slice(0, 3).map((item: ActionItem, index: number) => (
                      <div key={index} style={{ background: "rgba(255,255,255,0.1)", padding: "1rem", borderRadius: "6px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                          <span style={{ 
                            background: item.priority === 'High' ? '#ef4444' : item.priority === 'Medium' ? '#f59e0b' : '#10b981',
                            color: 'white',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold'
                          }}>
                            {item.priority}
                          </span>
                          <span style={{ fontSize: "0.875rem", opacity: 0.8 }}>{item.timeline}</span>
                        </div>
                        <div style={{ fontWeight: "500", marginBottom: "0.25rem" }}>{item.action}</div>
                        <div style={{ fontSize: "0.875rem", opacity: 0.8 }}>{item.expectedImpact}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Summary Cards */}
        <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fit, minWidth(240px, 1fr))", marginBottom: "3rem" }}>
          <div style={{ background: "white", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#3b82f6", marginBottom: "0.5rem" }}>
              {results.stats.connections.toLocaleString()}
            </div>
            <p style={{ color: "#64748b", fontWeight: "500" }}>Total Connections</p>
          </div>
          
          <div style={{ background: "white", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#10b981", marginBottom: "0.5rem" }}>
              {results.stats.posts}
            </div>
            <p style={{ color: "#64748b", fontWeight: "500" }}>Posts & Shares</p>
          </div>
          
          <div style={{ background: "white", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#f59e0b", marginBottom: "0.5rem" }}>
              {results.stats.messages.toLocaleString()}
            </div>
            <p style={{ color: "#64748b", fontWeight: "500" }}>Messages</p>
          </div>
          
          <div style={{ background: "white", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#ef4444", marginBottom: "0.5rem" }}>
              {aiInsights?.networkHealth?.score || '—'}
            </div>
            <p style={{ color: "#64748b", fontWeight: "500" }}>AI Health Score</p>
          </div>
        </div>

        {/* Charts Section */}
        <div style={{ display: "grid", gap: "2rem", gridTemplateColumns: "1fr 1fr", marginBottom: "2rem" }}>
          
          {/* Activity Overview */}
          <div style={{ background: "white", padding: "2rem", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1.5rem", textAlign: "center" }}>
              📊 Activity Overview
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Industry Breakdown */}
          <div style={{ background: "white", padding: "2rem", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1.5rem", textAlign: "center" }}>
              🏢 Industry Distribution
            </h3>
            {industryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={industryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percentage }) => `${name} ${percentage}%`}
                    labelLine={false}
                  >
                    {industryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value.toLocaleString()} connections`, name]} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
                <p style={{ marginBottom: "0.5rem", fontWeight: "500" }}>Industry data not available</p>
                <p style={{ fontSize: "0.875rem" }}>LinkedIn didn't include detailed connection information in your export due to privacy settings.</p>
              </div>
            )}
          </div>
        </div>

        {/* Geographic Distribution */}
        <div style={{ background: "white", padding: "2rem", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", marginBottom: "2rem" }}>
          <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1.5rem", textAlign: "center" }}>
            🌍 Geographic Distribution
          </h3>

          {topRegions.length > 0 ? (
            <div style={{ marginBottom: "2rem" }}>
              <h4 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "1rem", color: "#374151" }}>Top Regions by Connection Count</h4>
              <div style={{ display: "grid", gap: "1rem" }}>
                {topRegions.map((region, index) => (
                  <div key={region.name} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{
                      minWidth: "140px",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem"
                    }}>
                      <span style={{
                        display: "inline-block",
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        backgroundColor: COLORS[index % COLORS.length]
                      }}></span>
                      {region.name}
                    </div>
                    <div style={{ flex: 1, background: "#f3f4f6", borderRadius: "4px", height: "24px", position: "relative" }}>
                      <div style={{
                        background: COLORS[index % COLORS.length],
                        height: "100%",
                        borderRadius: "4px",
                        width: `${(region.value / topRegions[0].value) * 100}%`,
                        transition: "width 0.3s ease"
                      }}></div>
                    </div>
                    <div style={{ minWidth: "80px", textAlign: "right", fontSize: "0.875rem", fontWeight: "600" }}>
                      {region.value.toLocaleString()}
                    </div>
                    <div style={{ minWidth: "50px", textAlign: "right", fontSize: "0.875rem", color: "#6b7280" }}>
                      {region.percentage}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
              <p style={{ marginBottom: "0.5rem", fontWeight: "500" }}>Geographic data not available</p>
              <p style={{ fontSize: "0.875rem", marginBottom: "1rem" }}>LinkedIn didn't include detailed connection information in your export due to privacy settings.</p>
              <p style={{ fontSize: "0.875rem", color: "#3b82f6" }}>💡 Try requesting a new data export from LinkedIn with connection details enabled.</p>
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
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
            📄 Print Report
          </button>
          
          <button 
            onClick={generatePDF}
            disabled={pdfLoading}
            style={{ 
              padding: "1rem 2rem", 
              background: pdfLoading ? "#9ca3af" : "#ef4444", 
              color: "white", 
              border: "none", 
              borderRadius: "8px", 
              fontWeight: "bold", 
              cursor: pdfLoading ? "not-allowed" : "pointer" 
            }}
          >
            {pdfLoading ? "🔄 Generating..." : "📑 Generate PDF Report"}
          </button>
          
          <button
            onClick={() => {
              const fullData = { ...results, aiInsights };
              const dataStr = JSON.stringify(fullData, null, 2);
              const dataBlob = new Blob([dataStr], {type: 'application/json'});
              const url = URL.createObjectURL(dataBlob);
              const link = document.createElement('a');
              link.href = url;
              link.download = 'linkedin-ai-analytics-report.json';
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
            🤖 Download Data
          </button>

          <button
            onClick={exportConnectionsCSV}
            disabled={csvLoading || !results?.id}
            style={{
              padding: "1rem 2rem",
              background: csvLoading || !results?.id ? "#9ca3af" : "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: "bold",
              cursor: csvLoading || !results?.id ? "not-allowed" : "pointer"
            }}
          >
            {csvLoading ? "🔄 Exporting..." : "📊 Export Connections CSV"}
          </button>
        </div>

        {/* Footer Links */}
        <div style={{
          display: "flex",
          gap: "1rem",
          justifyContent: "center",
          marginTop: "3rem",
          padding: "2rem",
          borderTop: "1px solid #e5e7eb"
        }}>
          <a href="/privacy" style={{
            color: "#64748b",
            textDecoration: "none",
            fontSize: "0.875rem"
          }}>
            Privacy Policy
          </a>
          <span style={{ color: "#e5e7eb" }}>•</span>
          <a href="/terms" style={{
            color: "#64748b",
            textDecoration: "none",
            fontSize: "0.875rem"
          }}>
            Terms of Service
          </a>
          <span style={{ color: "#e5e7eb" }}>•</span>
          <a href="/contact" style={{
            color: "#64748b",
            textDecoration: "none",
            fontSize: "0.875rem"
          }}>
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}
