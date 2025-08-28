"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { AnalysisStorageService } from '@/lib/analysis-storage';

export default function Dashboard() {
 const { user, loading, logout } = useAuth();
 const router = useRouter();
 const [uploading, setUploading] = useState(false);
 const [uploadProgress, setUploadProgress] = useState("");
 const [analyses, setAnalyses] = useState([]);
 const [loadingAnalyses, setLoadingAnalyses] = useState(true);

 useEffect(() => {
   if (!loading && !user) {
     router.push("/login");
   }
 }, [user, loading, router]);

 useEffect(() => {
   const loadAnalyses = async () => {
     if (!user) return;
     
     try {
       const userAnalyses = await AnalysisStorageService.getUserAnalyses(user.uid);
       setAnalyses(userAnalyses);
     } catch (error) {
       console.error('Error loading analyses:', error);
     } finally {
       setLoadingAnalyses(false);
     }
   };

   if (user && !loading) {
     loadAnalyses();
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

 const generateEnhancedInsights = (results) => {
   const { stats, analytics } = results;
   const insights = [];
   
   // Connection analysis with benchmarking
   const connectionSize = stats.connections;
   let connectionBenchmark = "";
   if (connectionSize > 5000) {
     connectionBenchmark = "placing you in the top 5% of LinkedIn users";
   } else if (connectionSize > 2000) {
     connectionBenchmark = "placing you in the top 15% of LinkedIn users";
   } else if (connectionSize > 1000) {
     connectionBenchmark = "placing you above average for LinkedIn professionals";
   } else {
     connectionBenchmark = "providing a solid foundation for professional networking";
   }
   
   insights.push(`You have ${connectionSize.toLocaleString()} professional connections, ${connectionBenchmark}`);
   
   // Industry analysis with specific numbers
   const industries = Object.entries(analytics.industries).sort(([,a], [,b]) => b - a);
   const topIndustry = industries[0];
   const industryCount = industries.length;
   
   if (topIndustry && topIndustry[1] > 100) {
     insights.push(`Strong presence in ${topIndustry[0]} (${topIndustry[1].toLocaleString()} connections) gives you significant influence in this sector`);
   }
   
   if (industryCount >= 7) {
     insights.push(`Your network spans ${industryCount} industries, putting you in the top 15% for professional diversity`);
   } else if (industryCount >= 5) {
     insights.push(`Your network spans ${industryCount} industries, showing good professional diversity`);
   }
   
   // Company reach analysis
   if (stats.companies > 3000) {
     insights.push(`Connected to ${stats.companies.toLocaleString()} different companies, providing exceptional business reach`);
   } else if (stats.companies > 1000) {
     insights.push(`Connected to ${stats.companies.toLocaleString()} different companies, offering strong business development potential`);
   }
   
   // Content engagement analysis
   if (stats.posts > 300) {
     insights.push(`${stats.posts} posts demonstrate exceptional thought leadership and content creation`);
   } else if (stats.posts > 100) {
     insights.push(`${stats.posts} posts show strong professional content creation above average for LinkedIn users`);
   }
   
   // Message activity insights
   if (stats.messages > 3000) {
     insights.push(`${stats.messages.toLocaleString()} message conversations indicate highly active networking and relationship building`);
   } else if (stats.messages > 1000) {
     insights.push(`${stats.messages.toLocaleString()} message conversations show strong engagement with your professional network`);
   }
   
   // Skills analysis
   if (analytics.skillsCount > 20) {
     insights.push(`${analytics.skillsCount} endorsed skills demonstrate comprehensive professional expertise`);
   } else if (analytics.skillsCount > 10) {
     insights.push(`${analytics.skillsCount} endorsed skills show solid professional credibility`);
   }
   
   // Network quality analysis
   const seniorityLevels = analytics.networkQuality.topSeniorityLevels;
   const seniorConnections = (seniorityLevels['C-Level/Founder'] || 0) + (seniorityLevels['Senior Leadership'] || 0);
   const totalMappedConnections = Object.values(seniorityLevels).reduce((sum, count) => sum + count, 0);
   
   if (seniorConnections > 0 && totalMappedConnections > 0) {
     const seniorPercentage = Math.round((seniorConnections / totalMappedConnections) * 100);
     if (seniorPercentage > 30) {
       insights.push(`${seniorPercentage}% of your network holds senior leadership positions, indicating exceptional access to decision-makers`);
     } else if (seniorPercentage > 15) {
       insights.push(`${seniorPercentage}% of your network holds senior leadership positions, providing good access to industry leaders`);
     }
   }
   
   // Top company analysis
   const topCompanies = Object.entries(analytics.topCompanies).sort(([,a], [,b]) => b - a).slice(0, 3);
   if (topCompanies.length > 0 && topCompanies[0][1] > 10) {
     const companyNames = topCompanies.map(([name, count]) => `${name} (${count})`).join(', ');
     insights.push(`Strongest company connections include: ${companyNames}`);
   }
   
   return insights;
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
     insights: []
   };

   setUploadProgress("Analyzing connections...");
   
   const connectionsFile = Object.keys(zip.files).find(name => 
     (name.toLowerCase().includes('connections') || name.toLowerCase().includes('contact')) 
     && name.endsWith('.csv')
   );
   
   if (connectionsFile) {
     const connectionsContent = await zip.files[connectionsFile].async('text');
     const lines = connectionsContent.split('\n').filter(line => line.trim());
     results.stats.connections = Math.max(0, lines.length - 3);
     
     let headerRowIndex = -1;
     for (let i = 0; i < lines.length; i++) {
       if (lines[i].includes('First Name') || lines[i].includes('Company')) {
         headerRowIndex = i;
         break;
       }
     }
     
     if (headerRowIndex !== -1) {
       const headers = parseCSVLine(lines[headerRowIndex]).map(h => h.toLowerCase().replace(/"/g, '').trim());
       const companyIndex = headers.findIndex(h => h.includes('company'));
       const positionIndex = headers.findIndex(h => h.includes('position'));
       
       const companies = {};
       const industries = {};
       const seniorityLevels = {};
       
       lines.slice(headerRowIndex + 1).forEach((line) => {
         const columns = parseCSVLine(line);
         
         if (companyIndex >= 0 && columns[companyIndex]) {
           const company = columns[companyIndex].replace(/"/g, '').trim();
           if (company && company !== '--' && company !== '') {
             companies[company] = (companies[company] || 0) + 1;
           }
         }
         
         if (positionIndex >= 0 && columns[positionIndex]) {
           const position = columns[positionIndex].replace(/"/g, '').trim().toLowerCase();
           
           if (position && position !== '--' && position !== '') {
             if (position.includes('engineer') || position.includes('developer') || position.includes('tech')) {
               industries['Technology'] = (industries['Technology'] || 0) + 1;
             } else if (position.includes('finance') || position.includes('banking')) {
               industries['Finance'] = (industries['Finance'] || 0) + 1;
             } else if (position.includes('marketing') || position.includes('sales')) {
               industries['Marketing & Sales'] = (industries['Marketing & Sales'] || 0) + 1;
             } else if (position.includes('consult')) {
               industries['Consulting'] = (industries['Consulting'] || 0) + 1;
             } else if (position.includes('health') || position.includes('medical')) {
               industries['Healthcare'] = (industries['Healthcare'] || 0) + 1;
             } else {
               industries['Other'] = (industries['Other'] || 0) + 1;
             }
             
             if (position.includes('ceo') || position.includes('founder')) {
               seniorityLevels['C-Level/Founder'] = (seniorityLevels['C-Level/Founder'] || 0) + 1;
             } else if (position.includes('director') || position.includes('vp')) {
               seniorityLevels['Senior Leadership'] = (seniorityLevels['Senior Leadership'] || 0) + 1;
             } else if (position.includes('manager') || position.includes('lead')) {
               seniorityLevels['Management'] = (seniorityLevels['Management'] || 0) + 1;
             } else {
               seniorityLevels['Individual Contributor'] = (seniorityLevels['Individual Contributor'] || 0) + 1;
             }
           }
         }
       });
       
       results.analytics.topCompanies = Object.fromEntries(
         Object.entries(companies).sort(([,a], [,b]) => b - a).slice(0, 10)
       );
       results.analytics.industries = industries;
       results.analytics.networkQuality.topSeniorityLevels = seniorityLevels;
       results.analytics.networkQuality.diversityScore = Math.min(100, Object.keys(industries).length * 15);
       results.stats.companies = Object.keys(companies).length;
     }
   }

   // Process other files (messages, posts, skills)
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

   setUploadProgress("Analyzing posts...");
   const contentFiles = Object.keys(zip.files).filter(name => 
     (name.toLowerCase().includes('post') || name.toLowerCase().includes('article')) && name.endsWith('.csv')
   );
   
   let totalPosts = 0;
   for (const contentFile of contentFiles) {
     const contentData = await zip.files[contentFile].async('text');
     const lines = contentData.split('\n').filter(line => line.trim());
     totalPosts += Math.max(0, lines.length - 1);
   }
   results.stats.posts = totalPosts;

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

   // Generate enhanced insights
   results.insights = generateEnhancedInsights(results);

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
     
     // Refresh analyses list
     const userAnalyses = await AnalysisStorageService.getUserAnalyses(user.uid);
     setAnalyses(userAnalyses);
     
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
     <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
       <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem" }}>
         <h1>LinkStream Dashboard</h1>
         <button onClick={handleLogout} style={{ background: "#ef4444", color: "white", padding: "0.5rem 1rem", border: "none", borderRadius: "4px" }}>
           Sign Out
         </button>
       </div>
       
       {/* Previous Analyses */}
       {!loadingAnalyses && analyses.length > 0 && (
         <div style={{ marginBottom: "2rem" }}>
           <h2 style={{ marginBottom: "1rem" }}>Your LinkedIn Analyses</h2>
           <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
             {analyses.map((analysis) => (
               <div key={analysis.id} style={{ background: "white", padding: "1.5rem", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                 <h3 style={{ fontSize: "1.125rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
                   {analysis.fileName}
                 </h3>
                 <p style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "1rem" }}>
                   {new Date(analysis.processedAt).toLocaleDateString()}
                 </p>
                 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "1rem" }}>
                   <div>
                     <span style={{ fontWeight: "bold" }}>{analysis.stats.connections}</span>
                     <span style={{ color: "#6b7280", fontSize: "0.875rem" }}> connections</span>
                   </div>
                   <div>
                     <span style={{ fontWeight: "bold" }}>{analysis.stats.companies}</span>
                     <span style={{ color: "#6b7280", fontSize: "0.875rem" }}> companies</span>
                   </div>
                   <div>
                     <span style={{ fontWeight: "bold" }}>{analysis.stats.posts}</span>
                     <span style={{ color: "#6b7280", fontSize: "0.875rem" }}> posts</span>
                   </div>
                   <div>
                     <span style={{ fontWeight: "bold" }}>{analysis.analytics.skillsCount}</span>
                     <span style={{ color: "#6b7280", fontSize: "0.875rem" }}> skills</span>
                   </div>
                 </div>
                 <button 
                   onClick={() => {
                     sessionStorage.setItem("selectedAnalysisId", analysis.id);
                     router.push("/dashboard/results");
                   }}
                   style={{ 
                     width: "100%", 
                     padding: "0.5rem", 
                     background: "#3b82f6", 
                     color: "white", 
                     border: "none", 
                     borderRadius: "4px", 
                     fontWeight: "bold" 
                   }}
                 >
                   View Full Report
                 </button>
               </div>
             ))}
           </div>
         </div>
       )}
       
       {/* Upload New Analysis */}
       <div style={{ background: "white", padding: "2rem", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
         <h2>Upload New LinkedIn Data</h2>
         {uploading ? (
           <div>
             <p>Processing your LinkedIn data...</p>
             <p style={{ color: "#64748b", fontSize: "0.875rem" }}>{uploadProgress}</p>
           </div>
         ) : (
           <>
             <input type="file" accept=".zip" onChange={handleFileUpload} />
             <p style={{ fontSize: "0.875rem", color: "#64748b", marginTop: "1rem" }}>
               Upload your LinkedIn data export ZIP file for analysis
             </p>
           </>
         )}
       </div>
     </div>
   </div>
 );
}
