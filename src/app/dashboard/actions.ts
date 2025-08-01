'use server';

import { getStorage } from 'firebase-admin/storage';
import JSZip from 'jszip';
import { app } from '@/lib/firebase-admin';

async function getFileContent(
  zip: JSZip,
  fileName: string
): Promise<string> {
  // Use a case-insensitive search to find the file
  const files = zip.file(new RegExp(`.*${fileName}$`, 'i'));
  if (files && files.length > 0) {
    return files[0].async('string');
  }
  // If the file is not found, it's not an error, just return empty.
  console.warn(
    `${fileName} not found in zip. This may be expected. Returning empty string.`
  );
  return '';
}

export async function analyzeLinkedInDataAction(input: {
  storagePath: string;
}): Promise<{ data?: { processedPath: string }; error?: string }> {
  try {
    const { storagePath } = input;

    const bucket = getStorage(app).bucket();
    const file = bucket.file(storagePath);
    const [buffer] = await file.download();

    const zip = await JSZip.loadAsync(buffer);

    // Directly extract each file, handling cases where they might not exist.
    const connections = await getFileContent(zip, 'Connections.csv');
    const messages = await getFileContent(zip, 'messages.csv');
    const articles = await getFileContent(zip, 'articles.csv');
    const profile = await getFileContent(zip, 'Profile.json');

    // Combine the contents into a single text block.
    const combinedData = `
--- CONNECTIONS ---
${connections || 'File not found or empty.'}

--- MESSAGES ---
${messages || 'File not found or empty.'}

--- ARTICLES ---
${articles || 'File not found or empty.'}

--- PROFILE ---
${profile || 'File not found or empty.'}
`;
    // Save the combined data to a new file in storage.
    const processedPath = `processed/${storagePath
      .split('/')
      .pop()}-extracted.txt`;
    const processedFile = bucket.file(processedPath);
    await processedFile.save(Buffer.from(combinedData), {
      contentType: 'text/plain',
    });

    // Return the path to the newly created file.
    return { data: { processedPath } };
  } catch (e: any) {
    console.error('Error in analyzeLinkedInDataAction:', e);
    return {
      error: e.message || 'An unknown server error occurred during analysis.',
    };
  }
}
