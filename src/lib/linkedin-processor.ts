/**
 * LinkedIn Data Processor
 * Handles extraction and analysis of LinkedIn data export ZIP files
 */

import JSZip from 'jszip';
import { parseCSV, parseLinkedInDate, cleanText } from './csv-parser';

export interface LinkedInAnalysisResult {
  fileName: string;
  processedAt: string;
  stats: {
    connections: number;
    messages: number;
    posts: number;
    comments: number;
    reactions: number;
    companies: number;
    invitations: number;
  };
  analytics: {
    industries: { [key: string]: number };
    locations: { [key: string]: number };
    topCompanies: { [key: string]: number };
    positions: { [key: string]: number };
    skillsCount: number;
    connectionsByMonth: { [key: string]: number };
  };
  insights: string[];
  connectionsList?: Array<{
    firstName: string;
    lastName: string;
    email: string;
    company: string;
    position: string;
    connectedOn: string;
  }>;
}

/**
 * Process LinkedIn data export ZIP file
 */
export async function processLinkedInZip(
  file: File | ArrayBuffer,
  options: { includeConnectionsList?: boolean } = {}
): Promise<LinkedInAnalysisResult> {
  const zip = await JSZip.loadAsync(file);

  const result: LinkedInAnalysisResult = {
    fileName: file instanceof File ? file.name : 'linkedin-data.zip',
    processedAt: new Date().toISOString(),
    stats: {
      connections: 0,
      messages: 0,
      posts: 0,
      comments: 0,
      reactions: 0,
      companies: 0,
      invitations: 0,
    },
    analytics: {
      industries: {},
      locations: {},
      topCompanies: {},
      positions: {},
      skillsCount: 0,
      connectionsByMonth: {},
    },
    insights: [],
  };

  // Process each CSV file type
  await processConnections(zip, result, options.includeConnectionsList);
  await processMessages(zip, result);
  await processShares(zip, result);
  await processComments(zip, result);
  await processReactions(zip, result);
  await processCompanies(zip, result);
  await processInvitations(zip, result);
  await processSkills(zip, result);

  // Generate insights based on the data
  generateInsights(result);

  return result;
}

/**
 * Process Connections.csv
 */
async function processConnections(
  zip: JSZip,
  result: LinkedInAnalysisResult,
  includeList: boolean = false
): Promise<void> {
  const file = findFile(zip, 'Connections.csv');
  if (!file) return;

  const content = await file.async('text');
  const rows = parseCSV(content);

  result.stats.connections = rows.length;

  // Analyze connections data
  const companies: { [key: string]: number } = {};
  const positions: { [key: string]: number } = {};
  const locations: { [key: string]: number } = {};
  const connectionsList: Array<any> = [];

  rows.forEach(row => {
    // Extract company
    const company = cleanText(row['Company'] || row['company'] || '');
    if (company && company !== 'N/A') {
      companies[company] = (companies[company] || 0) + 1;
    }

    // Extract position
    const position = cleanText(row['Position'] || row['position'] || '');
    if (position && position !== 'N/A') {
      positions[position] = (positions[position] || 0) + 1;
    }

    // Extract location
    const location = cleanText(row['Location'] || row['location'] || '');
    if (location && location !== 'N/A') {
      locations[location] = (locations[location] || 0) + 1;
    }

    // Track connections by month
    const connectedOn = row['Connected On'] || row['connected on'] || '';
    if (connectedOn) {
      const date = parseLinkedInDate(connectedOn);
      if (date) {
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        result.analytics.connectionsByMonth[monthKey] =
          (result.analytics.connectionsByMonth[monthKey] || 0) + 1;
      }
    }

    // Store connection details if requested
    if (includeList) {
      connectionsList.push({
        firstName: cleanText(row['First Name'] || row['first name'] || ''),
        lastName: cleanText(row['Last Name'] || row['last name'] || ''),
        email: cleanText(row['Email Address'] || row['email'] || ''),
        company: company,
        position: position,
        connectedOn: connectedOn,
      });
    }
  });

  // Store top companies
  result.analytics.topCompanies = getTopN(companies, 10);
  result.analytics.positions = getTopN(positions, 10);
  result.analytics.locations = getTopN(locations, 10);

  if (includeList) {
    result.connectionsList = connectionsList;
  }
}

/**
 * Process messages.csv
 */
async function processMessages(zip: JSZip, result: LinkedInAnalysisResult): Promise<void> {
  const file = findFile(zip, 'messages.csv');
  if (!file) return;

  const content = await file.async('text');
  const rows = parseCSV(content);
  result.stats.messages = rows.length;
}

/**
 * Process Shares.csv (Posts)
 */
async function processShares(zip: JSZip, result: LinkedInAnalysisResult): Promise<void> {
  const file = findFile(zip, 'Shares.csv') || findFile(zip, 'shares.csv');
  if (!file) return;

  const content = await file.async('text');
  const rows = parseCSV(content);
  result.stats.posts = rows.length;
}

/**
 * Process Comments.csv
 */
async function processComments(zip: JSZip, result: LinkedInAnalysisResult): Promise<void> {
  const file = findFile(zip, 'Comments.csv') || findFile(zip, 'comments.csv');
  if (!file) return;

  const content = await file.async('text');
  const rows = parseCSV(content);
  result.stats.comments = rows.length;
}

/**
 * Process Reactions.csv
 */
async function processReactions(zip: JSZip, result: LinkedInAnalysisResult): Promise<void> {
  const file = findFile(zip, 'Reactions.csv') || findFile(zip, 'reactions.csv');
  if (!file) return;

  const content = await file.async('text');
  const rows = parseCSV(content);
  result.stats.reactions = rows.length;
}

/**
 * Process Company Follows.csv
 */
async function processCompanies(zip: JSZip, result: LinkedInAnalysisResult): Promise<void> {
  const file = findFile(zip, 'Company Follows.csv') || findFile(zip, 'Following.csv');
  if (!file) return;

  const content = await file.async('text');
  const rows = parseCSV(content);
  result.stats.companies = rows.length;
}

/**
 * Process Invitations.csv
 */
async function processInvitations(zip: JSZip, result: LinkedInAnalysisResult): Promise<void> {
  const file = findFile(zip, 'Invitations.csv') || findFile(zip, 'invitations.csv');
  if (!file) return;

  const content = await file.async('text');
  const rows = parseCSV(content);
  result.stats.invitations = rows.length;
}

/**
 * Process Skills.csv
 */
async function processSkills(zip: JSZip, result: LinkedInAnalysisResult): Promise<void> {
  const file = findFile(zip, 'Skills.csv') || findFile(zip, 'skills.csv');
  if (!file) return;

  const content = await file.async('text');
  const rows = parseCSV(content);
  result.analytics.skillsCount = rows.length;
}

/**
 * Find a file in the ZIP (case-insensitive)
 */
function findFile(zip: JSZip, fileName: string): JSZip.JSZipObject | null {
  const lowerFileName = fileName.toLowerCase();

  for (const [path, file] of Object.entries(zip.files)) {
    if (!file.dir && path.toLowerCase().endsWith(lowerFileName)) {
      return file;
    }
  }

  return null;
}

/**
 * Get top N items from a frequency map
 */
function getTopN(map: { [key: string]: number }, n: number): { [key: string]: number } {
  const sorted = Object.entries(map)
    .sort(([, a], [, b]) => b - a)
    .slice(0, n);

  return Object.fromEntries(sorted);
}

/**
 * Generate insights based on analyzed data
 */
function generateInsights(result: LinkedInAnalysisResult): void {
  const insights: string[] = [];

  // Connection insights
  if (result.stats.connections > 0) {
    insights.push(`You have ${result.stats.connections.toLocaleString()} professional connections`);

    const locationCount = Object.keys(result.analytics.locations).length;
    if (locationCount > 0) {
      insights.push(`Your network spans ${locationCount} different locations`);
    }

    const topCompanies = Object.entries(result.analytics.topCompanies);
    if (topCompanies.length > 0) {
      const [topCompany, count] = topCompanies[0];
      insights.push(`${topCompany} has the most connections in your network (${count})`);
    }
  }

  // Engagement insights
  if (result.stats.posts > 0) {
    insights.push(`You've shared ${result.stats.posts.toLocaleString()} posts`);
  }

  if (result.stats.comments > 0) {
    insights.push(`You've written ${result.stats.comments.toLocaleString()} comments`);
  }

  if (result.stats.reactions > 0) {
    insights.push(`You've reacted to ${result.stats.reactions.toLocaleString()} posts`);
  }

  // Company follows
  if (result.stats.companies > 0) {
    insights.push(`You follow ${result.stats.companies.toLocaleString()} companies`);
  }

  // Skills
  if (result.analytics.skillsCount > 0) {
    insights.push(`You have ${result.analytics.skillsCount} skills listed on your profile`);
  }

  // Messages
  if (result.stats.messages > 0) {
    insights.push(`You've exchanged ${result.stats.messages.toLocaleString()} messages`);
  }

  // Growth insights
  const monthsWithData = Object.keys(result.analytics.connectionsByMonth).length;
  if (monthsWithData > 0) {
    const sortedMonths = Object.entries(result.analytics.connectionsByMonth)
      .sort(([a], [b]) => b.localeCompare(a));

    if (sortedMonths.length >= 2) {
      const [recentMonth, recentCount] = sortedMonths[0];
      insights.push(`You connected with ${recentCount} people in your most recent month`);
    }
  }

  result.insights = insights;
}
