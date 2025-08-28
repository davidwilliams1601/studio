"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AnalysisStorageService } from '@/lib/analysis-storage';

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

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

  const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const processLinkedInZip = async (file) => {
    setUploadProgress("Reading ZIP file...");
    
    const JSZip = (await import('jszip')).default;
    
    const zip = await JSZip.loadAsync(file);
    const results = {
      fileName: file.name,
      processedAt: new Date().toISOString(),
      stats: {
        connections: 0,
        messages: 0,
        posts: 0,
        companies: 0
      },
      analytics: {
        industries: {},
        locations: {},
        topCompanies: {},
        skillsCount: 0,
        networkQuality: {
          diversityScore: 0,
          topSeniorityLevels: {}
        }
      },
      insights: [],
      rawData: {}
    };

    setUploadProgress("Analyzing connections...");
    
    const connectionsFile = Object.keys(zip.files).find(name => 
      (name.toLowerCase().includes('connections') || name.toLowerCase().includes('contact')) 
      && name.endsWith('.csv')
    );
    
    if (connectionsFile) {
      const connectionsContent = await zip.files[connectionsFile].async('text');
      const lines = connectionsContent.split('\n').filter(line => line.trim());
      results.stats.connections = Math.max(0, lines.length - 3); // Subtract metadata lines
      
      // Find the actual header row (skip metadata lines)
      let headerRowIndex = -1;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('First Name') || line.includes('Company') || line.includes('Position')) {
          headerRowIndex = i;
          break;
        }
      }
      
      if (headerRowIndex !== -1 && lines.length > headerRowIndex + 1) {
        console.log('Found header row at index:', headerRowIndex);
        const headers = parseCSVLine(lines[headerRowIndex]).map(h => h.toLowerCase().replace(/"/g, '').trim());
        console.log('Parsed CSV Headers:', headers);
        
        const firstNameIndex = headers.findIndex(h => h.includes('first'));
        const lastNameIndex = headers.findIndex(h => h.includes('last'));
        const companyIndex = headers.findIndex(h => h.includes('company'));
        const positionIndex = headers.findIndex(h => h.includes('position'));
        
        console.log('Column mapping:', {
          firstNameIndex, lastNameIndex, companyIndex, positionIndex
        });
        
        const companies = {};
        const industries = {};
        const locations = {};
        const seniorityLevels = {};
        
        // Parse data starting from the line after headers
        lines.slice(headerRowIndex + 1).forEach((line, index) => {
          const columns = parseCSVLine(line);
          
          // Company analysis
          if (companyIndex >= 0 && columns[companyIndex]) {
            const company = columns[companyIndex].replace(/"/g, '').trim();
            if (company && company !== '--' && company !== '' && company !== 'null') {
              companies[company] = (companies[company] || 0) + 1;
            }
          }
          
          // Position/Industry analysis
          if (positionIndex >= 0 && columns[positionIndex]) {
            const position = columns[positionIndex].replace(/"/g, '').trim().toLowerCase();
            
            if (position && position !== '--' && position !== '' && position !== 'null') {
              // Industry inference
              if (position.includes('engineer') || position.includes('developer') || position.includes('tech') || position.includes('software')) {
                industries['Technology'] = (industries['Technology'] || 0) + 1;
              } else if (position.includes('finance') || position.includes('banking') || position.includes('investment') || position.includes('analyst')) {
                industries['Finance'] = (industries['Finance'] || 0) + 1;
              } else if (position.includes('marketing') || position.includes('sales') || position.includes('business development')) {
                industries['Marketing & Sales'] = (industries['Marketing & Sales'] || 0) + 1;
              } else if (position.includes('consult') || position.includes('advisor')) {
                industries['Consulting'] = (industries['Consulting'] || 0) + 1;
              } else if (position.includes('health') || position.includes('medical') || position.includes('doctor') || position.includes('nurse')) {
                industries['Healthcare'] = (industries['Healthcare'] || 0) + 1;
              } else if (position.includes('teacher') || position.includes('professor') || position.includes('education')) {
                industries['Education'] = (industries['Education'] || 0) + 1;
              } else {
                industries['Other'] = (industries['Other'] || 0) + 1;
              }
              
              // Seniority analysis
              if (position.includes('ceo') || position.includes('founder') || position.includes('president') || position.includes('owner')) {
                seniorityLevels['C-Level/Founder'] = (seniorityLevels['C-Level/Founder'] || 0) + 1;
              } else if (position.includes('vp') || position.includes('vice president') || position.includes('director') || position.includes('head of')) {
                seniorityLevels['Senior Leadership'] = (seniorityLevels['Senior Leadership'] || 0) + 1;
              } else if (position.includes('manager') || position.includes('lead') || position.includes('supervisor')) {
                seniorityLevels['Management'] = (seniorityLevels['Management'] || 0) + 1;
              } else if (position.includes('senior') || position.includes('principal') || position.includes('staff')) {
                seniorityLevels['Senior Individual Contributor'] = (seniorityLevels['Senior Individual Contributor'] || 0) + 1;
              } else {
                seniorityLevels['Individual Contributor'] = (seniorityLevels['Individual Contributor'] || 0) + 1;
              }
            }
          }
        });
        
        // Store results
        results.analytics.topCompanies = Object.fromEntries(
          Object.entries(companies).sort(([,a], [,b]) => b - a).slice(0, 10)
        );
        results.analytics.industries = industries;
        results.analytics.networkQuality.topSeniorityLevels = seniorityLevels;
        
        // Calculate diversity score
        const numIndustries = Object.keys(industries).length;
        results.analytics.networkQuality.diversityScore = Math.min(100, Math.max(0, numIndustries * 15));
        
        results.stats.companies = Object.keys(companies).length;
        
        console.log('Analytics results:', {
          companiesFound: Object.keys(companies).length,
          industriesFound: Object.keys(industries).length,
          topCompanies: Object.entries(companies).slice(0, 3),
          topIndustries: Object.entries(industries).slice(0, 3)
        });
      }
      
      console.log(`Found ${results.stats.connections} connections`);
    }

    // Skills analysis
    setUploadProgress("Analyzing skills...");
    const skillsFiles = Object.keys(zip.files).filter(name => 
      name.toLowerCase().includes('skill') && name.endsWith('.csv')
    );
    
    let totalSkills = 0;
    for (const skillFile of skillsFiles) {
      const skillContent = await zip.files[skillFile].async('text');
      const lines = skillContent.split('\n').filter(line => line.trim());
      totalSkills += Math.max(0, lines.length - 1);
    }
    results.analytics.skillsCount = totalSkills;

    setUploadProgress("Analyzing messages...");
    
    const messageFiles = Object.keys(zip.files).filter(name => 
      name.toLowerCase().includes('message') && name.endsWith('.csv')
    );
    
    let totalMessages = 0;
    for (const messageFile of messageFiles) {
      const messageContent = await zip.files[messageFile].async('text');
      const lines = messageContent.split('\n').filter(line => line.trim());
      totalMessages += Math.max(0, lines.length - 1);
    }
    results.stats.messages = totalMessages;

    setUploadProgress("Analyzing posts and articles...");
    
    const contentFiles = Object.keys(zip.files).filter(name => 
      (name.toLowerCase().includes('post') || 
       name.toLowerCase().includes('article') || 
       name.toLowerCase().includes('share') ||
       name.toLowerCase().includes('activity')) 
      && name.endsWith('.csv')
    );
    
    let totalPosts = 0;
    for (const contentFile of contentFiles) {
      const contentData = await zip.files[contentFile].async('text');
      const lines = contentData.split('\n').filter(line => line.trim());
      totalPosts += Math.max(0, lines.length - 1);
    }
    results.stats.posts = totalPosts;

    // Generate enhanced insights
    const topIndustry = Object.entries(results.analytics.industries).sort(([,a], [,b]) => b - a)[0];
    const industryCount = Object.keys(results.analytics.industries).length;
    
    results.insights = [
      `You have ${results.stats.connections} professional connections across multiple regions`,
      `Your network spans ${industryCount} industries${topIndustry ? `, with strongest presence in ${topIndustry[0]} (${topIndustry[1]} connections)` : ''}`,
      `Connected to ${results.stats.companies} different companies`,
      `Network diversity score: ${results.analytics.networkQuality.diversityScore}/100`,
      `Professional skillset includes ${results.analytics.skillsCount} endorsed skills`,
      `Content activity: ${results.stats.posts} posts with ${results.stats.messages} message conversations`
    ];

    console.log("Final analysis results:", results);
    return results;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.zip')) {
      alert('Please upload a ZIP file from LinkedIn data export');
      return;
    }

    setUploading(true);
    
    try {
      const results = await processLinkedInZip(file);
      
      setUploadProgress("Analysis complete!");
      
      const analysisData = {
        userId: user.uid,
        fileName: file.name,
        processedAt: new Date().toISOString(),
        stats: results.stats,
        analytics: results.analytics,
        insights: results.insights
      };

      const analysisId = await AnalysisStorageService.saveAnalysis(analysisData);
      console.log('Analysis saved with ID:', analysisId);
      
      setTimeout(() => {
        router.push("/dashboard/results");
      }, 1000);
      
    } catch (error) {
      console.error("Processing error:", error);
      alert("Error processing file: " + error.message);
      setUploading(false);
      setUploadProgress("");
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
            <div>
              <p>Processing your LinkedIn data...</p>
              <p style={{ color: "#64748b", fontSize: "0.875rem" }}>{uploadProgress}</p>
            </div>
          ) : (
            <>
              <input type="file" accept=".zip" onChange={handleFileUpload} />
              <p style={{ fontSize: "0.875rem", color: "#64748b", marginTop: "1rem" }}>
                Upload your LinkedIn data export ZIP file for real analysis
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
