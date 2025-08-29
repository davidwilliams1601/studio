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
      return [];
    }
    
    try {
      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysisData,
          userTier,
          customPrompt
        })
      });
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      return data.insights || [];
      
    } catch (error) {
      console.error('AI analysis error:', error);
      return [];
    }
  }
}
