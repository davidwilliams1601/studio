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
import { promises as fs } from 'fs';
import JSZip from 'jszip';
import os from 'os';
import path from 'path';
import { app } from '@/lib/firebase-admin';

// Helper function to read a file from the zip, case-insensitively
async function getFileContent(
  zip: JSZip,
  fileName: string
): Promise<string> {
  const file = zip.file(new RegExp(`^${fileName}$`, 'i'));
  if (file && file.length > 0) {
    return file[0].async('string');
  }
  console.warn(`${fileName} not found in zip. Returning empty string.`);
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
    let tempFilePath = '';
    try {
      // 1. Download file from Firebase Storage
      const bucket = getStorage(app).bucket();
      tempFilePath = path.join(os.tmpdir(), path.basename(storagePath));
      await bucket.file(storagePath).download({ destination: tempFilePath });

      // 2. Read and extract data from the zip file
      const fileData = await fs.readFile(tempFilePath);
      const zip = await JSZip.loadAsync(fileData);

      const connections = await getFileContent(zip, 'Connections.csv');
      const messages = await getFileContent(zip, 'messages.csv');
      const articles = await getFileContent(zip, 'articles.csv');
      const profile = await getFileContent(zip, 'Profile.json');

      const extractedData = { connections, messages, articles, profile };

      // 3. Call AI to summarize the extracted data
      const summaryResult = await ai.generate({
        prompt: `You are an expert in LinkedIn data analysis. You will analyze the provided LinkedIn data and generate a summary of the user's LinkedIn activity, highlighting key trends and insights.

Here is the LinkedIn data:

Connections: ${extractedData.connections}
Messages: ${extractedData.messages}
Articles: ${extractedData.articles}
Profile: ${extractedData.profile}

Summary:`,
      });

      return { summary: summaryResult.text };
    } finally {
      // 4. Clean up the temporary file
      if (tempFilePath) {
        await fs.unlink(tempFilePath);
      }
    }
  }
);
