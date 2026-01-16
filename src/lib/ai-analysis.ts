/**
 * AI-Powered LinkedIn Data Analysis using Google Gemini
 * Available for Pro, Business, and Enterprise subscription tiers
 */

import { LinkedInAnalysisResult } from './linkedin-processor';

/**
 * Generate AI-powered insights using Google Gemini
 * Only available for paid subscription tiers (Pro, Business, Enterprise)
 */
export async function generateAIInsights(
  data: LinkedInAnalysisResult
): Promise<string[]> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;

  console.log('🔍 AI Insights Debug:');
  console.log(`  - API Key configured: ${apiKey ? 'YES' : 'NO'}`);

  if (!apiKey || apiKey === 'your_google_ai_api_key_here') {
    console.warn('⚠️ Google AI API key not configured. Using basic insights.');
    return generateBasicInsights(data);
  }

  try {
    // Use REST API directly to bypass SDK model issues
    const prompt = buildAnalysisPrompt(data);

    console.log('🤖 Generating AI-powered insights with Google Gemini...');
    console.log(`📝 Prompt length: ${prompt.length} characters`);

    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    console.log(`🌐 API URL: ${url.substring(0, 80)}...`);

    const requestBody = {
      contents: [{
        parts: [{ text: prompt }]
      }]
    };

    console.log(`📤 Request body: ${JSON.stringify(requestBody).substring(0, 200)}...`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log(`📥 Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Gemini API error response: ${errorText}`);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log(`📋 Response structure: ${JSON.stringify(Object.keys(result))}`);

    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log(`📝 AI response text length: ${text?.length || 0}`);
    console.log(`📝 AI response preview: ${text?.substring(0, 200) || 'NO TEXT'}...`);

    // Parse the AI response into individual insights
    const insights = parseAIResponse(text);

    console.log(`✅ Generated ${insights.length} AI-powered insights`);
    insights.forEach((insight, i) => {
      console.log(`  ${i + 1}. ${insight.substring(0, 60)}...`);
    });

    return insights;

  } catch (error: any) {
    console.error('❌ AI analysis error:', error.message);
    console.error('❌ Full error:', error);
    console.log('⚠️ Falling back to basic insights');
    return generateBasicInsights(data);
  }
}

/**
 * Build a comprehensive prompt for AI analysis
 */
function buildAnalysisPrompt(data: LinkedInAnalysisResult): string {
  const stats = data.stats;
  const analytics = data.analytics;
  const profile = data.profile;

  const topCompanies = Object.entries(analytics.topCompanies)
    .slice(0, 5)
    .map(([company, count]) => `${company} (${count})`)
    .join(', ');

  const topPositions = Object.entries(analytics.positions)
    .slice(0, 5)
    .map(([position, count]) => `${position} (${count})`)
    .join(', ');

  const topLocations = Object.entries(analytics.locations)
    .slice(0, 5)
    .map(([location, count]) => `${location} (${count})`)
    .join(', ');

  // Calculate engagement metrics
  const totalEngagement = stats.posts + stats.comments + stats.reactions;
  const engagementRate = stats.connections > 0
    ? (totalEngagement / stats.connections * 100).toFixed(1)
    : 0;

  const profileInfo = profile ? `
**Your Profile:**
- Name: ${profile.firstName} ${profile.lastName}
- Headline: ${profile.headline || 'Not specified'}
- Industry: ${profile.industry || 'Not specified'}
- Summary: ${profile.summary ? profile.summary.substring(0, 200) : 'Not specified'}` : '';

  return `Analyze this LinkedIn professional network data and provide 6-8 actionable insights. Focus on network composition, engagement patterns, career growth opportunities, and strategic recommendations.
${profileInfo}

**Network Statistics:**
- Total Connections: ${stats.connections.toLocaleString()}
- Messages Exchanged: ${stats.messages.toLocaleString()}
- Posts Shared: ${stats.posts.toLocaleString()}
- Comments Written: ${stats.comments.toLocaleString()}
- Reactions Given: ${stats.reactions.toLocaleString()}
- Companies Followed: ${stats.companies.toLocaleString()}
- Invitations Sent: ${stats.invitations.toLocaleString()}
- Skills Listed: ${analytics.skillsCount}

**Network Composition:**
- Top Companies: ${topCompanies || 'N/A'}
- Top Positions: ${topPositions || 'N/A'}
- Top Locations: ${topLocations || 'N/A'}
- Unique Locations: ${Object.keys(analytics.locations).length}

**Engagement Metrics:**
- Total Engagement Actions: ${totalEngagement.toLocaleString()}
- Engagement Rate: ${engagementRate}% (engagement per connection)

**Instructions:**
1. Provide 6-8 specific, actionable insights
2. Each insight should be 1-2 sentences maximum
3. Focus on: network diversity, industry presence, engagement patterns, career opportunities, and strategic networking recommendations based on the user's profile
4. Use specific numbers from the data to support insights
5. Be professional and constructive
6. Format as a numbered list (1. 2. 3. etc.)
7. Do NOT use markdown formatting or bullet points - just plain numbered text

Example format:
1. Your network of 5,000+ connections spans diverse industries, with strongest representation in technology and finance sectors.
2. Your engagement rate of 15% suggests active participation - consider focusing on quality interactions with key connections.`;
}

/**
 * Parse AI response into individual insights
 */
function parseAIResponse(text: string): string[] {
  // Remove markdown formatting if present
  text = text.replace(/\*\*/g, '').replace(/\*/g, '').trim();

  // Split by numbered lines (1. 2. 3. etc.)
  const insights: string[] = [];
  const lines = text.split('\n');

  let currentInsight = '';

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    // Check if line starts with a number (1. 2. 3. etc.)
    const numberMatch = trimmedLine.match(/^(\d+)\.\s*(.+)/);

    if (numberMatch) {
      // Save previous insight if exists
      if (currentInsight) {
        insights.push(currentInsight.trim());
      }
      // Start new insight (without the number)
      currentInsight = numberMatch[2];
    } else {
      // Continuation of current insight
      currentInsight += ' ' + trimmedLine;
    }
  }

  // Add last insight
  if (currentInsight) {
    insights.push(currentInsight.trim());
  }

  return insights.filter(insight => insight.length > 0);
}

/**
 * Generate top 5 valuable connection recommendations using AI
 */
export async function generateValueConnectionRecommendations(
  data: LinkedInAnalysisResult
): Promise<Array<{name: string; company: string; position: string; reason: string}>> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;

  if (!apiKey || apiKey === 'your_google_ai_api_key_here' || !data.profile) {
    console.log('⚠️ Skipping valuable connection recommendations (no API key or profile)');
    return [];
  }

  // Check if we have actual connection data with meaningful information
  if (!data.connectionsList || data.connectionsList.length === 0) {
    console.log('⚠️ No connection details available for recommendations');
    return [];
  }

  // Check if connections have company/position data (not just names)
  const connectionsWithDetails = data.connectionsList.filter(
    c => c.company && c.company !== 'Unknown' && c.position && c.position !== 'Unknown'
  );

  if (connectionsWithDetails.length < 5) {
    console.log(`⚠️ Not enough detailed connection data (only ${connectionsWithDetails.length} with company/position info)`);
    console.log('💡 Generating strategic connection recommendations based on profile instead');

    // Generate strategic recommendations based on profile instead
    return generateStrategicConnectionRecommendations(data);
  }

  try {
    const prompt = buildValueConnectionPrompt(data);

    console.log('🎯 Generating top 5 valuable connection recommendations from your network...');
    console.log(`📊 Analyzing ${data.connectionsList.length} connections`);

    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

    // Parse the response - expecting format like:
    // 1. Name: John Doe | Company: Google | Position: CEO | Reason: ...
    const recommendations = parseValueConnectionResponse(text);

    console.log(`✅ Generated ${recommendations.length} valuable connection recommendations`);
    recommendations.forEach((rec, i) => {
      console.log(`  ${i + 1}. ${rec.name} - ${rec.position} at ${rec.company}`);
    });

    return recommendations;

  } catch (error: any) {
    console.error('❌ Value connection recommendations error:', error.message);
    return [];
  }
}

/**
 * Generate strategic connection recommendations based on profile
 */
async function generateStrategicConnectionRecommendations(
  data: LinkedInAnalysisResult
): Promise<Array<{name: string; company: string; position: string; reason: string}>> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;

  if (!apiKey || apiKey === 'your_google_ai_api_key_here' || !data.profile) {
    return [];
  }

  try {
    const prompt = buildStrategicConnectionPrompt(data);

    console.log('🎯 Generating strategic connection recommendations...');

    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

    const recommendations = parseValueConnectionResponse(text);

    console.log(`✅ Generated ${recommendations.length} strategic connection recommendations`);
    recommendations.forEach((rec, i) => {
      console.log(`  ${i + 1}. ${rec.name} - ${rec.position} at ${rec.company}`);
    });

    return recommendations;

  } catch (error: any) {
    console.error('❌ Strategic connection recommendations error:', error.message);
    return [];
  }
}

/**
 * Build prompt for strategic connection recommendations
 */
function buildStrategicConnectionPrompt(data: LinkedInAnalysisResult): string {
  const profile = data.profile!;
  const stats = data.stats;
  const topCompanies = Object.entries(data.analytics.topCompanies).slice(0, 10);

  return `Based on this professional's LinkedIn profile and network composition, recommend the TOP 5 STRATEGIC TYPES OF CONNECTIONS they should actively seek out and reach out to for maximum career growth and impact.

**Their Profile:**
- Name: ${profile.firstName} ${profile.lastName}
- Headline: ${profile.headline || 'Not specified'}
- Industry: ${profile.industry || 'Not specified'}
- Summary: ${profile.summary ? profile.summary.substring(0, 400) : 'Not specified'}

**Their Network:**
- Total Connections: ${stats.connections.toLocaleString()}
- Network Engagement: ${stats.messages.toLocaleString()} messages, ${stats.posts} posts, ${stats.reactions.toLocaleString()} reactions
- Top Companies in Network: ${topCompanies.map(([c]) => c).join(', ') || 'Various'}

**Instructions:**
1. Analyze their role, industry, and career trajectory
2. Identify 5 specific TYPES of professionals they should proactively reach out to
3. Consider:
   - People who can advance their career goals
   - Industry leaders and influencers in their field
   - Potential collaborators, partners, or clients
   - Mentors with relevant expertise
   - Decision-makers at target companies
4. For each recommendation, specify:
   - The type/title of person (e.g., "VP of Community at EdTech Startups")
   - Type of company or industry sector
   - The role/position level
   - WHY this type of connection is strategically valuable for their specific goals

5. Format EXACTLY as follows (one per line):
1. Name: [Type/Title of Person] | Company: [Type of Company/Industry] | Position: [Position/Level] | Reason: [Specific strategic value for ${profile.firstName}'s career in ${profile.industry}]
2. Name: [Type/Title of Person] | Company: [Type of Company/Industry] | Position: [Position/Level] | Reason: [Strategic value]
...

Example:
1. Name: VP of Community Strategy | Company: Leading EdTech Platforms | Position: Senior Leadership | Reason: Can provide insights into scaling community programs in education and potential partnership opportunities for community building initiatives

Make recommendations highly specific to their role as ${profile.headline} in ${profile.industry}.`;
}

/**
 * Build prompt for valuable connection recommendations
 */
function buildValueConnectionPrompt(data: LinkedInAnalysisResult): string {
  const profile = data.profile!;
  const connections = data.connectionsList!;

  // Group connections by company and position for better analysis
  const connectionsWithDetails = connections
    .filter(c => (c.company || c.position) && (c.firstName || c.lastName))
    .slice(0, 200); // Limit to 200 most recent for prompt size

  // Create a formatted list of connections
  const connectionsList = connectionsWithDetails
    .map(c => {
      const name = `${c.firstName} ${c.lastName}`.trim();
      const company = c.company || 'Unknown Company';
      const position = c.position || 'Unknown Position';
      return `- ${name} | ${position} at ${company}`;
    })
    .join('\n');

  return `Based on this LinkedIn user's profile and their ACTUAL network connections, identify the TOP 5 MOST VALUABLE specific people they should prioritize engaging with or strengthening relationships with.

**User Profile:**
- Name: ${profile.firstName} ${profile.lastName}
- Headline: ${profile.headline || 'Not specified'}
- Industry: ${profile.industry || 'Not specified'}
- Summary: ${profile.summary ? profile.summary.substring(0, 300) : 'Not specified'}

**Their Actual Network Connections (${connectionsWithDetails.length} shown):**
${connectionsList}

**Instructions:**
1. Analyze the ACTUAL connections listed above
2. Select 5 SPECIFIC REAL PEOPLE from this list who would be most valuable for this user's career growth
3. Consider:
   - Relevance to their industry and headline
   - Senior positions (C-level, Directors, VPs, Founders)
   - Companies that align with their career goals
   - Potential for mentorship, collaboration, or career opportunities
4. For each person selected, explain WHY they are valuable
5. Format EXACTLY as follows (one per line):
1. Name: [Actual Person's Full Name] | Company: [Their Company] | Position: [Their Position] | Reason: [Specific reason why this person is valuable for ${profile.firstName}'s career in ${profile.industry || 'their field'}]
2. Name: [Actual Person's Full Name] | Company: [Their Company] | Position: [Their Position] | Reason: [Specific reason why valuable]
...

IMPORTANT:
- Use ONLY real names from the connection list provided
- Do NOT make up names or connections
- The name, company, and position must match exactly from the list above
- If fewer than 5 valuable connections exist, return only those that are truly valuable`;
}

/**
 * Parse value connection recommendations response
 */
function parseValueConnectionResponse(text: string): Array<{name: string; company: string; position: string; reason: string}> {
  const recommendations: Array<{name: string; company: string; position: string; reason: string}> = [];

  if (!text) return recommendations;

  const lines = text.split('\n');

  for (const line of lines) {
    // Match format: "1. Name: ... | Company: ... | Position: ... | Reason: ..."
    const match = line.match(/^\d+\.\s*Name:\s*(.+?)\s*\|\s*Company:\s*(.+?)\s*\|\s*Position:\s*(.+?)\s*\|\s*Reason:\s*(.+?)$/);

    if (match) {
      recommendations.push({
        name: match[1].trim(),
        company: match[2].trim(),
        position: match[3].trim(),
        reason: match[4].trim()
      });
    }
  }

  return recommendations;
}

/**
 * Generate content strategy recommendations using AI
 */
export async function generateContentStrategy(
  data: LinkedInAnalysisResult
): Promise<{currentActivity: string; recommendations: string[]; contentIdeas: string[]; postingFrequency: string} | null> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;

  if (!apiKey || apiKey === 'your_google_ai_api_key_here' || !data.profile) {
    console.log('⚠️ Skipping content strategy (no API key or profile)');
    return null;
  }

  try {
    const prompt = buildContentStrategyPrompt(data);

    console.log('📝 Generating content strategy recommendations...');

    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

    const strategy = parseContentStrategyResponse(text, data);

    console.log(`✅ Generated content strategy with ${strategy.contentIdeas.length} content ideas`);
    return strategy;

  } catch (error: any) {
    console.error('❌ Content strategy error:', error.message);
    return null;
  }
}

/**
 * Build prompt for content strategy
 */
function buildContentStrategyPrompt(data: LinkedInAnalysisResult): string {
  const profile = data.profile!;
  const stats = data.stats;

  const engagementRate = stats.connections > 0
    ? ((stats.posts + stats.comments + stats.reactions) / stats.connections * 100).toFixed(1)
    : 0;

  return `As a LinkedIn content strategist, analyze this professional's profile and activity, then provide a comprehensive content strategy.

**Their Profile:**
- Name: ${profile.firstName} ${profile.lastName}
- Headline: ${profile.headline}
- Industry: ${profile.industry}
- Summary: ${profile.summary?.substring(0, 400) || 'Not provided'}

**Current Activity:**
- Network Size: ${stats.connections.toLocaleString()} connections
- Posts Shared: ${stats.posts}
- Comments Written: ${stats.comments.toLocaleString()}
- Reactions Given: ${stats.reactions.toLocaleString()}
- Engagement Rate: ${engagementRate}%

**Task:** Provide a content strategy with:

1. **CURRENT_ACTIVITY**: One sentence assessing their current content activity level
2. **RECOMMENDATIONS**: 3-5 specific strategic recommendations for improving their content presence
3. **CONTENT_IDEAS**: 8-10 specific, actionable content topics they should write about (highly relevant to their role as ${profile.headline} in ${profile.industry})
4. **POSTING_FREQUENCY**: Recommended posting frequency with rationale

**Format your response EXACTLY as:**

CURRENT_ACTIVITY: [One sentence assessment]

RECOMMENDATIONS:
1. [First recommendation]
2. [Second recommendation]
3. [Third recommendation]

CONTENT_IDEAS:
1. [Specific content topic 1]
2. [Specific content topic 2]
3. [Specific content topic 3]
4. [Specific content topic 4]
5. [Specific content topic 5]
6. [Specific content topic 6]
7. [Specific content topic 7]
8. [Specific content topic 8]

POSTING_FREQUENCY: [Recommended frequency and why]

Make all recommendations highly specific to their role, industry, and current activity level.`;
}

/**
 * Parse content strategy response
 */
function parseContentStrategyResponse(text: string, data: LinkedInAnalysisResult): {
  currentActivity: string;
  recommendations: string[];
  contentIdeas: string[];
  postingFrequency: string;
} {
  const result = {
    currentActivity: '',
    recommendations: [] as string[],
    contentIdeas: [] as string[],
    postingFrequency: ''
  };

  if (!text) return result;

  const lines = text.split('\n');
  let currentSection = '';

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    if (trimmedLine.startsWith('CURRENT_ACTIVITY:')) {
      result.currentActivity = trimmedLine.replace('CURRENT_ACTIVITY:', '').trim();
    } else if (trimmedLine === 'RECOMMENDATIONS:') {
      currentSection = 'recommendations';
    } else if (trimmedLine === 'CONTENT_IDEAS:') {
      currentSection = 'contentIdeas';
    } else if (trimmedLine.startsWith('POSTING_FREQUENCY:')) {
      result.postingFrequency = trimmedLine.replace('POSTING_FREQUENCY:', '').trim();
      currentSection = '';
    } else if (currentSection === 'recommendations' && /^\d+\./.test(trimmedLine)) {
      result.recommendations.push(trimmedLine.replace(/^\d+\.\s*/, ''));
    } else if (currentSection === 'contentIdeas' && /^\d+\./.test(trimmedLine)) {
      result.contentIdeas.push(trimmedLine.replace(/^\d+\.\s*/, ''));
    }
  }

  return result;
}

/**
 * Generate introduction matchmaker recommendations using AI
 */
export async function generateIntroductionMatches(
  data: LinkedInAnalysisResult
): Promise<Array<{person1: string; person2: string; reason: string; introTemplate: string}>> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;

  if (!apiKey || apiKey === 'your_google_ai_api_key_here' || !data.profile || !data.connectionsList) {
    console.log('⚠️ Skipping introduction matches (no API key, profile, or connections)');
    return [];
  }

  // Filter connections with names
  const connectionsWithNames = data.connectionsList.filter(
    c => (c.firstName || c.lastName)
  ).slice(0, 100); // Limit to 100 for performance

  if (connectionsWithNames.length < 10) {
    console.log('⚠️ Not enough connections for introduction matching');
    return [];
  }

  try {
    const prompt = buildIntroductionMatchPrompt(data, connectionsWithNames);

    console.log('🤝 Generating introduction matches...');

    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

    const matches = parseIntroductionMatchesResponse(text);

    console.log(`✅ Generated ${matches.length} introduction matches`);
    return matches;

  } catch (error: any) {
    console.error('❌ Introduction matches error:', error.message);
    return [];
  }
}

/**
 * Build prompt for introduction matches
 */
function buildIntroductionMatchPrompt(
  data: LinkedInAnalysisResult,
  connections: Array<{firstName: string; lastName: string; company: string; position: string}>
): string {
  const profile = data.profile!;

  const connectionsList = connections
    .map(c => {
      const name = `${c.firstName} ${c.lastName}`.trim();
      const company = c.company && c.company !== 'Unknown' ? c.company : '';
      const position = c.position && c.position !== 'Unknown' ? c.position : '';
      const details = [position, company].filter(Boolean).join(' at ');
      return `- ${name}${details ? ` (${details})` : ''}`;
    })
    .join('\n');

  return `As a professional networker, analyze these connections and identify the TOP 3 MOST VALUABLE introduction opportunities - pairs of people who should meet each other.

**Network Owner:**
- ${profile.firstName} ${profile.lastName}
- ${profile.headline}
- Industry: ${profile.industry}

**Their Connections (${connections.length} people):**
${connectionsList}

**Task:**
1. Identify 3 pairs of connections who would benefit from knowing each other
2. Consider potential synergies: complementary skills, shared interests, business opportunities, mentorship
3. For each pair, provide a brief introduction template that ${profile.firstName} could use

**Format EXACTLY as:**
1. PAIR: [Person 1 Name] + [Person 2 Name] | REASON: [Why they should meet] | TEMPLATE: [2-3 sentence introduction message]
2. PAIR: [Person 1 Name] + [Person 2 Name] | REASON: [Why they should meet] | TEMPLATE: [2-3 sentence introduction message]
3. PAIR: [Person 1 Name] + [Person 2 Name] | REASON: [Why they should meet] | TEMPLATE: [2-3 sentence introduction message]

Example:
1. PAIR: John Smith + Mary Johnson | REASON: Both are in EdTech leadership roles and could collaborate on community initiatives | TEMPLATE: Hi John and Mary, I wanted to introduce you both as you're both leaders in the EdTech space focused on community building. John is working on X and Mary is doing Y - I thought you'd have valuable insights to share with each other.

Use ONLY names from the connection list above.`;
}

/**
 * Parse introduction matches response
 */
function parseIntroductionMatchesResponse(text: string): Array<{
  person1: string;
  person2: string;
  reason: string;
  introTemplate: string;
}> {
  const matches: Array<{person1: string; person2: string; reason: string; introTemplate: string}> = [];

  if (!text) return matches;

  const lines = text.split('\n');

  for (const line of lines) {
    // Match format: "1. PAIR: Name1 + Name2 | REASON: ... | TEMPLATE: ..."
    const match = line.match(/^\d+\.\s*PAIR:\s*(.+?)\s*\+\s*(.+?)\s*\|\s*REASON:\s*(.+?)\s*\|\s*TEMPLATE:\s*(.+?)$/);

    if (match) {
      matches.push({
        person1: match[1].trim(),
        person2: match[2].trim(),
        reason: match[3].trim(),
        introTemplate: match[4].trim()
      });
    }
  }

  return matches;
}

/**
 * Generate basic insights (fallback for free tier or when AI fails)
 */
export function generateBasicInsights(data: LinkedInAnalysisResult): string[] {
  const insights: string[] = [];
  const stats = data.stats;
  const analytics = data.analytics;

  // Connection insights
  if (stats.connections > 0) {
    insights.push(`You have ${stats.connections.toLocaleString()} professional connections`);

    const locationCount = Object.keys(analytics.locations).length;
    if (locationCount > 0) {
      insights.push(`Your network spans ${locationCount} different locations`);
    }

    const topCompanies = Object.entries(analytics.topCompanies);
    if (topCompanies.length > 0) {
      const [topCompany, count] = topCompanies[0];
      insights.push(`${topCompany} has the most connections in your network (${count})`);
    }
  }

  // Engagement insights
  if (stats.posts > 0) {
    insights.push(`You've shared ${stats.posts.toLocaleString()} posts`);
  }

  if (stats.comments > 0) {
    insights.push(`You've written ${stats.comments.toLocaleString()} comments`);
  }

  if (stats.reactions > 0) {
    insights.push(`You've reacted to ${stats.reactions.toLocaleString()} posts`);
  }

  // Message insights
  if (stats.messages > 0) {
    insights.push(`You've exchanged ${stats.messages.toLocaleString()} messages`);
  }

  // Company follows
  if (stats.companies > 0) {
    insights.push(`You follow ${stats.companies.toLocaleString()} companies`);
  }

  // Skills
  if (analytics.skillsCount > 0) {
    insights.push(`You have ${analytics.skillsCount} skills listed on your profile`);
  }

  return insights;
}
