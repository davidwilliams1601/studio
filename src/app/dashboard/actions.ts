'use server';

import { getStorage } from 'firebase-admin/storage';
import JSZip from 'jszip';
import { app } from '@/lib/firebase-admin';
import {
  ExtractAndSummarizeInput,
  ExtractAndSummarizeOutput,
  ExtractAndSummarizeInputSchema,
} from '@/ai/schemas';
import { ai } from '@/ai/genkit';

async function getFileContent(
  zip: JSZip,
  fileName: string
): Promise<string> {
  const files = zip.file(new RegExp(`^${fileName}$`, 'i'));
  if (files && files.length > 0) {
    return files[0].async('string');
  }
  console.warn(
    `${fileName} not found in zip. This may be expected. Returning empty string.`
  );
  return '';
}

export async function analyzeLinkedInDataAction(
  input: ExtractAndSummarizeInput
): Promise<ExtractAndSummarizeOutput> {
  try {
    const { storagePath } = ExtractAndSummarizeInputSchema.parse(input);

    const bucket = getStorage(app).bucket();
    const file = bucket.file(storagePath);
    const [buffer] = await file.download();

    const zip = await JSZip.loadAsync(buffer);

    const connections = await getFileContent(zip, 'Connections.csv');
    const messages = await getFileContent(zip, 'messages.csv');
    const articles = await getFileContent(zip, 'articles.csv');
    const profile = await getFileContent(zip, 'Profile.json');

    const extractedData = { connections, messages, articles, profile };

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
    console.error('Error in analyzeLinkedInDataAction:', e);
    return {
      summary: '',
      error: e.message || 'An unknown server error occurred during analysis.',
    };
  }
}
