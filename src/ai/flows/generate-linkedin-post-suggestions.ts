'use server';
/**
 * @fileOverview Generates LinkedIn post suggestions based on a user-provided prompt.
 *
 * - generateLinkedInPostSuggestions - A function that generates LinkedIn post suggestions.
 */

import { ai } from '@/ai/genkit';
import {
  GenerateLinkedInPostSuggestionsInputSchema,
  GenerateLinkedInPostSuggestionsOutputSchema,
  type GenerateLinkedInPostSuggestionsInput,
  type GenerateLinkedInPostSuggestionsOutput,
} from '@/ai/schemas';

export async function generateLinkedInPostSuggestions(
  input: GenerateLinkedInPostSuggestionsInput
): Promise<GenerateLinkedInPostSuggestionsOutput> {
  return generateLinkedInPostSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLinkedInPostSuggestionsPrompt',
  input: { schema: GenerateLinkedInPostSuggestionsInputSchema },
  output: { schema: GenerateLinkedInPostSuggestionsOutputSchema },
  prompt: `You are a social media expert specializing in creating engaging LinkedIn posts.

  Based on the following prompt, generate 3 different LinkedIn post suggestions.

  Prompt: {{{prompt}}}

  Each suggestion should be concise and attention-grabbing, suitable for a professional audience.

  Format your response as a JSON object with a "suggestions" array containing the post suggestions.`,
});

const generateLinkedInPostSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateLinkedInPostSuggestionsFlow',
    inputSchema: GenerateLinkedInPostSuggestionsInputSchema,
    outputSchema: GenerateLinkedInPostSuggestionsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
