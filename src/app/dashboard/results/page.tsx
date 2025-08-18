"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function Results() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedResults = sessionStorage.getItem("analysisResults");
    if (storedResults) {
      setResults(JSON.parse(storedResults));
    }
    setLoading(false);
  }, []);

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

  // Engagement ratios - actual calculated metrics
  const engagementMetrics = [
    { 
      metric: 'Posts per 100 Connections', 
      value: Math.round((results.stats.posts / results.stats.connections) * 100 * 10) / 10,
      description: 'How actively you share content relative to your network size'
    },
    { 
      metric: 'Comments per Post', 
      value: results.stats.posts > 0 ? Math.round((results.stats.comments || 0) / results.stats.posts * 10) / 10 : 0,
      description: 'Average comments you make per post you share'
    },
    { 
      metric: 'Messages per 100 Connections', 
      value: Math.round((results.stats.messages / results.stats.connections) * 100 * 10) / 10,
      description: 'How actively you message relative to your network size'
    }
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "2rem" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div style={{ marginBottom: "2rem" }}>
          <a href="/dashboard" style={{ color: "#3b82f6", textDecoration: "none" }}>← Back to Dashboard</a>
        </div>
        
        <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "#1e293b", marginBottom: "1rem" }}>LinkedIn Analytics Dashboard</h1>
        <p style={{ color: "#64748b", marginBottom: "2rem" }}>
          File: {results.fileName} • Processed: {new Date(results.processedAt).toLocaleDateString()}
        </p>
        
        {/* Summary Cards */}
        <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", marginBottom: "3rem" }}>
          <div style={{ background: "white", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#3b82f6", marginBottom: "0.5rem" }}>
              {results.stats.connections.toLocaleString()}
            </div>
            <p style={{ color: "#64748b", fontWeight: "500" }}>Connections</p>
          </div>
          
          <div style={{ background: "white", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#10b981", marginBottom: "0.5rem" }}>
              {results.stats.posts.toLocaleString()}
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
              {(results.stats.comments || 0).toLocaleString()}
            </div>
            <p style={{ color: "#64748b", fontWeight: "500" }}>Comments</p>
          </div>
        </div>

        {/* Charts Section */}
        <div style={{ display: "grid", gap: "2rem", gridTemplateColumns: "1fr 1fr", marginBottom: "2rem" }}>
          
          {/* Activity Overview Bar Chart */}
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

          {/* Activity Distribution Pie Chart */}
          <div style={{ background: "white", padding: "2rem", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1.5rem", textAlign: "center" }}>
              🥧 Activity Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={activityData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {activityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Engagement Metrics - Real calculated data */}
        <div style={{ background: "white", padding: "2rem", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", marginBottom: "2rem" }}>
          <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1.5rem", textAlign: "center" }}>
            📈 Engagement Metrics (Based on Your Data)
          </h3>
          <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
            {engagementMetrics.map((metric, index) => (
              <div key={index} style={{ textAlign: "center", padding: "1rem", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
                <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#3b82f6", marginBottom: "0.5rem" }}>
                  {metric.value}
                </div>
                <div style={{ fontWeight: "600", marginBottom: "0.5rem" }}>{metric.metric}</div>
                <div style={{ fontSize: "0.875rem", color: "#64748b" }}>{metric.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Insights */}
        <div style={{ background: "white", padding: "2rem", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", marginBottom: "2rem" }}>
          <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1rem" }}>🎯 Key Insights</h3>
          <ul style={{ lineHeight: "1.8", color: "#64748b" }}>
            {results.insights.map((insight, index) => (
              <li key={index} style={{ marginBottom: "0.5rem" }}>{insight}</li>
            ))}
          </ul>
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
              const dataStr = JSON.stringify(results, null, 2);
              const dataBlob = new Blob([dataStr], {type: 'application/json'});
              const url = URL.createObjectURL(dataBlob);
              const link = document.createElement('a');
              link.href = url;
              link.download = 'linkedin-analysis.json';
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
            📊 Download Data
          </button>
        </div>
      </div>
    </div>
  );
}
