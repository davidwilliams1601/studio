import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const { analysisData, userTier, customPrompt } = await request.json();
    
    if (userTier === 'free') {
      return NextResponse.json({ insights: [] });
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = customPrompt || buildDefaultPrompt(analysisData, userTier);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const insights = parseAIResponse(text, userTier);
    return NextResponse.json({ insights });
    
  } catch (error) {
    console.error('Google AI analysis error:', error);
    return NextResponse.json({ 
      insights: [],
      error: 'AI analysis temporarily unavailable' 
    });
  }
}

function buildDefaultPrompt(analysisData: any, userTier: 'pro' | 'enterprise'): string {
  const { stats, analytics } = analysisData;
  
  let prompt = `Analyze this LinkedIn network data and provide strategic insights:

Network Overview:
- ${stats.connections.toLocaleString()} total connections
- ${stats.companies.toLocaleString()} different companies
- ${Object.keys(analytics.industries).length} industries represented

Provide exactly 3 actionable insights in this JSON format:
{
  "insights": [
    {
      "type": "networking",
      "title": "Brief insight title",
      "content": "Detailed actionable recommendation",
      "confidence": 0.85
    }
  ]
}

Focus on strategic networking opportunities and professional growth.`;
  
  return prompt;
}

function parseAIResponse(response: string, userTier: 'pro' | 'enterprise'): any[] {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return [];
    
    const parsed = JSON.parse(jsonMatch[0]);
    return parsed.insights || [];
  } catch (error) {
    return [];
  }
}
