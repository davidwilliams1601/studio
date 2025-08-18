"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function Results() {
  const [results, setResults] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const storedResults = sessionStorage.getItem("analysisResults");
    if (storedResults) {
      const data = JSON.parse(storedResults);
      setResults(data);
      
      // Automatically generate AI insights
      generateAiInsights(data);
    }
    setLoading(false);
  }, []);

  const generateAiInsights = async (data) => {
    setAiLoading(true);
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
        console.log('AI insights generated successfully');
      } else {
        console.error('AI insights generation failed:', aiData.error);
      }
    } catch (error) {
      console.error('Error generating AI insights:', error);
    } finally {
      setAiLoading(false);
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
      value: count,
      percentage: ((count / results.stats.connections) * 100).toFixed(1)
    })) : [];

  const geographicData = results.analytics?.locations ? 
    Object.entries(results.analytics.locations)
      .sort(([,a], [,b]) => b - a)
      .map(([location, count]) => ({
        name: location,
        value: count,
        percentage: ((count / results.stats.connections) * 100).toFixed(1)
      })) : [];

  const topRegions = geographicData.slice(0, 5);

  const engagementMetrics = [
    { 
      metric: 'Content Creation Rate', 
      value: Math.round((results.stats.posts / results.stats.connections) * 1000) / 10,
      description: 'Posts per 1000 connections',
      unit: '/1k'
    },
    { 
      metric: 'Engagement Rate', 
      value: results.stats.posts > 0 ? Math.round((results.stats.comments || 0) / results.stats.posts * 10) / 10 : 0,
      description: 'Comments per post shared',
      unit: '/post'
    },
    { 
      metric: 'Network Diversity', 
      value: Object.keys(results.analytics?.locations || {}).length,
      description: 'Different countries/regions',
      unit: ' regions'
    },
    { 
      metric: 'Professional Skills', 
      value: results.analytics?.skillsCount || 0,
      description: 'Skills listed on profile',
      unit: ' skills'
    }
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "2rem" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div style={{ marginBottom: "2rem" }}>
          <a href="/dashboard" style={{ color: "#3b82f6", textDecoration: "none" }}>← Back to Dashboard</a>
        </div>
        
        <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "#1e293b", marginBottom: "1rem" }}>AI-Powered LinkedIn Analytics</h1>
        <p style={{ color: "#64748b", marginBottom: "2rem" }}>
          File: {results.fileName} • Processed: {new Date(results.processedAt).toLocaleDateString()}
        </p>

        {/* AI Insights Section */}
        {aiLoading && (
          <div style={{ background: "white", padding: "2rem", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", marginBottom: "2rem", textAlign: "center" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>🤖</div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "0.5rem" }}>Generating AI Insights...</h3>
            <p style={{ color: "#64748b" }}>Analyzing your LinkedIn data with artificial intelligence</p>
          </div>
        )}

        {aiInsights && (
          <div style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "2rem", borderRadius: "12px", marginBottom: "3rem", color: "white" }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "2rem" }}>
              <div style={{ fontSize: "2rem", marginRight: "1rem" }}>🤖</div>
              <div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>AI-Powered Professional Insights</h2>
                <p style={{ opacity: 0.9 }}>Personalized recommendations based on your LinkedIn data analysis</p>
              </div>
            </div>

            {/* Network Health Score */}
            <div style={{ background: "rgba(255,255,255,0.1)", padding: "1.5rem", borderRadius: "8px", marginBottom: "2rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "bold" }}>Network Health Score</h3>
                <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{aiInsights.networkHealth?.score}/100</div>
              </div>
              <p style={{ opacity: 0.9, marginBottom: "1rem" }}>{aiInsights.networkHealth?.assessment}</p>
              <div style={{ display: "grid", gap: "0.5rem" }}>
                {aiInsights.networkHealth?.recommendations?.map((rec, index) => (
                  <div key={index} style={{ fontSize: "0.875rem", opacity: 0.8 }}>• {rec}</div>
                ))}
              </div>
            </div>

            {/* Key AI Insights */}
            <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "1fr 1fr" }}>
              <div style={{ background: "rgba(255,255,255,0.1)", padding: "1.5rem", borderRadius: "8px" }}>
                <h4 style={{ fontSize: "1.125rem", fontWeight: "bold", marginBottom: "1rem" }}>🎯 Key Insights</h4>
                <div style={{ display: "grid", gap: "0.5rem" }}>
                  {aiInsights.keyInsights?.slice(0, 3).map((insight, index) => (
                    <div key={index} style={{ fontSize: "0.875rem", opacity: 0.9 }}>• {insight}</div>
                  ))}
                </div>
              </div>

              <div style={{ background: "rgba(255,255,255,0.1)", padding: "1.5rem", borderRadius: "8px" }}>
                <h4 style={{ fontSize: "1.125rem", fontWeight: "bold", marginBottom: "1rem" }}>📈 Content Strategy</h4>
                <div style={{ marginBottom: "0.5rem" }}>
                  <strong>Rating:</strong> {aiInsights.contentStrategy?.rating || 'Good'}
                </div>
                <div style={{ fontSize: "0.875rem", opacity: 0.9" }}>
                  {aiInsights.contentStrategy?.advice}
                </div>
              </div>
            </div>

            {/* Action Items */}
            <div style={{ marginTop: "2rem" }}>
              <h4 style={{ fontSize: "1.125rem", fontWeight: "bold", marginBottom: "1rem" }}>⚡ Priority Action Items</h4>
              <div style={{ display: "grid", gap: "1rem" }}>
                {aiInsights.actionItems?.slice(0, 3).map((item, index) => (
                  <div key={index} style={{ background: "rgba(255,255,255,0.1)", padding: "1rem", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <div style={{ flex: 1 }}>
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
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Summary Cards */}
        <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", marginBottom: "3rem" }}>
          <div style={{ background: "white", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#3b82f6", marginBottom: "0.5rem" }}>
              {results.stats.connections.toLocaleString()}
            </div>
            <p style={{ color: "#64748b", fontWeight: "500" }}>Total Connections</p>
          </div>
          
          <div style={{ background: "white", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#10b981", marginBottom: "0.5rem" }}>
              {Object.keys(results.analytics?.industries || {}).length}
            </div>
            <p style={{ color: "#64748b", fontWeight: "500" }}>Industry Sectors</p>
          </div>
          
          <div style={{ background: "white", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#f59e0b", marginBottom: "0.5rem" }}>
              {Object.keys(results.analytics?.locations || {}).length}
            </div>
            <p style={{ color: "#64748b", fontWeight: "500" }}>Countries/Regions</p>
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
          </div>
        </div>

        {/* Geographic Distribution */}
        <div style={{ background: "white", padding: "2rem", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", marginBottom: "2rem" }}>
          <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1.5rem", textAlign: "center" }}>
            🌍 Geographic Distribution
          </h3>
          
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
        </div>

        {/* Professional Metrics */}
        <div style={{ background: "white", padding: "2rem", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", marginBottom: "2rem" }}>
          <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1.5rem", textAlign: "center" }}>
            📈 Professional Metrics
          </h3>
          <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
            {engagementMetrics.map((metric, index) => (
              <div key={index} style={{ textAlign: "center", padding: "1.5rem", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
                <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#3b82f6", marginBottom: "0.5rem" }}>
                  {metric.value}{metric.unit}
                </div>
                <div style={{ fontWeight: "600", marginBottom: "0.5rem" }}>{metric.metric}</div>
                <div style={{ fontSize: "0.875rem", color: "#64748b" }}>{metric.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Traditional Insights */}
        <div style={{ background: "white", padding: "2rem", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", marginBottom: "2rem" }}>
          <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1rem" }}>🎯 Data Insights</h3>
          <div style={{ display: "grid", gap: "0.5rem", gridTemplateColumns: "1fr 1fr" }}>
            {results.insights.map((insight, index) => (
              <div key={index} style={{ padding: "0.75rem", background: "#f8fafc", borderRadius: "4px", fontSize: "0.875rem", color: "#64748b" }}>
                • {insight}
              </div>
            ))}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
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
            🤖 Download AI Report
          </button>
          {!aiInsights && !aiLoading && (
            <button 
              onClick={() => generateAiInsights(results)}
              style={{ 
                padding: "1rem 2rem", 
                background: "#8b5cf6", 
                color: "white", 
                border: "none", 
                borderRadius: "8px", 
                fontWeight: "bold", 
                cursor: "pointer" 
              }}
            >
              🧠 Generate AI Insights
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
