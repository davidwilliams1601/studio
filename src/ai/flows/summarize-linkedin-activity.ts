'use server';

/**
 * @fileOverview A LinkedIn activity summarization AI agent.
 *
 * - summarizeLinkedInActivity - A function that handles the summarization process.
 */

import { ai } from '@/ai/genkit';
import {
  SummarizeLinkedInActivityInputSchema,
  SummarizeLinkedInActivityOutputSchema,
  type SummarizeLinkedInActivityInput,
  type SummarizeLinkedInActivityOutput,
} from '@/ai/schemas';

export async function summarizeLinkedInActivity(
  input: SummarizeLinkedInActivityInput
): Promise<SummarizeLinkedInActivityOutput> {
  return summarizeLinkedInActivityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeLinkedInActivityPrompt',
  input: { schema: SummarizeLinkedInActivityInputSchema },
  output: { schema: SummarizeLinkedInActivityOutputSchema },
  prompt: `You are an expert in LinkedIn data analysis. You will analyze the provided LinkedIn data and generate a summary of the user's LinkedIn activity, highlighting key trends and insights.

Here is the LinkedIn data:

Connections: {{{connections}}}
Messages: {{{messages}}}
Articles: {{{articles}}}
Profile: {{{profile}}}

Summary:`,
});

const summarizeLinkedInActivityFlow = ai.defineFlow(
  {
    name: 'summarizeLinkedInActivityFlow',
    inputSchema: SummarizeLinkedInActivityInputSchema,
    outputSchema: SummarizeLinkedInActivityOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
