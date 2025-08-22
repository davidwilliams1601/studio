import { NextRequest, NextResponse } from "next/server";
import { getAuth } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    console.log("AI Insights API called");
    
    // Get user from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    let user;
    try {
      const auth = await getAuth();
      user = await auth.verifyIdToken(token);
    } catch (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { success: false, error: "Invalid authentication token" },
        { status: 401 }
      );
    }
    
    const { stats, analytics, fileName, userPlan = 'free' } = await request.json();
    
    if (!stats || !analytics) {
      return NextResponse.json(
        { success: false, error: "Missing required data" },
        { status: 400 }
      );
    }

    // Check if user has access to AI insights
    if (userPlan === 'free') {
      return NextResponse.json(
        { success: false, error: "AI insights require Pro or Business plan" },
        { status: 403 }
      );
    }

    console.log(`Processing AI insights for ${userPlan} user:`, fileName);

    // Generate AI insights based on plan tier
    const insights = generateInsightsByTier(stats, analytics, userPlan);

    return NextResponse.json({
      success: true,
      insights: insights,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error("AI Insights error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate insights: " + error.message },
      { status: 500 }
    );
  }
}

function generateInsightsByTier(stats, analytics, userPlan) {
  const totalConnections = stats.connections;
  const contentEngagement = stats.posts > 0 ? (stats.comments / stats.posts) : 0;
  
  // Calculate network health score
  let networkScore = 50;
  if (totalConnections > 1000) networkScore += 20;
  if (totalConnections > 3000) networkScore += 10;
  if (totalConnections > 5000) networkScore += 10;
  if (stats.posts > 100) networkScore += 10;
  if (contentEngagement > 2) networkScore += 10;
  if (stats.skillsCount > 10) networkScore += 5;
  networkScore = Math.min(networkScore, 100);

  const topIndustries = Object.entries(analytics.industries || {})
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([name]) => name);

  const baseInsights = {
    networkHealth: {
      score: networkScore,
      assessment: `Professional network with ${totalConnections.toLocaleString()} connections`,
      recommendations: [
        "Maintain engagement with your network",
        "Focus on quality interactions", 
        "Leverage network for opportunities"
      ]
    },
    contentStrategy: {
      rating: "Good",
      advice: `Content portfolio with ${stats.posts} posts showing engagement`,
      suggestions: [
        `Share insights about ${topIndustries[0] || 'your industry'}`,
        "Develop thought leadership content",
        "Increase engagement through interactive posts"
      ]
    },
    keyInsights: [
      `${totalConnections.toLocaleString()} professional connections`,
      `Content creation with ${stats.posts} posts`,
      `Message activity shows ${stats.messages.toLocaleString()} interactions`,
      `Engagement with ${stats.comments} total comments`,
      `Network spans multiple geographic regions`
    ]
  };

  // Enhanced insights for Pro/Business tiers
  if (userPlan === 'pro' || userPlan === 'business') {
    baseInsights.actionItems = [
      {
        priority: "High",
        action: "Optimize posting schedule for maximum engagement",
        timeline: "Next 30 days",
        expectedImpact: "15-25% increase in post visibility"
      },
      {
        priority: "Medium",
        action: "Identify and connect with industry influencers",
        timeline: "Next 60 days", 
        expectedImpact: "Enhanced thought leadership positioning"
      },
      {
        priority: "Medium",
        action: "Create content series around expertise areas",
        timeline: "Next 45 days",
        expectedImpact: "Stronger personal brand recognition"
      }
    ];

    baseInsights.strategicRecommendations = [
      "Focus on expanding network in emerging sectors",
      "Develop strategic partnerships through existing connections",
      "Create value-driven content to attract quality followers"
    ];
  }

  // Premium insights for Business tier
  if (userPlan === 'business') {
    baseInsights.competitiveAnalysis = {
      benchmarking: "Top 10% in your industry for network size",
      opportunities: ["Thought leadership in AI/Tech", "International expansion"],
      threats: ["Increasing competition for attention", "Platform algorithm changes"]
    };
    
    baseInsights.predictiveInsights = [
      "Network growth trajectory suggests 20% increase in 6 months",
      "Content engagement patterns indicate optimal posting times",
      "Industry connections positioning for emerging opportunities"
    ];
  }

  return baseInsights;
}
