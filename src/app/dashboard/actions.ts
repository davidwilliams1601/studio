'use server';

import { z } from 'zod';
import { getStorage } from 'firebase-admin/storage';
import JSZip from 'jszip';
import { ai } from '@/ai/genkit';

const ExtractAndSummarizeInputSchema = z.object({
  storagePath: z
    .string()
    .describe('The path to the LinkedIn data ZIP file in Firebase Storage.'),
});

const ExtractAndSummarizeOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A summary of the LinkedIn activity, highlighting key trends and insights.'
    ),
  error: z.string().optional(),
});

type ExtractAndSummarizeInput = z.infer<typeof ExtractAndSummarizeInputSchema>;
type ExtractAndSummarizeOutput = z.infer<
  typeof ExtractAndSummarizeOutputSchema
>;

// Helper function to read a file from the zip, case-insensitively
async function getFileContent(
  zip: JSZip,
  fileName: string
): Promise<string> {
  // JSZip's file method can take a RegExp. 'i' flag makes it case-insensitive.
  const files = zip.file(new RegExp(`^${fileName}$`, 'i'));
  if (files && files.length > 0) {
    return files[0].async('string');
  }
  // It's possible some files are not in the export if the user has no data for them.
  console.warn(
    `${fileName} not found in zip. This may be expected. Returning empty string.`
  );
  return '';
}

export async function extractAndSummarizeAction(
  input: ExtractAndSummarizeInput
): Promise<ExtractAndSummarizeOutput> {
  try {
    const { storagePath } = ExtractAndSummarizeInputSchema.parse(input);

    // 1. Download file from Firebase Storage into an in-memory buffer
    const bucket = getStorage().bucket();
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
      model: 'googleai/gemini-pro',
      prompt: `You are an expert in LinkedIn data analysis. You will analyze the provided LinkedIn data and generate a summary of the user's LinkedIn activity, highlighting key trends and insights.

Here is the LinkedIn data:

Connections: ${extractedData.connections}
Messages: ${extractedData.messages}
Articles: ${extractedData.articles}
Profile: ${extractedData.profile}

Summary:`,
    });

    const summary = summaryResult.text;

    if (!summary) {
      throw new Error('AI summary generation failed.');
    }

    return { summary };
  } catch (e: any) {
    console.error('Error in extractAndSummarizeAction:', e);
    // Return a structured error
    return {
      summary: '',
      error: e.message || 'An unknown server error occurred during analysis.',
    };
  }
}
