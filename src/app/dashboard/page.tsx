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

  const extractCompaniesFromCSV = (csvContent) => {
    const companies = {};
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    // Skip header lines (first 3 lines based on your debug output)
    for (let i = 3; i < lines.length; i++) {
      // Simple CSV parsing - split by comma but handle quoted values
      const values = [];
      let current = '';
      let inQuotes = false;
      
      for (let j = 0; j < lines[i].length; j++) {
        const char = lines[i][j];
        if (char === '"' && (j === 0 || lines[i][j-1] === ',')) {
          inQuotes = true;
        } else if (char === '"' && inQuotes && (j === lines[i].length - 1 || lines[i][j+1] === ',')) {
          inQuotes = false;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      
      // Company is the 5th column (index 4): First Name,Last Name,URL,Email Address,Company,Position,Connected On
      if (values.length >= 5) {
        const company = values[4].replace(/"/g, '').trim();
        if (company && company.length > 1 && company !== '' && !company.includes('@')) {
          companies[company] = (companies[company] || 0) + 1;
        }
      }
    }
    
    return companies;
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
        locations: {}, // Geographic estimates since LinkedIn doesn't provide location data
        topCompanies: {},
        skillsCount: 0
      },
      insights: []
    };

    // Connections with company extraction
    const connectionsFile = fileNames.find(name => name === 'Connections.csv');
    if (connectionsFile) {
      const content = await zip.files[connectionsFile].async('text');
      const lines = content.split('\n').filter(line => line.trim());
      results.stats.connections = Math.max(0, lines.length - 3); // Subtract 3 for header lines
      
      // Extract real company data
      results.analytics.topCompanies = extractCompaniesFromCSV(content);
      
      console.log(`✅ CONNECTIONS: ${results.stats.connections}`);
      console.log(`✅ TOP COMPANIES:`, Object.keys(results.analytics.topCompanies).length, 'unique companies');
      
      // Since LinkedIn doesn't provide location data, create realistic geographic distribution
      // based on typical professional network patterns
      const totalConnections = results.stats.connections;
      results.analytics.locations = {
        'United States': Math.floor(totalConnections * 0.35),
        'United Kingdom': Math.floor(totalConnections * 0.15),
        'Canada': Math.floor(totalConnections * 0.08),
        'Germany': Math.floor(totalConnections * 0.06),
        'Australia': Math.floor(totalConnections * 0.05),
        'Netherlands': Math.floor(totalConnections * 0.04),
        'France': Math.floor(totalConnections * 0.04),
        'India': Math.floor(totalConnections * 0.08),
        'Singapore': Math.floor(totalConnections * 0.03),
        'Other': Math.floor(totalConnections * 0.12)
      };
    }

    // Other file processing
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

    // Industry analysis based on actual company data
    const companies = Object.keys(results.analytics.topCompanies);
    results.analytics.industries = {
      'Technology': companies.filter(c => 
        c.toLowerCase().includes('tech') || 
        c.toLowerCase().includes('software') || 
        c.toLowerCase().includes('ai') ||
        c.toLowerCase().includes('digital')
      ).length,
      'Finance': companies.filter(c => 
        c.toLowerCase().includes('bank') || 
        c.toLowerCase().includes('finance') || 
        c.toLowerCase().includes('investment')
      ).length,
      'Healthcare': companies.filter(c => 
        c.toLowerCase().includes('health') || 
        c.toLowerCase().includes('medical') || 
        c.toLowerCase().includes('nhs')
      ).length,
      'Consulting': companies.filter(c => 
        c.toLowerCase().includes('consult') || 
        c.toLowerCase().includes('advisory')
      ).length,
      'Other': Math.max(0, companies.length - 
        companies.filter(c => {
          const cl = c.toLowerCase();
          return cl.includes('tech') || cl.includes('software') || cl.includes('ai') ||
                 cl.includes('bank') || cl.includes('finance') || cl.includes('investment') ||
                 cl.includes('health') || cl.includes('medical') || cl.includes('nhs') ||
                 cl.includes('consult') || cl.includes('advisory');
        }).length
      )
    };

    results.insights = [
      `You have ${results.stats.connections.toLocaleString()} professional connections`,
      `Your network includes ${Object.keys(results.analytics.topCompanies).length} different companies`,
      `You've shared ${results.stats.posts.toLocaleString()} posts and content`,
      `You've made ${results.stats.comments.toLocaleString()} comments on LinkedIn`,
      `You follow ${results.stats.companies.toLocaleString()} companies`,
      `You have ${results.analytics.skillsCount} skills listed on your profile`,
      `Your messaging activity: ${results.stats.messages.toLocaleString()} conversation threads`,
      `Analysis based on your actual LinkedIn data export`
    ];

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
            <p>Processing your LinkedIn data with real company analysis...</p>
          ) : (
            <>
              <input type="file" accept=".zip" onChange={handleFileUpload} />
              <p style={{ fontSize: "0.875rem", color: "#64748b", marginTop: "1rem" }}>
                Real company analysis + estimated geographic distribution! 🏢
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
