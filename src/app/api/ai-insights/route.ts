import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { stats, analytics, fileName } = await request.json();

    if (!stats || !analytics) {
      return NextResponse.json(
        { success: false, error: 'Missing required data' },
        { status: 400 }
      );
    }

    // Simulate AI analysis processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate comprehensive AI insights based on the actual data
    const insights = {
      networkHealth: {
        score: Math.min(95, Math.max(60, Math.floor(
          (stats.connections / 10) + 
          (stats.posts * 2) + 
          (stats.messages / 100) + 
          (Object.keys(analytics.industries).length * 5)
        ))),
        factors: [
          stats.connections > 500 ? "Strong connection base" : "Growing connection network",
          stats.posts > 10 ? "Active content creator" : "Opportunity to increase content sharing",
          Object.keys(analytics.industries).length > 5 ? "Diverse industry presence" : "Consider expanding industry connections"
        ]
      },
      
      industryAnalysis: {
        dominantSector: Object.entries(analytics.industries)
          .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'Technology',
        diversification: Object.keys(analytics.industries).length,
        recommendations: [
          "Your network is strongest in " + (Object.entries(analytics.industries)
            .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'Technology'),
          Object.keys(analytics.industries).length < 5 ? 
            "Consider expanding into emerging sectors like AI, Clean Energy, or Biotechnology" :
            "Excellent industry diversification across " + Object.keys(analytics.industries).length + " sectors",
          stats.connections > 1000 ? 
            "Leverage your large network for industry insights and opportunities" :
            "Focus on quality connections in your target industries"
        ]
      },

      geographicInsights: {
        globalReach: Object.keys(analytics.locations).length,
        primaryMarkets: Object.entries(analytics.locations)
          .sort(([,a], [,b]) => (b as number) - (a as number))
          .slice(0, 3)
          .map(([location]) => location),
        expansion: [
          "Strong presence in " + Object.keys(analytics.locations).length + " countries/regions",
          Object.keys(analytics.locations).includes('United States') ? 
            "Good US market penetration" : "Consider expanding US connections",
          Object.keys(analytics.locations).includes('Germany') || Object.keys(analytics.locations).includes('United Kingdom') ?
            "Solid European network" : "Opportunity to strengthen European presence"
        ]
      },

      engagementMetrics: {
        contentActivity: stats.posts,
        communicationLevel: stats.messages,
        networkGrowth: "Growing",
        recommendations: [
          stats.posts > 20 ? "Excellent content creation activity" : "Increase content sharing for better visibility",
          stats.messages > 100 ? "Active in professional communications" : "Engage more in meaningful conversations",
          "Your " + stats.connections + " connections show strong professional networking"
        ]
      },

      careerInsights: {
        networkStrength: stats.connections > 500 ? "Strong" : stats.connections > 200 ? "Growing" : "Developing",
        industryInfluence: stats.posts > 15 ? "High" : stats.posts > 5 ? "Medium" : "Developing",
        recommendations: [
          "Your professional network spans " + Object.keys(analytics.locations).length + " regions",
          stats.connections > 1000 ? 
            "You're in the top 10% of LinkedIn users by connection count" :
            "Continue growing your network strategically",
          "Focus on " + (Object.entries(analytics.industries)
            .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'Technology') + 
            " sector for maximum impact"
        ]
      },

      actionableRecommendations: [
        {
          priority: "High",
          action: "Weekly Content Strategy",
          description: stats.posts < 10 ? 
            "Increase content posting to 2-3 times per week to boost visibility" :
            "Maintain your excellent content creation momentum",
          impact: "Increases profile visibility by 40-60%"
        },
        {
          priority: "Medium", 
          action: "Network Expansion",
          description: stats.connections < 500 ?
            "Target 50-100 new strategic connections in your industry each quarter" :
            "Focus on quality over quantity - connect with industry leaders",
          impact: "Expands career opportunities and industry insights"
        },
        {
          priority: "Medium",
          action: "Geographic Diversification", 
          description: Object.keys(analytics.locations).length < 5 ?
            "Expand connections in key markets like US, Germany, and Singapore" :
            "Excellent global reach - maintain regional balance",
          impact: "Opens international career and business opportunities"
        }
      ],

      riskAssessment: {
        dataVulnerability: "Medium",
        accountSecurity: stats.connections > 500 ? "High Value Target" : "Standard Risk",
        recommendations: [
          "Your " + stats.connections + " connections represent significant professional value",
          "Regular data backups protect against account compromise or platform changes",
          stats.connections > 1000 ? 
            "As a high-value account, enable two-factor authentication immediately" :
            "Consider enabling enhanced security features"
        ]
      }
    };

    return NextResponse.json({
      success: true,
      insights: insights,
      analysisMetadata: {
        processedAt: new Date().toISOString(),
        fileName: fileName,
        dataPoints: stats.connections + stats.posts + stats.messages,
        analysisVersion: "1.0"
      }
    });

  } catch (error) {
    console.error('AI insights error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'AI analysis failed: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}
