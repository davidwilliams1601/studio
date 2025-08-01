'use server';

import { getStorage } from 'firebase-admin/storage';
import JSZip from 'jszip';
import { app } from '@/lib/firebase-admin';

// This function now returns a more robust, serializable object.
export async function analyzeLinkedInDataAction(input: {
  storagePath: string;
}): Promise<{ data?: { processedPath: string }; error?: string }> {
  try {
    const { storagePath } = input;

    const bucket = getStorage(app).bucket();
    const file = bucket.file(storagePath);
    const [buffer] = await file.download();

    const zip = await JSZip.loadAsync(buffer);

    // Simplified and more robust file extraction
    const connectionsFile = zip.file(/connections.csv/i)[0];
    const connections = connectionsFile ? await connectionsFile.async('string') : 'File not found or empty.';

    const messagesFile = zip.file(/messages.csv/i)[0];
    const messages = messagesFile ? await messagesFile.async('string') : 'File not found or empty.';

    const articlesFile = zip.file(/articles.csv/i)[0];
    const articles = articlesFile ? await articlesFile.async('string') : 'File not found or empty.';
    
    const profileFile = zip.file(/profile.json/i)[0];
    const profile = profileFile ? await profileFile.async('string') : 'File not found or empty.';


    const combinedData = `
--- CONNECTIONS ---
${connections}

--- MESSAGES ---
${messages}

--- ARTICLES ---
${articles}

--- PROFILE ---
${profile}
`;
    const processedPath = `processed/${storagePath
      .split('/')
      .pop()}-extracted.txt`;
    const processedFile = bucket.file(processedPath);
    await processedFile.save(Buffer.from(combinedData), {
      contentType: 'text/plain',
    });

    return { data: { processedPath } };
  } catch (e: any) {
    console.error('Error in analyzeLinkedInDataAction:', e);
    // Return a simple, serializable error object. This is the key fix.
    return {
      error: 'An unexpected error occurred during analysis. Please check the server logs.',
    };
  }
}
