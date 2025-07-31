'use server';
/**
 * @fileOverview Generates LinkedIn post suggestions based on a user-provided prompt.
 *
 * - generateLinkedInPostSuggestions - A function that generates LinkedIn post suggestions.
 * - GenerateLinkedInPostSuggestionsInput - The input type for the generateLinkedInPostSuggestions function.
 * - GenerateLinkedInPostSuggestionsOutput - The return type for the generateLinkedInPostSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLinkedInPostSuggestionsInputSchema = z.object({
  prompt: z.string().describe('A description of the type of LinkedIn post to generate.'),
});
export type GenerateLinkedInPostSuggestionsInput = z.infer<typeof GenerateLinkedInPostSuggestionsInputSchema>;

const GenerateLinkedInPostSuggestionsOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('An array of suggested LinkedIn posts based on the prompt.'),
});
export type GenerateLinkedInPostSuggestionsOutput = z.infer<typeof GenerateLinkedInPostSuggestionsOutputSchema>;

export async function generateLinkedInPostSuggestions(
  input: GenerateLinkedInPostSuggestionsInput
): Promise<GenerateLinkedInPostSuggestionsOutput> {
  return generateLinkedInPostSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLinkedInPostSuggestionsPrompt',
  input: {schema: GenerateLinkedInPostSuggestionsInputSchema},
  output: {schema: GenerateLinkedInPostSuggestionsOutputSchema},
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
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
