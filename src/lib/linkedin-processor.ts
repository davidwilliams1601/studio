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
  profile?: {
    firstName: string;
    lastName: string;
    headline: string;
    industry: string;
    summary: string;
  };
  connectionsList?: Array<{
    firstName: string;
    lastName: string;
    email: string;
    company: string;
    position: string;
    connectedOn: string;
  }>;
  topValueConnections?: Array<{
    name: string;
    company: string;
    position: string;
    reason: string;
  }>;
  contentStrategy?: {
    currentActivity: string;
    recommendations: string[];
    contentIdeas: string[];
    postingFrequency: string;
  };
  introductionMatches?: Array<{
    person1: string;
    person2: string;
    reason: string;
    introTemplate: string;
  }>;
}

/**
 * Process LinkedIn data export ZIP file
 */
export async function processLinkedInZip(
  file: ArrayBuffer,
  options: { includeConnectionsList?: boolean; fileName?: string } = {}
): Promise<LinkedInAnalysisResult> {
  const zip = await JSZip.loadAsync(file);

  // Log all files in the ZIP for debugging with sizes
  console.log('📦 Files in ZIP:');
  const fileEntries = Object.entries(zip.files)
    .filter(([, file]) => !file.dir)
    .sort(([pathA], [pathB]) => pathA.localeCompare(pathB));

  for (const [path, file] of fileEntries) {
    // Use _data.uncompressedSize from JSZip instead of reading content
    const sizeKB = (((file as any)._data?.uncompressedSize || 0) / 1024).toFixed(1);
    console.log(`  - ${path} (${sizeKB} KB)`);
  }

  const result: LinkedInAnalysisResult = {
    fileName: options.fileName || 'linkedin-data.zip',
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
  await processProfile(zip, result);
  await processConnections(zip, result, options.includeConnectionsList);
  await processMessages(zip, result);
  await processShares(zip, result);
  await processComments(zip, result);
  await processReactions(zip, result);
  await processCompanies(zip, result);
  await processInvitations(zip, result);
  await processSkills(zip, result);

  // Note: Insights are now generated in the API route based on subscription tier
  // Free tier gets basic insights, Pro/Business/Enterprise get AI-powered insights

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
  if (!file) {
    console.log('⚠️ Connections.csv not found in ZIP');
    return;
  }

  console.log('📁 Processing Connections.csv...');
  const content = await file.async('text');
  console.log(`📄 File size: ${content.length} bytes`);

  const rows = parseCSV(content);
  console.log(`👥 Found ${rows.length} connections`);

  if (rows.length > 0) {
    console.log('📋 First connection sample:', {
      firstName: rows[0]['First Name'] || rows[0]['first name'],
      lastName: rows[0]['Last Name'] || rows[0]['last name'],
      company: rows[0]['Company'] || rows[0]['company']
    });
  }

  result.stats.connections = rows.length;

  // Analyze connections data
  const companies: { [key: string]: number } = {};
  const positions: { [key: string]: number } = {};
  const locations: { [key: string]: number } = {};
  const connectionsList: Array<any> = [];

  // Log first row to see available columns
  if (rows.length > 0) {
    console.log('📋 Connections CSV columns:', Object.keys(rows[0]));
    console.log('📋 First connection sample:', rows[0]);
  }

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

  console.log(`📊 Analytics extracted:`);
  console.log(`  - Companies: ${Object.keys(companies).length} unique (${Object.values(companies).reduce((a, b) => a + b, 0)} total)`);
  console.log(`  - Positions: ${Object.keys(positions).length} unique (${Object.values(positions).reduce((a, b) => a + b, 0)} total)`);
  console.log(`  - Locations: ${Object.keys(locations).length} unique (${Object.values(locations).reduce((a, b) => a + b, 0)} total)`);
  console.log(`  - Top 3 Companies:`, Object.entries(companies).slice(0, 3));
  console.log(`  - Top 3 Locations:`, Object.entries(locations).slice(0, 3));

  if (includeList) {
    result.connectionsList = connectionsList;
  }
}

/**
 * Process messages.csv and alternative message files
 */
async function processMessages(zip: JSZip, result: LinkedInAnalysisResult): Promise<void> {
  // LinkedIn messages can be in different files depending on export settings
  const messageFilePatterns = [
    'messages.csv',
    'Messages.csv',
    'coach_messages.csv',
    'learning_coach_messages.csv',
    'LearningCoachMessages.csv',
    'learning_role_play_messages.csv'
  ];

  let totalMessages = 0;
  const foundFiles: string[] = [];
  const processedPaths = new Set<string>(); // Track already processed file paths

  console.log('🔍 Searching for message files...');

  for (const pattern of messageFilePatterns) {
    const file = findFile(zip, pattern);
    if (!file) {
      console.log(`❌ ${pattern} - not found`);
      continue;
    }

    const filePath = (file as any).name;

    // Skip if we've already processed this file
    if (processedPaths.has(filePath)) {
      console.log(`⏭️  ${pattern} - already processed as ${filePath}`);
      continue;
    }

    processedPaths.add(filePath);

    console.log(`📨 Found file for pattern "${pattern}":`, {
      path: filePath,
      uncompressedSize: (file as any)._data?.uncompressedSize,
    });

    const content = await file.async('text');
    console.log(`  📄 Content read: ${content.length} bytes`);
    console.log(`  📄 First 200 chars:`, content.substring(0, 200));

    // Skip files that are empty or only contain headers
    if (content.length < 150) {
      console.log(`  ⏩ Skipping ${pattern} - appears to be empty (only headers)`);
      continue;
    }

    const rows = parseCSV(content);
    console.log(`  💬 Contains ${rows.length} message rows`);

    if (rows.length > 0) {
      foundFiles.push(pattern);
      totalMessages += rows.length;

      // Log first message sample from files with data
      console.log(`  📋 Sample from ${pattern}:`, {
        from: rows[0]['FROM'] || rows[0]['From'] || rows[0]['SENDER'],
        subject: rows[0]['SUBJECT'] || rows[0]['Subject'],
        date: rows[0]['DATE'] || rows[0]['Date'] || rows[0]['SENT AT']
      });
    }
  }

  if (foundFiles.length === 0) {
    console.log('⚠️ No message files with data found in ZIP');
  } else {
    console.log(`✅ Processed ${foundFiles.length} message file(s): ${foundFiles.join(', ')}`);
    console.log(`📊 Total messages: ${totalMessages}`);
  }

  result.stats.messages = totalMessages;
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
 * Process Invitations.csv - Extract detailed connection information
 */
async function processInvitations(zip: JSZip, result: LinkedInAnalysisResult): Promise<void> {
  const file = findFile(zip, 'Invitations.csv') || findFile(zip, 'invitations.csv');
  if (!file) return;

  const content = await file.async('text');
  const rows = parseCSV(content);
  result.stats.invitations = rows.length;

  // Extract detailed connection information for AI analysis
  const connections: Array<{
    firstName: string;
    lastName: string;
    email: string;
    company: string;
    position: string;
    connectedOn: string;
  }> = [];

  // Log first row to see structure
  if (rows.length > 0) {
    console.log('📨 Invitations CSV columns:', Object.keys(rows[0]));
    console.log('📨 Sample invitation:', rows[0]);
  }

  rows.forEach(row => {
    // Invitations.csv has "From" and "To" fields instead of First/Last Name
    let firstName = '';
    let lastName = '';

    // Try to extract from "To" field (the person being invited)
    const toField = row['To'] || row['to'] || '';
    if (toField) {
      const nameParts = toField.trim().split(' ');
      if (nameParts.length >= 2) {
        firstName = nameParts[0];
        lastName = nameParts.slice(1).join(' ');
      } else {
        firstName = toField;
      }
    }

    // Fallback to standard fields
    if (!firstName && !lastName) {
      firstName = cleanText(row['First Name'] || row['first name'] || '');
      lastName = cleanText(row['Last Name'] || row['last name'] || '');
    }

    const company = cleanText(row['Company'] || row['company'] || '');
    const position = cleanText(row['Position'] || row['position'] || '');

    // Only include connections with meaningful data (at least a name)
    if (firstName || lastName || toField) {
      connections.push({
        firstName,
        lastName,
        email: cleanText(row['Email'] || row['email'] || ''),
        company: company || 'Unknown',
        position: position || 'Unknown',
        connectedOn: row['Sent At'] || row['sent at'] || row['Connected On'] || ''
      });
    }
  });

  // Store connection details for AI analysis (limit to last 1000 for performance)
  result.connectionsList = connections.slice(0, 1000);

  console.log(`✅ Extracted ${connections.length} detailed connections from Invitations.csv`);
  if (connections.length > 0) {
    console.log(`📋 Sample connection:`, connections[0]);
  }
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
 * Process Profile.csv - Extract user's profile information
 */
async function processProfile(zip: JSZip, result: LinkedInAnalysisResult): Promise<void> {
  const file = findFile(zip, 'Profile.csv') || findFile(zip, 'profile.csv');
  if (!file) {
    console.log('⚠️ Profile.csv not found');
    return;
  }

  try {
    const content = await file.async('text');
    const rows = parseCSV(content);

    if (rows.length === 0) {
      console.log('⚠️ Profile.csv is empty');
      return;
    }

    const profileRow = rows[0];
    console.log('👤 Profile data columns:', Object.keys(profileRow));
    console.log('👤 Profile sample:', profileRow);

    result.profile = {
      firstName: cleanText(profileRow['First Name'] || profileRow['first name'] || ''),
      lastName: cleanText(profileRow['Last Name'] || profileRow['last name'] || ''),
      headline: cleanText(profileRow['Headline'] || profileRow['headline'] || ''),
      industry: cleanText(profileRow['Industry'] || profileRow['industry'] || ''),
      summary: cleanText(profileRow['Summary'] || profileRow['summary'] || ''),
    };

    console.log(`✅ Profile extracted: ${result.profile.firstName} ${result.profile.lastName}`);
    console.log(`   Headline: ${result.profile.headline}`);
    console.log(`   Industry: ${result.profile.industry}`);
  } catch (error) {
    console.error('❌ Error processing profile:', error);
  }
}

/**
 * Find a file in the ZIP (case-insensitive, exact filename match)
 */
function findFile(zip: JSZip, fileName: string): JSZip.JSZipObject | null {
  const lowerFileName = fileName.toLowerCase();

  for (const [path, file] of Object.entries(zip.files)) {
    if (file.dir) continue;

    // Extract just the filename from the path (handle subdirectories)
    const pathFileName = path.split('/').pop()?.toLowerCase() || '';

    // Exact filename match (not just "ends with")
    if (pathFileName === lowerFileName) {
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

// Note: Insight generation has been moved to /lib/ai-analysis.ts
// Basic insights for Free tier, AI-powered insights for Pro/Business/Enterprise tiers
