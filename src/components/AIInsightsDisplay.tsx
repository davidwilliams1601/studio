// src/components/AIInsightsDisplay.tsx
'use client';

import React, { useState } from 'react';
import { Loader2, Brain, TrendingUp, Target, AlertCircle, Sparkles, ChevronRight, BarChart3, Users, Zap } from 'lucide-react';

// Type definitions for AI insights
interface NetworkHealth {
  score: number;
  assessment: string;
  recommendations: string[];
}

interface ContentStrategy {
  rating: string;
  advice: string;
  suggestions: string[];
}

interface ActionItem {
  priority: 'High' | 'Medium' | 'Low';
  action: string;
  timeline: string;
  expectedImpact: string;
}

interface AIInsights {
  networkHealth: NetworkHealth;
  contentStrategy: ContentStrategy;
  keyInsights: string[];
  actionItems: ActionItem[];
  industryTrends?: string;
  networkingOpportunities?: string;
  strengths?: string[];
  improvements?: string[];
}

interface AnalysisData {
  stats: {
    connections: number;
    posts: number;
    messages: number;
    comments: number;
    companies: number;
  };
  analytics: {
    industries: Record<string, number>;
    locations: Record<string, number>;
    skillsCount: number;
  };
  fileName: string;
}

interface AIInsightsDisplayProps {
  analysisData: AnalysisData;
}

export default function AIInsightsDisplay({ analysisData }: AIInsightsDisplayProps) {
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAIInsights = async () => {
    setLoading(true);
    setError(null);

    try {
      // Generate the AI prompt based on the data
      const topIndustries = Object.entries(analysisData.analytics.industries || {})
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([name, count]) => `${name}: ${count}`)
        .join(', ');

      const topLocations = Object.entries(analysisData.analytics.locations || {})
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([name, count]) => `${name}: ${count}`)
        .join(', ');

      const prompt = `
        Analyze this LinkedIn profile data and provide strategic insights:
        
        Profile Statistics:
        - Total Connections: ${analysisData.stats.connections}
        - Posts Created: ${analysisData.stats.posts}
        - Messages Sent: ${analysisData.stats.messages}
        - Comments Made: ${analysisData.stats.comments}
        - Companies Following: ${analysisData.stats.companies}
        
        Top Industries: ${topIndustries}
        Top Locations: ${topLocations}
        Skills Listed: ${analysisData.analytics.skillsCount}
        
        Provide professional insights focusing on:
        1. Network health and quality assessment
        2. Content strategy recommendations
        3. Career growth opportunities
        4. Networking strategy improvements
        5. Industry positioning analysis
      `;

      // Call the AI analysis endpoint
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate insights');
      }

      // Transform the AI response into our structured format
      const insights = data.insights || {};
      
      // Calculate network health score based on actual metrics
      const networkScore = calculateNetworkScore(analysisData);
      
      const structuredInsights: AIInsights = {
        networkHealth: {
          score: networkScore,
          assessment: insights.networkAnalysis || generateDefaultAssessment(analysisData),
          recommendations: parseRecommendations(insights.strengths) || generateDefaultRecommendations(analysisData)
        },
        contentStrategy: {
          rating: getContentRating(analysisData),
          advice: insights.contentStrategy || generateDefaultContentAdvice(analysisData),
          suggestions: parseRecommendations(insights.improvements) || generateDefaultSuggestions(analysisData)
        },
        keyInsights: parseRecommendations(insights.actionItems) || generateDefaultInsights(analysisData),
        actionItems: generateActionItems(insights, analysisData),
        industryTrends: insights.industryTrends,
        networkingOpportunities: insights.networkingOpportunities,
        strengths: insights.strengths,
        improvements: insights.improvements
      };

      setAiInsights(structuredInsights);
    } catch (err: any) {
      console.error('AI Insights Error:', err);
      setError(err.message || 'Failed to generate AI insights');
      
      // Fallback to local insights if AI fails
      setAiInsights(generateFallbackInsights(analysisData));
    } finally {
      setLoading(false);
    }
  };

  // Helper function to parse recommendations from AI response
  const parseRecommendations = (data: string[] | undefined): string[] | null => {
    if (!data || !Array.isArray(data)) return null;
    return data.filter(item => item && typeof item === 'string');
  };

  // Helper functions for calculating scores and generating defaults
  const calculateNetworkScore = (data: AnalysisData): number => {
    let score = 50;
    const connections = data.stats.connections;
    
    if (connections > 500) score += 10;
    if (connections > 1000) score += 10;
    if (connections > 3000) score += 10;
    if (connections > 5000) score += 10;
    
    if (data.stats.posts > 50) score += 10;
    if (data.stats.posts > 100) score += 10;
    
    const engagementRate = data.stats.posts > 0 ? (data.stats.comments / data.stats.posts) : 0;
    if (engagementRate > 2) score += 10;
    if (engagementRate > 5) score += 10;
    
    if (data.analytics.skillsCount > 10) score += 5;
    if (data.analytics.skillsCount > 20) score += 5;
    
    return Math.min(score, 100);
  };

  const getContentRating = (data: AnalysisData): string => {
    const posts = data.stats.posts;
    if (posts > 100) return 'Excellent';
    if (posts > 50) return 'Very Good';
    if (posts > 20) return 'Good';
    if (posts > 10) return 'Fair';
    return 'Needs Improvement';
  };

  const generateDefaultAssessment = (data: AnalysisData): string => {
    const connections = data.stats.connections;
    if (connections > 3000) {
      return `Outstanding network with ${connections.toLocaleString()} connections. You're in the top 5% of LinkedIn users.`;
    } else if (connections > 1000) {
      return `Strong professional network with ${connections.toLocaleString()} connections showing excellent reach.`;
    } else if (connections > 500) {
      return `Growing network with ${connections.toLocaleString()} connections. Good foundation for expansion.`;
    }
    return `Developing network with ${connections.toLocaleString()} connections. Focus on strategic growth.`;
  };

  const generateDefaultRecommendations = (data: AnalysisData): string[] => {
    const recommendations = [];
    
    if (data.stats.connections > 1000) {
      recommendations.push('Focus on deepening existing relationships');
      recommendations.push('Leverage your network for strategic introductions');
    } else {
      recommendations.push('Expand your network strategically');
      recommendations.push('Connect with industry leaders');
    }
    
    if (data.stats.posts < 50) {
      recommendations.push('Increase content creation frequency');
    }
    
    recommendations.push('Engage more with your network\'s content');
    
    return recommendations;
  };

  const generateDefaultContentAdvice = (data: AnalysisData): string => {
    const posts = data.stats.posts;
    const engagement = data.stats.comments;
    
    if (posts > 50 && engagement > 100) {
      return 'Your content strategy is performing well with strong engagement. Focus on maintaining consistency.';
    } else if (posts > 20) {
      return 'Good content creation habits. Increase engagement by asking questions and sharing insights.';
    }
    return 'Increase your content frequency to build thought leadership and visibility.';
  };

  const generateDefaultSuggestions = (data: AnalysisData): string[] => {
    const suggestions = [];
    const topIndustry = Object.entries(data.analytics.industries)[0]?.[0] || 'your industry';
    
    suggestions.push(`Share insights about ${topIndustry} trends`);
    suggestions.push('Create how-to posts about your expertise');
    suggestions.push('Celebrate team and peer achievements');
    
    if (data.stats.posts < 50) {
      suggestions.push('Aim for 2-3 posts per week');
    }
    
    return suggestions;
  };

  const generateDefaultInsights = (data: AnalysisData): string[] => {
    const insights = [];
    
    insights.push(`Your ${data.stats.connections.toLocaleString()} connections represent significant professional capital`);
    
    if (data.stats.posts > 0) {
      insights.push(`${data.stats.posts} posts demonstrate thought leadership`);
    }
    
    const topLocations = Object.keys(data.analytics.locations).length;
    insights.push(`Network spans ${topLocations} geographic regions`);
    
    const topIndustries = Object.keys(data.analytics.industries).length;
    insights.push(`Connections across ${topIndustries} different industries`);
    
    if (data.stats.messages > 100) {
      insights.push(`Active networker with ${data.stats.messages.toLocaleString()} messages exchanged`);
    }
    
    return insights.slice(0, 5);
  };

  const generateActionItems = (insights: any, data: AnalysisData): ActionItem[] => {
    const items: ActionItem[] = [];
    
    if (data.stats.posts < 50) {
      items.push({
        priority: 'High',
        action: 'Increase content creation to 2-3 posts per week',
        timeline: 'Next 30 days',
        expectedImpact: 'Boost visibility and thought leadership'
      });
    }
    
    if (data.stats.connections < 1000) {
      items.push({
        priority: 'Medium',
        action: 'Grow network by 50 strategic connections',
        timeline: 'Next 60 days',
        expectedImpact: 'Expand professional opportunities'
      });
    }
    
    items.push({
      priority: 'Medium',
      action: 'Engage with 5 posts daily from your network',
      timeline: 'Ongoing',
      expectedImpact: 'Strengthen relationships and visibility'
    });
    
    if (data.analytics.skillsCount < 15) {
      items.push({
        priority: 'Low',
        action: 'Update profile with additional skills',
        timeline: 'Next 14 days',
        expectedImpact: 'Improve profile searchability'
      });
    }
    
    return items.slice(0, 3);
  };

  const generateFallbackInsights = (data: AnalysisData): AIInsights => {
    return {
      networkHealth: {
        score: calculateNetworkScore(data),
        assessment: generateDefaultAssessment(data),
        recommendations: generateDefaultRecommendations(data)
      },
      contentStrategy: {
        rating: getContentRating(data),
        advice: generateDefaultContentAdvice(data),
        suggestions: generateDefaultSuggestions(data)
      },
      keyInsights: generateDefaultInsights(data),
      actionItems: generateActionItems({}, data)
    };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-500';
      case 'Medium': return 'bg-amber-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-blue-500';
    if (score >= 40) return 'text-amber-500';
    return 'text-red-500';
  };

  // Render the component
  return (
    <div className="w-full space-y-6">
      {/* Component JSX here - use the full component from the first artifact */}
      {/* This is abbreviated for space - copy the full JSX from the React artifact above */}
    </div>
  );
}
