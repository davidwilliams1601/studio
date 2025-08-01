'use server';
/**
 * @fileOverview A flow that extracts data from a LinkedIn ZIP file and summarizes it.
 *
 * - extractAndSummarize - A function that handles the entire process.
 * - ExtractAndSummarizeInput - The input type for the function.
 * - ExtractAndSummarizeOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import {
  ExtractAndSummarizeInputSchema,
  ExtractAndSummarizeOutputSchema,
  type ExtractAndSummarizeInput,
  type ExtractAndSummarizeOutput,
} from '@/ai/schemas';
import { getStorage } from 'firebase-admin/storage';
import JSZip from 'jszip';
import { app } from '@/lib/firebase-admin';

// Helper function to read a file from the zip, case-insensitively
async function getFileContent(
  zip: JSZip,
  fileName: string
): Promise<string> {
  // JSZip's file method can take a RegExp. 'i' flag makes it case-insensitive.
  const file = zip.file(new RegExp(`^${fileName}$`, 'i'));
  if (file && file.length > 0) {
    return file[0].async('string');
  }
  // It's possible some files are not in the export if the user has no data for them.
  console.warn(`${fileName} not found in zip. This may be expected. Returning empty string.`);
  return '';
}

export async function extractAndSummarize(
  input: ExtractAndSummarizeInput
): Promise<ExtractAndSummarizeOutput> {
  return extractAndSummarizeFlow(input);
}

const extractAndSummarizeFlow = ai.defineFlow(
  {
    name: 'extractAndSummarizeFlow',
    inputSchema: ExtractAndSummarizeInputSchema,
    outputSchema: ExtractAndSummarizeOutputSchema,
  },
  async ({ storagePath }) => {
    // 1. Download file from Firebase Storage into an in-memory buffer
    const bucket = getStorage(app).bucket();
    const file = bucket.file(storagePath);
    const [buffer] = await file.download();

    // 2. Read and extract data from the zip file buffer
    const zip = await JSZip.loadAsync(buffer);

    const connections = await getFileContent(zip, 'Connections.csv');
    const messages = await getFileContent(zip, 'messages.csv');
    const articles = await getFileContent(zip, 'articles.csv');
    const profile = await getFileContent(zip, 'Profile.json');

    const extractedData = { connections, messages, articles, profile };

    // 3. Call AI to summarize the extracted data
    const summaryResult = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      prompt: `You are an expert in LinkedIn data analysis. You will analyze the provided LinkedIn data and generate a summary of the user's LinkedIn activity, highlighting key trends and insights.

Here is the LinkedIn data:

Connections: ${extractedData.connections}
Messages: ${extractedData.messages}
Articles: ${extractedData.articles}
Profile: ${extractedData.profile}

Summary:`,
    });

    return { summary: summaryResult.text };
  }
);
