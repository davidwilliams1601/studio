import JSZip from 'jszip';
import {
  ParsedLinkedInExport,
  LinkedInConnection,
  LinkedInPosition,
  LinkedInEducation,
  LinkedInSkill,
  LinkedInProfileData,
  Recommendation,
  SecurityCheckResult,
  MAX_EXTRACTED_SIZE,
  MAX_FILE_COUNT,
  MAX_INDIVIDUAL_FILE,
} from '@/types/linkedin';

/**
 * Security check for ZIP file before extraction
 * Protects against ZIP bombs and malicious files
 */
export async function securityCheckZip(
  zipBuffer: Buffer
): Promise<SecurityCheckResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const zip = await JSZip.loadAsync(zipBuffer);

    let totalExtractedSize = 0;
    let fileCount = 0;

    // Check each file in the ZIP
    for (const [path, file] of Object.entries(zip.files)) {
      fileCount++;

      // Check file count limit
      if (fileCount > MAX_FILE_COUNT) {
        errors.push(`Too many files in archive (max ${MAX_FILE_COUNT})`);
        break;
      }

      if (!file.dir) {
        // Get uncompressed size
        const uncompressedSize = file._data?.uncompressedSize || 0;

        // Check individual file size
        if (uncompressedSize > MAX_INDIVIDUAL_FILE) {
          errors.push(
            `File ${path} is too large (${(uncompressedSize / 1024 / 1024).toFixed(2)}MB)`
          );
        }

        totalExtractedSize += uncompressedSize;

        // Check total extracted size
        if (totalExtractedSize > MAX_EXTRACTED_SIZE) {
          errors.push(
            `Total extracted size would exceed ${MAX_EXTRACTED_SIZE / 1024 / 1024}MB`
          );
          break;
        }

        // Check for suspicious paths (path traversal)
        if (path.includes('..') || path.startsWith('/')) {
          errors.push(`Suspicious path detected: ${path}`);
        }
      }
    }

    // Warnings
    if (totalExtractedSize > 100 * 1024 * 1024) {
      warnings.push('Large archive size may take longer to process');
    }

    return {
      passed: errors.length === 0,
      errors,
      warnings,
    };
  } catch (error: any) {
    return {
      passed: false,
      errors: [`Failed to read ZIP file: ${error.message}`],
      warnings: [],
    };
  }
}

/**
 * Detect LinkedIn export version based on file structure
 */
export async function detectExportVersion(
  zip: JSZip
): Promise<'v1' | 'v2' | 'unknown'> {
  const files = Object.keys(zip.files);

  // Check for common LinkedIn export files
  const hasConnectionsCSV = files.some(f => f.toLowerCase().includes('connections.csv'));
  const hasProfileCSV = files.some(f => f.toLowerCase().includes('profile.csv'));
  const hasPositionsCSV = files.some(f => f.toLowerCase().includes('positions.csv'));

  if (hasConnectionsCSV || hasProfileCSV || hasPositionsCSV) {
    return 'v1'; // Standard format
  }

  return 'unknown';
}

/**
 * Parse CSV data into array of objects
 */
function parseCSV(content: string): Record<string, string>[] {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];

  // Parse header
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

  // Parse rows
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === headers.length) {
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      rows.push(row);
    }
  }

  return rows;
}

/**
 * Parse a single CSV line handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

/**
 * Parse LinkedIn Connections.csv
 */
async function parseConnections(zip: JSZip): Promise<LinkedInConnection[]> {
  const file = zip.file(/connections\.csv$/i)[0];
  if (!file) return [];

  const content = await file.async('text');
  const rows = parseCSV(content);

  return rows.map(row => ({
    firstName: row['First Name'] || row['firstName'] || '',
    lastName: row['Last Name'] || row['lastName'] || '',
    emailAddress: row['Email Address'] || row['email'] || undefined,
    company: row['Company'] || row['company'] || undefined,
    position: row['Position'] || row['position'] || undefined,
    connectedOn: row['Connected On'] || row['connectedOn'] || undefined,
  }));
}

/**
 * Parse LinkedIn Profile.csv
 */
async function parseProfile(zip: JSZip): Promise<LinkedInProfileData | undefined> {
  const file = zip.file(/profile\.csv$/i)[0];
  if (!file) return undefined;

  const content = await file.async('text');
  const rows = parseCSV(content);

  if (rows.length === 0) return undefined;

  const row = rows[0];
  return {
    firstName: row['First Name'] || row['firstName'] || '',
    lastName: row['Last Name'] || row['lastName'] || '',
    headline: row['Headline'] || row['headline'] || undefined,
    summary: row['Summary'] || row['summary'] || undefined,
    industry: row['Industry'] || row['industry'] || undefined,
    location: row['Location'] || row['location'] || undefined,
    emailAddress: row['Email Address'] || row['email'] || undefined,
  };
}

/**
 * Parse LinkedIn Positions.csv
 */
async function parsePositions(zip: JSZip): Promise<LinkedInPosition[]> {
  const file = zip.file(/positions\.csv$/i)[0];
  if (!file) return [];

  const content = await file.async('text');
  const rows = parseCSV(content);

  return rows.map(row => ({
    companyName: row['Company Name'] || row['companyName'] || '',
    title: row['Title'] || row['title'] || '',
    description: row['Description'] || row['description'] || undefined,
    location: row['Location'] || row['location'] || undefined,
    startDate: row['Started On'] || row['startDate'] || undefined,
    endDate: row['Finished On'] || row['endDate'] || undefined,
  }));
}

/**
 * Parse LinkedIn Education.csv
 */
async function parseEducation(zip: JSZip): Promise<LinkedInEducation[]> {
  const file = zip.file(/education\.csv$/i)[0];
  if (!file) return [];

  const content = await file.async('text');
  const rows = parseCSV(content);

  return rows.map(row => ({
    schoolName: row['School Name'] || row['schoolName'] || '',
    degree: row['Degree Name'] || row['degree'] || undefined,
    fieldOfStudy: row['Field Of Study'] || row['fieldOfStudy'] || undefined,
    startDate: row['Start Date'] || row['startDate'] || undefined,
    endDate: row['End Date'] || row['endDate'] || undefined,
  }));
}

/**
 * Parse LinkedIn Skills.csv
 */
async function parseSkills(zip: JSZip): Promise<LinkedInSkill[]> {
  const file = zip.file(/skills\.csv$/i)[0];
  if (!file) return [];

  const content = await file.async('text');
  const rows = parseCSV(content);

  return rows.map(row => ({
    name: row['Name'] || row['name'] || '',
    endorsementCount: parseInt(row['Endorsement Count'] || row['endorsementCount'] || '0', 10) || undefined,
  }));
}

/**
 * Parse LinkedIn Recommendations.csv
 */
async function parseRecommendations(zip: JSZip): Promise<Recommendation[]> {
  const file = zip.file(/recommendations\.csv$/i)[0];
  if (!file) return [];

  const content = await file.async('text');
  const rows = parseCSV(content);

  return rows.map(row => ({
    recommenderName: row['Name'] || row['recommenderName'] || '',
    recommenderHeadline: row['Headline'] || row['headline'] || undefined,
    relationship: row['Relationship'] || row['relationship'] || '',
    text: row['Text'] || row['text'] || '',
    date: row['Date'] || row['date'] || undefined,
  }));
}

/**
 * Main parser function
 * Parses LinkedIn export ZIP file and extracts all data
 */
export async function parseLinkedInExport(
  zipBuffer: Buffer
): Promise<ParsedLinkedInExport> {
  // Security check
  const securityCheck = await securityCheckZip(zipBuffer);
  if (!securityCheck.passed) {
    throw new Error(`Security check failed: ${securityCheck.errors.join(', ')}`);
  }

  // Load ZIP
  const zip = await JSZip.loadAsync(zipBuffer);

  // Detect version
  const version = await detectExportVersion(zip);

  // Parse all data
  const [profile, connections, positions, education, skills, recommendations] = await Promise.all([
    parseProfile(zip),
    parseConnections(zip),
    parsePositions(zip),
    parseEducation(zip),
    parseSkills(zip),
    parseRecommendations(zip),
  ]);

  return {
    profile,
    connections,
    positions,
    education,
    skills,
    recommendations,
    exportDate: new Date().toISOString(),
    version,
  };
}
