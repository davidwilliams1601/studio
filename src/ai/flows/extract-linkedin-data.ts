
'use server';

/**
 * @fileOverview A flow to extract data from a LinkedIn ZIP backup.
 *
 * - extractLinkedInData - Downloads, unzips, and extracts data from a LinkedIn data export.
 */

import { ai } from '@/ai/genkit';
import { storage } from '@/lib/firebase';
import { ref, getBytes } from 'firebase/storage';
import JSZip from 'jszip';
import {
  ExtractLinkedInDataInputSchema,
  ExtractLinkedInDataOutputSchema,
  type ExtractLinkedInDataInput,
  type ExtractLinkedInDataOutput,
} from '@/ai/schemas';

async function getFileContent(zip: JSZip, fileName: string): Promise<string> {
  const file = zip.file(fileName);
  if (!file) {
    console.warn(`${fileName} not found in zip. Returning empty string.`);
    return '';
  }
  return file.async('string');
}

export async function extractLinkedInData(
  input: ExtractLinkedInDataInput
): Promise<ExtractLinkedInDataOutput> {
  return extractLinkedInDataFlow(input);
}

const extractLinkedInDataFlow = ai.defineFlow(
  {
    name: 'extractLinkedInDataFlow',
    inputSchema: ExtractLinkedInDataInputSchema,
    outputSchema: ExtractLinkedInDataOutputSchema,
  },
  async (input) => {
    // 1. Download file from Firebase Storage
    const fileRef = ref(storage, input.storagePath);
    const fileBuffer = await getBytes(fileRef);

    // 2. Unzip the file
    const zip = await JSZip.loadAsync(fileBuffer);

    // 3. Extract content from required files
    const connections = await getFileContent(zip, 'Connections.csv');
    const messages = await getFileContent(zip, 'messages.csv');
    const articles = await getFileContent(zip, 'articles.csv');
    const profile = await getFileContent(zip, 'Profile.json');

    // 4. Return the extracted data
    return {
      connections,
      messages,
      articles,
      profile,
    };
  }
);

    