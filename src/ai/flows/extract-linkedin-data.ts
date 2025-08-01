'use server';

/**
 * @fileOverview A flow to extract data from a LinkedIn ZIP backup and generate a summary.
 *
 * - extractLinkedInData - Downloads, unzips, and analyzes a LinkedIn data export.
 * - ExtractLinkedInDataInput - The input type for the extractLinkedInData function.
 * - ExtractLinkedInDataOutput - The return type for the extractLinkedInData function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { storage } from '@/lib/firebase';
import { ref, getBytes } from 'firebase/storage';
import JSZip from 'jszip';
import {
  summarizeLinkedInActivity,
  SummarizeLinkedInActivityInputSchema,
} from './summarize-linkedin-activity';

export const ExtractLinkedInDataInputSchema = z.object({
  storagePath: z
    .string()
    .describe('The path to the LinkedIn data ZIP file in Firebase Storage.'),
});
export type ExtractLinkedInDataInput = z.infer<
  typeof ExtractLinkedInDataInputSchema
>;

export const ExtractLinkedInDataOutputSchema = z.object({
  summary: z.string().describe('The AI-generated summary of the LinkedIn data.'),
});
export type ExtractLinkedInDataOutput = z.infer<
  typeof ExtractLinkedInDataOutputSchema
>;

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

    const analysisInput = {
      connections,
      messages,
      articles,
      profile,
    };
    
    // Validate the extracted data (optional but recommended)
    SummarizeLinkedInActivityInputSchema.parse(analysisInput);

    // 4. Call the summarization flow
    const summaryResult = await summarizeLinkedInActivity(analysisInput);

    return {
      summary: summaryResult.summary,
    };
  }
);
