const generateEnhancedInsights = (results) => {
  const { stats, analytics } = results;
  const insights = [];
  
  // Connection analysis with benchmarking
  const connectionSize = stats.connections;
  let connectionBenchmark = "";
  if (connectionSize > 5000) {
    connectionBenchmark = "placing you in the top 5% of LinkedIn users";
  } else if (connectionSize > 2000) {
    connectionBenchmark = "placing you in the top 15% of LinkedIn users";
  } else if (connectionSize > 1000) {
    connectionBenchmark = "placing you above average for LinkedIn professionals";
  } else {
    connectionBenchmark = "providing a solid foundation for professional networking";
  }
  
  insights.push(`You have ${connectionSize.toLocaleString()} professional connections, ${connectionBenchmark}`);
  
  // Industry analysis with specific numbers
  const industries = Object.entries(analytics.industries).sort(([,a], [,b]) => b - a);
  const topIndustry = industries[0];
  const industryCount = industries.length;
  
  if (topIndustry && topIndustry[1] > 100) {
    insights.push(`Strong presence in ${topIndustry[0]} (${topIndustry[1].toLocaleString()} connections) gives you significant influence in this sector`);
  }
  
  if (industryCount >= 7) {
    insights.push(`Your network spans ${industryCount} industries, putting you in the top 15% for professional diversity`);
  } else if (industryCount >= 5) {
    insights.push(`Your network spans ${industryCount} industries, showing good professional diversity`);
  }
  
  // Company reach analysis
  if (stats.companies > 3000) {
    insights.push(`Connected to ${stats.companies.toLocaleString()} different companies, providing exceptional business reach`);
  } else if (stats.companies > 1000) {
    insights.push(`Connected to ${stats.companies.toLocaleString()} different companies, offering strong business development potential`);
  }
  
  // Content engagement analysis
  if (stats.posts > 300) {
    insights.push(`${stats.posts} posts demonstrate exceptional thought leadership and content creation`);
  } else if (stats.posts > 100) {
    insights.push(`${stats.posts} posts show strong professional content creation above average for LinkedIn users`);
  }
  
  // Message activity insights
  if (stats.messages > 3000) {
    insights.push(`${stats.messages.toLocaleString()} message conversations indicate highly active networking and relationship building`);
  } else if (stats.messages > 1000) {
    insights.push(`${stats.messages.toLocaleString()} message conversations show strong engagement with your professional network`);
  }
  
  // Skills analysis
  if (analytics.skillsCount > 20) {
    insights.push(`${analytics.skillsCount} endorsed skills demonstrate comprehensive professional expertise`);
  } else if (analytics.skillsCount > 10) {
    insights.push(`${analytics.skillsCount} endorsed skills show solid professional credibility`);
  }
  
  // Network quality analysis
  const seniorityLevels = analytics.networkQuality.topSeniorityLevels;
  const seniorConnections = (seniorityLevels['C-Level/Founder'] || 0) + (seniorityLevels['Senior Leadership'] || 0);
  const totalMappedConnections = Object.values(seniorityLevels).reduce((sum, count) => sum + count, 0);
  
  if (seniorConnections > 0 && totalMappedConnections > 0) {
    const seniorPercentage = Math.round((seniorConnections / totalMappedConnections) * 100);
    if (seniorPercentage > 30) {
      insights.push(`${seniorPercentage}% of your network holds senior leadership positions, indicating exceptional access to decision-makers`);
    } else if (seniorPercentage > 15) {
      insights.push(`${seniorPercentage}% of your network holds senior leadership positions, providing good access to industry leaders`);
    }
  }
  
  // Top company analysis
  const topCompanies = Object.entries(analytics.topCompanies).sort(([,a], [,b]) => b - a).slice(0, 3);
  if (topCompanies.length > 0 && topCompanies[0][1] > 10) {
    const companyNames = topCompanies.map(([name, count]) => `${name} (${count})`).join(', ');
    insights.push(`Strongest company connections include: ${companyNames}`);
  }
  
  return insights;
};
