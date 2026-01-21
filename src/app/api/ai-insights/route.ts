import { NextRequest, NextResponse } from "next/server";
import {
  generateValueConnectionRecommendations,
  generateContentStrategy,
  generateIntroductionMatches
} from "@/lib/ai-analysis";
import { getDb } from "@/lib/firebase-admin";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log("AI Insights API called");

    const { stats, analytics, fileName, backupId } = await request.json();

    if (!stats || !analytics) {
      return NextResponse.json(
        { success: false, error: "Missing required data" },
        { status: 400 }
      );
    }

    console.log("Processing AI insights for:", fileName);
    console.log("Backup ID:", backupId);

    // Fetch connections list from backup if available
    let connectionsList: any[] = [];
    if (backupId) {
      try {
        const db = await getDb();
        const backupDoc = await db.collection('backups').doc(backupId).get();
        if (backupDoc.exists) {
          const backupData = backupDoc.data();
          connectionsList = backupData?.connectionsList || [];
          console.log(`📋 Found ${connectionsList.length} stored connections for AI generation`);
        }
      } catch (error) {
        console.error('⚠️ Failed to fetch connections list:', error);
        // Continue without connections list
      }
    }

    // Generate intelligent insights based on actual data patterns
    const totalConnections = stats.connections;
    const contentEngagement = stats.posts > 0 ? (stats.comments / stats.posts) : 0;
    
    // Calculate network health score based on actual metrics
    let networkScore = 50;
    if (totalConnections > 1000) networkScore += 20;
    if (totalConnections > 3000) networkScore += 10;
    if (totalConnections > 5000) networkScore += 10;
    if (stats.posts > 100) networkScore += 10;
    if (contentEngagement > 2) networkScore += 10;
    if (stats.skillsCount > 10) networkScore += 5;
    networkScore = Math.min(networkScore, 100);

    const topIndustries = Object.entries(analytics.industries || {})
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([name]) => name);

    // Generate insights
    const insights = {
      networkHealth: {
        score: networkScore,
        assessment: `Exceptional professional network with ${totalConnections.toLocaleString()} connections representing outstanding reach and influence`,
        recommendations: [
          "Maintain and deeply engage with your extensive network",
          "Focus on quality interactions over quantity expansion", 
          "Leverage network for strategic business opportunities"
        ]
      },
      contentStrategy: {
        rating: "Excellent",
        advice: `Strong content portfolio with ${stats.posts} posts and ${contentEngagement.toFixed(1)} comments per post showing good engagement`,
        suggestions: [
          `Continue sharing insights about ${topIndustries[0] || 'technology'} trends`,
          "Develop thought leadership content series",
          "Increase engagement through interactive posts"
        ]
      },
      keyInsights: [
        `Your ${totalConnections.toLocaleString()} connections represent exceptional professional capital`,
        `Content creation shows strong thought leadership with ${stats.posts} posts`,
        `Message activity of ${stats.messages.toLocaleString()} shows excellent networking`,
        `High engagement rate with ${stats.comments} total comments across content`,
        `Geographic diversity provides significant global opportunities`
      ],
      actionItems: [
        {
          priority: "High",
          action: "Continue content leadership momentum with strategic posting",
          timeline: "Next 30 days",
          expectedImpact: "Maintained thought leadership positioning"
        },
        {
          priority: "Medium",
          action: "Expand network in emerging technology sectors",
          timeline: "Next 60 days",
          expectedImpact: "Enhanced industry insights and partnerships"
        },
        {
          priority: "Medium", 
          action: "Optimize content engagement through interactive formats",
          timeline: "Next 45 days",
          expectedImpact: "Increased audience engagement and reach"
        }
      ]
    };

    // Generate Pro/Business tier features
    // Construct a proper LinkedInAnalysisResult object
    const resultsData: any = {
      fileName: fileName || 'backup',
      processedAt: new Date().toISOString(),
      stats: {
        connections: stats.connections || 0,
        messages: stats.messages || 0,
        posts: stats.posts || 0,
        comments: stats.comments || 0,
        reactions: stats.reactions || 0,
        companies: stats.companies || 0,
        invitations: stats.invitations || 0,
      },
      analytics: {
        industries: analytics.industries || {},
        locations: analytics.locations || {},
        topCompanies: analytics.topCompanies || {},
        positions: analytics.positions || {},
        skillsCount: stats.skillsCount || 0,
        connectionsByMonth: analytics.connectionsByMonth || {},
      },
      insights: [],
    };

    // Add connections list if available
    if (connectionsList.length > 0) {
      resultsData.connectionsList = connectionsList;
      console.log(`✅ Added ${connectionsList.length} connections to results data`);
    }

    console.log('🎯 Generating valuable connection recommendations...');
    const topValueConnections = await generateValueConnectionRecommendations(resultsData);
    console.log(`   ✅ Generated ${topValueConnections?.length || 0} connection recommendations`);

    console.log('📝 Generating content strategy...');
    const contentStrategyData = await generateContentStrategy(resultsData);
    console.log(`   ✅ Content strategy generated:`, !!contentStrategyData);

    console.log('🤝 Generating introduction matches...');
    const introMatches = await generateIntroductionMatches(resultsData);
    console.log(`   ✅ Generated ${introMatches?.length || 0} introduction matches`);

    const response = {
      success: true,
      insights: insights,
      topValueConnections: topValueConnections || [],
      contentStrategy: contentStrategyData || null,
      introductionMatches: introMatches || [],
      generatedAt: new Date().toISOString()
    };

    console.log('📤 Returning response with:', {
      insightsCount: insights?.actionItems?.length || 0,
      topValueConnectionsCount: response.topValueConnections.length,
      hasContentStrategy: !!response.contentStrategy,
      introMatchesCount: response.introductionMatches.length,
    });

    return NextResponse.json(response);

  } catch (error: any) {
    console.error("AI Insights error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate insights: " + (error?.message || 'Unknown error') },
      { status: 500 }
    );
  }
}
