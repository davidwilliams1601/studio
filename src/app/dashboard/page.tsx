"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const parseCSV = (csvText) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length <= 1) return [];
    
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    const rows = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = [];
      let current = '';
      let inQuotes = false;
      
      for (let j = 0; j < lines[i].length; j++) {
        const char = lines[i][j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      
      if (values.length === headers.length) {
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index]?.replace(/"/g, '') || '';
        });
        rows.push(row);
      }
    }
    
    return rows;
  };

  const processLinkedInZip = async (file) => {
    const JSZip = (await import('jszip')).default;
    const zip = await JSZip.loadAsync(file);
    
    const fileNames = Object.keys(zip.files);
    
    const results = {
      fileName: file.name,
      processedAt: new Date().toISOString(),
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
        connectionStrength: {},
        positions: [],
        topCompanies: {},
        skillsEndorsed: {},
        postEngagement: {}
      },
      insights: []
    };

    // Basic stats (keeping existing logic)
    const connectionsFile = fileNames.find(name => name === 'Connections.csv');
    if (connectionsFile) {
      const content = await zip.files[connectionsFile].async('text');
      const connectionData = parseCSV(content);
      results.stats.connections = connectionData.length;
      
      // Analyze industries and locations from connections
      connectionData.forEach(connection => {
        // Industry analysis
        const company = connection['Company'] || connection['Organization'] || '';
        if (company && company !== 'Unknown' && company.length > 1) {
          results.analytics.topCompanies[company] = (results.analytics.topCompanies[company] || 0) + 1;
        }
        
        // Location analysis
        const location = connection['Location'] || connection['Geographic Area'] || '';
        if (location && location !== 'Unknown' && location.length > 1) {
          results.analytics.locations[location] = (results.analytics.locations[location] || 0) + 1;
        }
        
        // Connection date analysis
        const connectedDate = connection['Connected On'] || connection['Date'] || '';
        if (connectedDate) {
          const year = new Date(connectedDate).getFullYear();
          if (year && year > 2000 && year <= new Date().getFullYear()) {
            results.analytics.connectionStrength[year] = (results.analytics.connectionStrength[year] || 0) + 1;
          }
        }
      });
    }

    // Analyze positions/experience
    const positionsFile = fileNames.find(name => name === 'Positions.csv');
    if (positionsFile) {
      const content = await zip.files[positionsFile].async('text');
      const positionData = parseCSV(content);
      results.analytics.positions = positionData.slice(0, 10); // Top 10 positions
      
      // Industry analysis from your own positions
      positionData.forEach(position => {
        const company = position['Company Name'] || position['Company'] || '';
        const title = position['Title'] || position['Position'] || '';
        
        // Simple industry categorization based on title/company keywords
        const techKeywords = ['software', 'developer', 'engineer', 'tech', 'IT', 'digital', 'data', 'AI', 'ML'];
        const financeKeywords = ['finance', 'bank', 'investment', 'trading', 'financial'];
        const consultingKeywords = ['consulting', 'consultant', 'advisory', 'strategy'];
        
        const titleLower = title.toLowerCase();
        const companyLower = company.toLowerCase();
        
        if (techKeywords.some(keyword => titleLower.includes(keyword) || companyLower.includes(keyword))) {
          results.analytics.industries['Technology'] = (results.analytics.industries['Technology'] || 0) + 1;
        } else if (financeKeywords.some(keyword => titleLower.includes(keyword) || companyLower.includes(keyword))) {
          results.analytics.industries['Finance'] = (results.analytics.industries['Finance'] || 0) + 1;
        } else if (consultingKeywords.some(keyword => titleLower.includes(keyword) || companyLower.includes(keyword))) {
          results.analytics.industries['Consulting'] = (results.analytics.industries['Consulting'] || 0) + 1;
        } else if (company) {
          results.analytics.industries['Other'] = (results.analytics.industries['Other'] || 0) + 1;
        }
      });
    }

    // Analyze skills and endorsements
    const skillsFile = fileNames.find(name => name === 'Skills.csv');
    if (skillsFile) {
      const content = await zip.files[skillsFile].async('text');
      const skillsData = parseCSV(content);
      skillsData.forEach(skill => {
        const skillName = skill['Skill'] || skill['Name'] || '';
        const endorsements = parseInt(skill['Endorsement Count'] || skill['Endorsements'] || '0');
        if (skillName && endorsements > 0) {
          results.analytics.skillsEndorsed[skillName] = endorsements;
        }
      });
    }

    // Other file processing (messages, posts, etc.)
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

    // Generate advanced insights
    const topLocation = Object.keys(results.analytics.locations).reduce((a, b) => 
      results.analytics.locations[a] > results.analytics.locations[b] ? a : b, 'Unknown');
    
    const topCompany = Object.keys(results.analytics.topCompanies).reduce((a, b) => 
      results.analytics.topCompanies[a] > results.analytics.topCompanies[b] ? a : b, 'Unknown');
    
    const topSkill = Object.keys(results.analytics.skillsEndorsed).reduce((a, b) => 
      results.analytics.skillsEndorsed[a] > results.analytics.skillsEndorsed[b] ? a : b, 'Unknown');

    results.insights = [
      `You have ${results.stats.connections.toLocaleString()} professional connections`,
      `Most connections are located in: ${topLocation}`,
      `Most common company in your network: ${topCompany}`,
      `Your top endorsed skill: ${topSkill}`,
      `You've shared ${results.stats.posts.toLocaleString()} posts and content`,
      `Total engagement: ${results.stats.comments.toLocaleString()} comments`,
      `Geographic diversity: ${Object.keys(results.analytics.locations).length} different locations`,
      `Industry presence across ${Object.keys(results.analytics.industries).length} sectors`
    ];

    console.log("📊 ADVANCED ANALYTICS:", results.analytics);
    return results;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    
    try {
      const results = await processLinkedInZip(file);
      sessionStorage.setItem("analysisResults", JSON.stringify(results));
      setTimeout(() => router.push("/dashboard/results"), 1000);
    } catch (error) {
      console.error("Processing error:", error);
      alert("Error processing file: " + error.message);
      setUploading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "2rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem" }}>
          <h1>LinkStream Dashboard</h1>
          <button onClick={handleLogout} style={{ background: "#ef4444", color: "white", padding: "0.5rem 1rem", border: "none", borderRadius: "4px" }}>
            Sign Out
          </button>
        </div>
        
        <div style={{ background: "white", padding: "2rem", borderRadius: "8px", marginBottom: "2rem" }}>
          <h2>Upload LinkedIn Data</h2>
          {uploading ? (
            <p>Processing your LinkedIn data with advanced analytics...</p>
          ) : (
            <>
              <input type="file" accept=".zip" onChange={handleFileUpload} />
              <p style={{ fontSize: "0.875rem", color: "#64748b", marginTop: "1rem" }}>
                Advanced analysis: Industries, Locations, Skills, and more! 🎯
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
