'use server';

/**
 * @fileOverview A LinkedIn activity summarization AI agent.
 *
 * - summarizeLinkedInActivity - A function that handles the summarization process.
 * - SummarizeLinkedInActivityInput - The input type for the summarizeLinkedInActivity function.
 * - SummarizeLinkedInActivityOutput - The return type for the summarizeLinkedInActivity function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const SummarizeLinkedInActivityInputSchema = z.object({
  connections: z.string().describe('The LinkedIn connections data in CSV format.'),
  messages: z.string().describe('The LinkedIn messages data in CSV format.'),
  articles: z.string().describe('The LinkedIn articles data in CSV format.'),
  profile: z.string().describe('The LinkedIn profile data in JSON format.'),
});
export type SummarizeLinkedInActivityInput = z.infer<typeof SummarizeLinkedInActivityInputSchema>;

const SummarizeLinkedInActivityOutputSchema = z.object({
  summary: z.string().describe('A summary of the LinkedIn activity, highlighting key trends and insights.'),
});
export type SummarizeLinkedInActivityOutput = z.infer<typeof SummarizeLinkedInActivityOutputSchema>;

export async function summarizeLinkedInActivity(input: SummarizeLinkedInActivityInput): Promise<SummarizeLinkedInActivityOutput> {
  return summarizeLinkedInActivityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeLinkedInActivityPrompt',
  input: {schema: SummarizeLinkedInActivityInputSchema},
  output: {schema: SummarizeLinkedInActivityOutputSchema},
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
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
