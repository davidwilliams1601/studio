
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
