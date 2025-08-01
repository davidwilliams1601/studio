import { z } from 'genkit';

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
    .describe('An array of suggested LinkedIn posts based on the prompt.'),
});
export type GenerateLinkedInPostSuggestionsOutput = z.infer<
  typeof GenerateLinkedInPostSuggestionsOutputSchema
>;

// Schemas for extractAndSummarizeFlow.ts
export const ExtractAndSummarizeInputSchema = z.object({
  storagePath: z
    .string()
    .describe(
      'The path to the LinkedIn data ZIP file in Firebase Storage.'
    ),
});
export type ExtractAndSummarizeInput = z.infer<
  typeof ExtractAndSummarizeInputSchema
>;

export const ExtractAndSummarizeOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A summary of the LinkedIn activity, highlighting key trends and insights.'
    ),
});
export type ExtractAndSummarizeOutput = z.infer<
  typeof ExtractAndSummarizeOutputSchema
>;
