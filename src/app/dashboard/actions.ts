'use server';

import { getStorage } from 'firebase-admin/storage';
import JSZip from 'jszip';
import { app } from '@/lib/firebase-admin';

function parseCsv(csv: string): string[][] {
  // A simple CSV parser. Note: This won't handle complex cases like quoted commas.
  if (!csv) return [];
  const lines = csv.split(/\r\n|\n/);
  return lines.map((line) => line.split(','));
}

export async function analyzeLinkedInDataAction(input: {
  storagePath: string;
}): Promise<{
  data?: {
    processedPath: string;
    connectionCount: number;
    messageCount: number;
    articleCount: number;
  };
  error?: string;
}> {
  try {
    const { storagePath } = input;
    const bucket = getStorage(app).bucket();
    const file = bucket.file(storagePath);
    const [buffer] = await file.download();

    const zip = await JSZip.loadAsync(buffer);

    const connectionsFile = zip.file(/connections.csv/i)[0];
    const connectionsContent = connectionsFile
      ? await connectionsFile.async('string')
      : '';
    const connectionsData = parseCsv(connectionsContent);
    // Subtract 1 for the header row
    const connectionCount = connectionsData.length > 0 ? connectionsData.length - 1 : 0;

    const messagesFile = zip.file(/messages.csv/i)[0];
    const messagesContent = messagesFile
      ? await messagesFile.async('string')
      : '';
    const messagesData = parseCsv(messagesContent);
    const messageCount = messagesData.length > 0 ? messagesData.length - 1 : 0;

    const articlesFile = zip.file(/articles.csv/i)[0];
    const articlesContent = articlesFile
      ? await articlesFile.async('string')
      : '';
    const articlesData = parseCsv(articlesContent);
    const articleCount = articlesData.length > 0 ? articlesData.length - 1 : 0;

    const profileFile = zip.file(/profile.json/i)[0];
    const profileContent = profileFile
      ? await profileFile.async('string')
      : 'File not found or empty.';

    const combinedData = `
--- CONNECTIONS ---
${connectionsContent}

--- MESSAGES ---
${messagesContent}

--- ARTICLES ---
${articlesContent}

--- PROFILE ---
${profileContent}
`;
    const processedPath = `processed/${storagePath
      .split('/')
      .pop()}-extracted.txt`;
    const processedFile = bucket.file(processedPath);
    await processedFile.save(Buffer.from(combinedData), {
      contentType: 'text/plain',
    });

    return {
      data: {
        processedPath,
        connectionCount,
        messageCount,
        articleCount,
      },
    };
  } catch (e: any) {
    console.error('Error in analyzeLinkedInDataAction:', e);
    return {
      error:
        'An unexpected error occurred during analysis. Please check the server logs.',
    };
  }
}
