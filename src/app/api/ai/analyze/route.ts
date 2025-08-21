// src/app/api/ai/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    console.log('AI Analysis API called');

    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Check if Google AI is available
    if (!process.env.GOOGLE_AI_API_KEY) {
      console.log('Google AI not configured, using enhanced fallback insights');
      
      // Parse the prompt to extract data
      const connectionMatch = prompt.match(/Total Connections: (\d+)/);
      const postsMatch = prompt.match(/Posts Created: (\d+)/);
      const messagesMatch = prompt.match(/Messages Sent: (\d+)/);
      
      const connections = connectionMatch ? parseInt(connectionMatch[1]) : 500;
      const posts = postsMatch ? parseInt(postsMatch[1]) : 10;
      const messages = messagesMatch ? parseInt(messagesMatch[1]) : 50;
      
      // Generate intelligent fallback based on actual data
      return NextResponse.json({
        success: true,
        insights: generateIntelligentFallback(connections, posts, messages)
      });
    }

    // Use Google AI with improved prompt
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
      
      console.log('Calling Gemini AI...');
      
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const enhancedPrompt = `
        You are a professional LinkedIn analytics expert and career strategist. ${prompt}
        
        Based on this data, provide highly personalized and actionable insights.
        
        IMPORTANT: Your response must be a valid JSON object with these exact keys:
        {
          "networkAnalysis": "2-3 sentences analyzing the network quality and reach",
          "contentStrategy": "2-3 sentences about content performance and recommendations",
          "careerGrowth": "2-3 sentences about career advancement opportunities",
          "networkingOpportunities": "2-3 sentences about networking strategies",
          "strengths": ["array", "of", "3-5", "key", "strengths"],
          "improvements": ["array", "of", "3-5", "areas", "to", "improve"],
          "actionItems": ["array", "of", "5-7", "specific", "action", "items"],
          "industryTrends": "2-3 sentences about relevant industry trends and positioning"
        }
        
        Make your insights specific, actionable, and based on the actual numbers provided.
        Focus on quality over generic advice.
        
        CRITICAL: Return ONLY valid JSON, no markdown formatting, no backticks, no explanations.
      `;

      const result = await model.generateContent(enhancedPrompt);
      const response = await result.response;
      const text = response.text();

      let insights;
      try {
        // Clean the response text
        let cleanText = text.trim();
        // Remove any markdown code blocks
        cleanText = cleanText.replace(/```json\n?/g, '').replace(/\n?```/g, '');
        // Remove any leading/trailing whitespace
        cleanText = cleanText.trim();
        
        // Parse the JSON
        insights = JSON.parse(cleanText);
        
        // Validate the structure
        const requiredKeys = [
          'networkAnalysis', 'contentStrategy', 'careerGrowth', 
          'networkingOpportunities', 'strengths', 'improvements', 
          'actionItems', 'industryTrends'
        ];
        
        for (const key of requiredKeys) {
          if (!insights[key]) {
            console.warn(`Missing key in AI response: ${key}`);
            // Provide defaults for missing keys
            if (key === 'strengths' || key === 'improvements' || key === 'actionItems') {
              insights[key] = [];
            } else {
              insights[key] = 'Analysis not available';
            }
          }
        }
        
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        console.log('Raw AI response:', text);
        
        // Fallback to structured response
        insights = generateStructuredFallback(prompt);
      }

      return NextResponse.json({
        success: true,
        insights
      });

    } catch (aiError: any) {
      console.error('Google AI error:', aiError);
      
      // Enhanced fallback with error context
      return NextResponse.json({
        success: true,
        insights: generateErrorFallback(aiError.message)
      });
    }

  } catch (error: any) {
    console.error('AI Analysis error:', error);
    
    return NextResponse.json(
      { error: error.message || 'An error occurred during AI analysis' },
      { status: 500 }
    );
  }
}

function generateIntelligentFallback(connections: number, posts: number, messages: number) {
  const networkSize = connections > 1000 ? 'large' : connections > 500 ? 'medium' : 'growing';
  const contentActivity = posts > 50 ? 'active' : posts > 20 ? 'moderate' : 'low';
  const engagementLevel = messages > 100 ? 'highly engaged' : messages > 50 ? 'engaged' : 'moderately engaged';
  
  return {
    networkAnalysis: `Your ${networkSize} network of ${connections.toLocaleString()} connections shows ${
      connections > 1000 ? 'excellent' : 'good'
    } professional reach. ${
      connections > 500 
        ? 'Focus on deepening relationships with key connections.' 
        : 'Continue expanding strategically in your target industries.'
    }`,
    
    contentStrategy: `With ${posts} posts, your content activity is ${contentActivity}. ${
      posts > 50 
        ? 'Your consistent posting demonstrates thought leadership.' 
        : 'Increasing posting frequency to 2-3 times per week will boost your visibility.'
    } Focus on sharing insights that showcase your expertise.`,
    
    careerGrowth: `Your ${engagementLevel} network with ${messages} messages exchanged indicates ${
      messages > 100 ? 'strong' : 'developing'
    } professional relationships. Leverage these connections for introductions to decision-makers in your target companies.`,
    
    networkingOpportunities: `${
      connections > 1000 
        ? 'With your extensive network, focus on strategic introductions and building deeper relationships with industry leaders.' 
        : 'Expand your network by connecting with 10-15 new professionals weekly in your industry.'
    } Engage with content from your connections to maintain visibility.`,
    
    strengths: [
      `${networkSize.charAt(0).toUpperCase() + networkSize.slice(1)} professional network`,
      `${engagementLevel.charAt(0).toUpperCase() + engagementLevel.slice(1)} networker`,
      connections > 500 ? 'Strong industry presence' : 'Growing industry presence',
      posts > 20 ? 'Active content creator' : 'Developing content presence',
      'Strategic network builder'
    ],
    
    improvements: [
      posts < 50 ? 'Increase posting frequency' : 'Diversify content types',
      'Engage more with others\' posts',
      connections < 1000 ? 'Expand network strategically' : 'Deepen key relationships',
      'Join relevant LinkedIn groups',
      'Schedule regular connection check-ins'
    ],
    
    actionItems: [
      `Post ${posts < 50 ? '2-3' : '3-4'} times per week`,
      'Comment on 5 posts daily from your network',
      connections < 1000 ? 'Send 10 connection requests weekly' : 'Schedule monthly calls with key connections',
      'Share one industry insight weekly',
      'Update profile headline and summary',
      'Request 3 recommendations',
      'Join 2 industry-specific groups'
    ],
    
    industryTrends: `Focus on emerging trends in digital transformation and AI integration. Position yourself as someone who understands both traditional and innovative approaches in your field.`
  };
}

function generateStructuredFallback(prompt: string) {
  // Extract some data from the prompt if possible
  const hasLargeNetwork = prompt.includes('000') || prompt.includes('k');
  const hasContent = prompt.includes('Posts') || prompt.includes('posts');
  
  return {
    networkAnalysis: hasLargeNetwork 
      ? "Your extensive network demonstrates strong professional influence. Focus on strategic engagement rather than growth."
      : "Your network shows potential for strategic expansion. Target connections in complementary industries.",
    
    contentStrategy: hasContent
      ? "Your content presence establishes thought leadership. Increase engagement through interactive posts and industry insights."
      : "Develop a consistent content strategy focusing on your expertise. Share insights 2-3 times weekly.",
    
    careerGrowth: "Leverage your network for strategic introductions. Position yourself for opportunities in emerging sectors.",
    
    networkingOpportunities: "Connect with professionals in adjacent industries. Attend virtual events and engage in group discussions.",
    
    strengths: [
      "Professional network foundation",
      "Industry expertise",
      "Strategic positioning",
      "Active engagement",
      "Growth mindset"
    ],
    
    improvements: [
      "Increase content frequency",
      "Engage with more posts",
      "Expand strategic connections",
      "Update profile regularly",
      "Join industry groups"
    ],
    
    actionItems: [
      "Post 2-3 times per week",
      "Comment on 5 posts daily",
      "Send 10 strategic connection requests weekly",
      "Update profile monthly",
      "Share industry articles",
      "Write one long-form post monthly",
      "Schedule networking calls"
    ],
    
    industryTrends: "Stay ahead of digital transformation trends. Position yourself at the intersection of traditional expertise and emerging technologies."
  };
}

function generateErrorFallback(errorMessage: string) {
  console.log('Generating error fallback due to:', errorMessage);
  
  return {
    networkAnalysis: "Your professional network provides a strong foundation. Continue building strategic connections in your industry.",
    contentStrategy: "Focus on creating valuable content that showcases your expertise. Consistency is key to building thought leadership.",
    careerGrowth: "Your LinkedIn presence positions you well for career advancement. Leverage your network for new opportunities.",
    networkingOpportunities: "Expand your network strategically by connecting with industry leaders and participating in relevant discussions.",
    strengths: [
      "Strong professional foundation",
      "Active LinkedIn presence",
      "Strategic network building",
      "Industry expertise",
      "Growth-oriented mindset"
    ],
    improvements: [
      "Increase posting frequency",
      "Engage more with your network",
      "Diversify connection industries",
      "Enhance profile optimization",
      "Join professional groups"
    ],
    actionItems: [
      "Create a content calendar",
      "Post 2-3 times weekly",
      "Engage with 5 posts daily",
      "Update profile quarterly",
      "Request recommendations",
      "Share industry insights",
      "Schedule networking meetings"
    ],
    industryTrends: "Focus on digital transformation and emerging technologies in your field. Position yourself as an adaptable professional ready for future challenges."
  };
}
        
