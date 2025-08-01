import { z } from 'genkit';

// Schemas for extract-linkedin-data.ts
export const ExtractLinkedInDataInputSchema = z.object({
  storagePath: z
    .string()
    .describe('The path to the LinkedIn data ZIP file in Firebase Storage.'),
});
export type ExtractLinkedInDataInput = z.infer<
  typeof ExtractLinkedInDataInputSchema
>;

export const ExtractLinkedInDataOutputSchema = z.object({
  connections: z
    .string()
    .describe('The LinkedIn connections data in CSV format.'),
  messages: z.string().describe('The LinkedIn messages data in CSV format.'),
  articles: z.string().describe('The LinkedIn articles data in CSV format.'),
  profile: z.string().describe('The LinkedIn profile data in JSON format.'),
});
export type ExtractLinkedInDataOutput = z.infer<
  typeof ExtractLinkedInDataOutputSchema
>;


// Schemas for generate-linkedin-post-suggestions.ts
export const GenerateLinkedInPostSuggestionsInputSchema = z.object({
  prompt: z
    .string()
    .describe('A description of the type of LinkedIn post to generate.'),
});
export type GenerateLinkedInPostSuggestionsInput = z.infer<
  typeof GenerateLinkedInPostSuggestionsInputSchema
>;

export const GenerateLinkedInPostSuggestionsOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe(
      'An array of suggested LinkedIn posts based on the prompt.'
    ),
});
export type GenerateLinkedInPostSuggestionsOutput = z.infer<
  typeof GenerateLinkedInPostSuggestionsOutputSchema
>;

// Schemas for summarize-linkedin-activity.ts
export const SummarizeLinkedInActivityInputSchema = z.object({
  connections: z
    .string()
    .describe('The LinkedIn connections data in CSV format.'),
  messages: z.string().describe('The LinkedIn messages data in CSV format.'),
  articles: z.string().describe('The LinkedIn articles data in CSV format.'),
  profile: z.string().describe('The LinkedIn profile data in JSON format.'),
});
export type SummarizeLinkedInActivityInput = z.infer<
  typeof SummarizeLinkedInActivityInputSchema
>;

export const SummarizeLinkedInActivityOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A summary of the LinkedIn activity, highlighting key trends and insights.'
    ),
});
export type SummarizeLinkedInActivityOutput = z.infer<
  typeof SummarizeLinkedInActivityOutputSchema
>;
