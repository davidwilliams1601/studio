import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { analysisData, userPlan } = await req.json();

    if (!analysisData) {
      return NextResponse.json({ error: 'Analysis data is required' }, { status: 400 });
    }

    if (userPlan !== 'pro' && userPlan !== 'enterprise') {
      return NextResponse.json({ error: 'AI features require Pro or Business plan' }, { status: 403 });
    }

    const { connectionCount, messageCount, articleCount } = analysisData;

    const postSuggestions = [
      `Share insights about professional networking with your ${connectionCount} connections`,
      `Write about lessons learned from your ${messageCount} meaningful conversations`,
      `Create content about your expertise shown in your ${articleCount} posts`
    ];

    const networkInsights = [
      `Your network of ${connectionCount} connections shows strong professional reach`,
      `Your ${messageCount} messages demonstrate active engagement`,
      `Your ${articleCount} posts show consistent thought leadership`
    ];

    const growthRecommendations = [
      "Share industry insights weekly to establish thought leadership",
      "Connect with 5-10 new professionals weekly",
      "Engage meaningfully with your connections' content",
      "Post consistently about your professional expertise"
    ];

    return NextResponse.json({
      data: {
        postSuggestions,
        networkInsights,
        growthRecommendations
      }
    });

  } catch (error: any) {
    console.error('AI insights generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI insights' },
      { status: 500 }
    );
  }
}
