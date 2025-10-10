/**
 * CSV Parser for LinkedIn data files
 * Handles parsing of various LinkedIn CSV exports
 */

export interface ParsedCSVRow {
  [key: string]: string;
}

/**
 * Parse CSV content into array of objects
 * Handles LinkedIn's specific CSV format with BOM and various encodings
 */
export function parseCSV(content: string): ParsedCSVRow[] {
  // Remove BOM if present
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }

  const lines = content.split('\n').map(line => line.trim()).filter(line => line);

  if (lines.length === 0) return [];

  // Extract headers (first line)
  const headers = parseCSVLine(lines[0]);

  // Parse data rows
  const rows: ParsedCSVRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);

    if (values.length === headers.length) {
      const row: ParsedCSVRow = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      rows.push(row);
    }
  }

  return rows;
}

/**
 * Parse a single CSV line, handling quoted values and commas within quotes
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Add last field
  result.push(current.trim());

  return result;
}

/**
 * Safe date parser for LinkedIn date formats
 */
export function parseLinkedInDate(dateString: string): Date | null {
  if (!dateString) return null;

  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

/**
 * Clean and normalize text from CSV
 */
export function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
