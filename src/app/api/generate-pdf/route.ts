import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { analysisData, aiInsights } = await request.json();
    
    if (!analysisData) {
      return NextResponse.json(
        { success: false, error: "Missing analysis data" },
        { status: 400 }
      );
    }

    // For now, we'll create a structured HTML that can be converted to PDF
    // This approach works better with Firebase App Hosting than puppeteer
    const htmlContent = generatePDFHTML(analysisData, aiInsights);

    return NextResponse.json({
      success: true,
      html: htmlContent,
      fileName: `linkedin-analysis-${new Date().toISOString().split('T')[0]}.pdf`
    });

  } catch (error: any) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate PDF: " + (error?.message || 'Unknown error') },
      { status: 500 }
    );
  }
}

function generatePDFHTML(data: any, aiInsights: any) {
  const stats = data.stats;
  const analytics = data.analytics;
  
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>LinkedIn Analytics Report</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 20px; 
            line-height: 1.6;
            color: #333;
        }
        .header { 
            text-align: center; 
            border-bottom: 3px solid #3b82f6; 
            padding-bottom: 20px; 
            margin-bottom: 30px;
        }
        .header h1 { 
            color: #1e293b; 
            font-size: 2.5rem; 
            margin: 0;
        }
        .header p { 
            color: #64748b; 
            font-size: 1.2rem;
        }
        .stats-grid { 
            display: grid; 
            grid-template-columns: repeat(4, 1fr); 
            gap: 20px; 
            margin-bottom: 30px;
        }
        .stat-card { 
            background: #f8fafc; 
            padding: 20px; 
            border-radius: 8px; 
            text-align: center;
            border: 1px solid #e2e8f0;
        }
        .stat-number { 
            font-size: 2rem; 
            font-weight: bold; 
            color: #3b82f6;
            margin-bottom: 5px;
        }
        .stat-label { 
            color: #64748b; 
            font-weight: 500;
        }
        .section { 
            margin-bottom: 40px; 
            break-inside: avoid;
        }
        .section h2 { 
            color: #1e293b; 
            border-bottom: 2px solid #3b82f6; 
            padding-bottom: 10px;
            font-size: 1.5rem;
        }
        .ai-insights { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 25px; 
            border-radius: 12px; 
            margin-bottom: 30px;
        }
        .network-score { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            background: rgba(255,255,255,0.1); 
            padding: 20px; 
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .score-number { 
            font-size: 3rem; 
            font-weight: bold;
        }
        .insights-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 20px;
            margin-top: 20px;
        }
        .insight-box { 
            background: rgba(255,255,255,0.1); 
            padding: 15px; 
            border-radius: 8px;
        }
        .action-items { 
            background: #f8fafc; 
            padding: 20px; 
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
        }
        .action-item { 
            margin-bottom: 15px; 
            padding: 15px; 
            background: white; 
            border-radius: 6px;
            border-left: 3px solid #10b981;
        }
        .priority-high { border-left-color: #ef4444; }
        .priority-medium { border-left-color: #f59e0b; }
        .priority-low { border-left-color: #10b981; }
        .data-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 15px;
        }
        .data-table th, .data-table td { 
            padding: 12px; 
            text-align: left; 
            border-bottom: 1px solid #e2e8f0;
        }
        .data-table th { 
            background: #f8fafc; 
            font-weight: 600;
        }
        .footer { 
            text-align: center; 
            margin-top: 40px; 
            padding-top: 20px; 
            border-top: 1px solid #e2e8f0; 
            color: #64748b;
        }
        @media print {
            body { margin: 0; }
            .section { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔗 LinkStream Analytics Report</h1>
        <p>Professional LinkedIn Network Analysis</p>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
    </div>

    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-number">${stats.connections.toLocaleString()}</div>
            <div class="stat-label">Total Connections</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${stats.posts}</div>
            <div class="stat-label">Posts & Shares</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${stats.messages.toLocaleString()}</div>
            <div class="stat-label">Messages</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${aiInsights?.networkHealth?.score || '—'}</div>
            <div class="stat-label">AI Health Score</div>
        </div>
    </div>

    ${aiInsights ? `
    <div class="ai-insights">
        <h2 style="color: white; border: none; margin-top: 0;">🤖 AI-Powered Insights</h2>
        
        <div class="network-score">
            <div>
                <h3 style="margin: 0; font-size: 1.25rem;">Network Health Score</h3>
                <p style="margin: 5px 0; opacity: 0.9;">${aiInsights.networkHealth.assessment}</p>
            </div>
            <div class="score-number">${aiInsights.networkHealth.score}/100</div>
        </div>

        <div class="insights-grid">
            <div class="insight-box">
                <h4 style="margin-top: 0;">🎯 Key Insights</h4>
                ${aiInsights.keyInsights.slice(0, 3).map((insight: string) => `<p style="font-size: 0.9rem; margin: 8px 0;">• ${insight}</p>`).join('')}
            </div>
            <div class="insight-box">
                <h4 style="margin-top: 0;">📈 Content Strategy</h4>
                <p><strong>Rating:</strong> ${aiInsights.contentStrategy.rating}</p>
                <p style="font-size: 0.9rem;">${aiInsights.contentStrategy.advice}</p>
            </div>
        </div>
    </div>
    ` : ''}

    <div class="section">
        <h2>📊 Network Analysis</h2>
        
        <h3>Industry Distribution</h3>
        <table class="data-table">
            <thead>
                <tr><th>Industry</th><th>Connections</th><th>Percentage</th></tr>
            </thead>
            <tbody>
                ${Object.entries(analytics.industries || {})
                  .sort(([,a], [,b]) => (b as number) - (a as number))
                  .map(([industry, count]) =>
                    `<tr><td>${industry}</td><td>${count as number}</td><td>${(((count as number)/stats.connections)*100).toFixed(1)}%</td></tr>`
                  ).join('')}
            </tbody>
        </table>

        <h3>Geographic Distribution</h3>
        <table class="data-table">
            <thead>
                <tr><th>Location</th><th>Connections</th><th>Percentage</th></tr>
            </thead>
            <tbody>
                ${Object.entries(analytics.locations || {})
                  .sort(([,a], [,b]) => (b as number) - (a as number))
                  .slice(0, 8)
                  .map(([location, count]) =>
                    `<tr><td>${location}</td><td>${count as number}</td><td>${(((count as number)/stats.connections)*100).toFixed(1)}%</td></tr>`
                  ).join('')}
            </tbody>
        </table>
    </div>

    ${aiInsights?.actionItems ? `
    <div class="section">
        <h2>⚡ Recommended Actions</h2>
        <div class="action-items">
            ${aiInsights.actionItems.map((item: any) => `
                <div class="action-item priority-${item.priority.toLowerCase()}">
                    <h4 style="margin: 0 0 8px 0; color: #1e293b;">
                        <span style="background: ${item.priority === 'High' ? '#ef4444' : item.priority === 'Medium' ? '#f59e0b' : '#10b981'}; 
                                     color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; margin-right: 8px;">
                            ${item.priority}
                        </span>
                        ${item.action}
                    </h4>
                    <p style="margin: 5px 0; color: #64748b; font-size: 0.9rem;"><strong>Timeline:</strong> ${item.timeline}</p>
                    <p style="margin: 5px 0; color: #64748b; font-size: 0.9rem;"><strong>Expected Impact:</strong> ${item.expectedImpact}</p>
                </div>
            `).join('')}
        </div>
    </div>
    ` : ''}

    <div class="section">
        <h2>📈 Professional Metrics</h2>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">${((stats.posts / stats.connections) * 1000).toFixed(1)}</div>
                <div class="stat-label">Posts per 1K Connections</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.posts > 0 ? ((stats.comments || 0) / stats.posts).toFixed(1) : '0'}</div>
                <div class="stat-label">Comments per Post</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${Object.keys(analytics.locations || {}).length}</div>
                <div class="stat-label">Geographic Regions</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${analytics.skillsCount || 0}</div>
                <div class="stat-label">Skills Listed</div>
            </div>
        </div>
    </div>

    <div class="footer">
        <p><strong>LinkStream Analytics</strong> • Professional LinkedIn Network Analysis</p>
        <p>Report generated from ${data.fileName} on ${new Date().toLocaleDateString()}</p>
    </div>
</body>
</html>`;
}
