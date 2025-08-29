export interface AIAnalysisRequest {
  analysisData: any;
  userTier: 'free' | 'pro' | 'enterprise';
  customPrompt?: string;
}

export interface AIInsight {
  type: 'networking' | 'growth' | 'strategy' | 'opportunities';
  title: string;
  content: string;
  confidence: number;
}

export class AIAnalysisService {
  static async generateAIInsights(request: AIAnalysisRequest): Promise<AIInsight[]> {
    const { analysisData, userTier, customPrompt } = request;
    
    if (userTier === 'free') {
      return []; // No AI insights for free tier
    }
    
    try {
      const prompt = customPrompt || this.buildDefaultPrompt(analysisData, userTier);
      
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            { role: "user", content: prompt }
          ]
        })
      });
      
      const data = await response.json();
      const aiResponse = data.content[0].text;
      
      return this.parseAIResponse(aiResponse, userTier);
      
    } catch (error) {
      console.error('AI analysis error:', error);
      return [];
    }
  }
  
  static buildDefaultPrompt(analysisData: any, userTier: 'pro' | 'enterprise'): string {
    const { stats, analytics } = analysisData;
    
    let prompt = `Analyze this LinkedIn professional network data and provide strategic insights:

Network Overview:
- ${stats.connections} total connections
- ${stats.companies} different companies
- ${Object.keys(analytics.industries).length} industries represented
- Top industries: ${Object.entries(analytics.industries).slice(0, 3).map(([industry, count]) => `${industry} (${count})`).join(', ')}

Please provide 3-4 actionable insights in JSON format:
{
  "insights": [
    {
      "type": "networking|growth|strategy|opportunities",
      "title": "Brief title",
      "content": "Detailed insight with specific recommendations",
      "confidence": 0.85
    }
  ]
}

Focus on:
- Strategic networking opportunities
- Professional growth recommendations
- Industry positioning advice`;

    if (userTier === 'enterprise') {
      prompt += `
- Competitive advantages
- Market expansion opportunities
- Leadership positioning strategies`;
    }
    
    return prompt;
  }
  
  static parseAIResponse(response: string, userTier: 'pro' | 'enterprise'): AIInsight[] {
    try {
      // Clean the response to extract JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return [];
      
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.insights || [];
      
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return [];
    }
  }
  
  static async generateCustomAnalysis(
    analysisData: any, 
    prompt: string, 
    userTier: 'enterprise'
  ): Promise<string> {
    if (userTier !== 'enterprise') {
      throw new Error('Custom analysis only available for Enterprise tier');
    }
    
    const fullPrompt = `Based on this LinkedIn network data:
${JSON.stringify(analysisData.stats, null, 2)}

User's custom analysis request: ${prompt}

Provide a detailed strategic analysis:`;
    
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        messages: [
          { role: "user", content: fullPrompt }
        ]
      })
    });
    
    const data = await response.json();
    return data.content[0].text;
  }
}
