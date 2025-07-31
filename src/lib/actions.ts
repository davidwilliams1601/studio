'use server';

import {
  summarizeLinkedInActivity,
  type SummarizeLinkedInActivityInput,
} from '@/ai/flows/summarize-linkedin-activity';
import {
    generateLinkedInPostSuggestions,
    type GenerateLinkedInPostSuggestionsInput,
} from '@/ai/flows/generate-linkedin-post-suggestions';
import { z } from 'zod';


// Summarize Activity Action
const SummarizeActivityActionInputSchema = z.object({
  connections: z.string(),
  messages: z.string(),
  articles: z.string(),
  profile: z.string(),
});

type SummarizeActivityActionResponse = {
  summary?: string;
  error?: string;
};

export async function summarizeActivityAction(
  input: SummarizeLinkedInActivityInput
): Promise<SummarizeActivityActionResponse> {
  try {
    const validatedInput = SummarizeActivityActionInputSchema.parse(input);
    const result = await summarizeLinkedInActivity(validatedInput);
    return { summary: result.summary };
  } catch (e) {
    console.error(e);
    if (e instanceof z.ZodError) {
      return { error: 'Invalid input data provided.' };
    }
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

// Generate Post Suggestions Action
const PostSuggestionsActionInputSchema = z.object({
    prompt: z.string(),
});

type PostSuggestionsActionResponse = {
    suggestions?: string[];
    error?: string;
}

export async function generatePostSuggestionsAction(
    input: GenerateLinkedInPostSuggestionsInput
): Promise<PostSuggestionsActionResponse> {
    try {
        const validatedInput = PostSuggestionsActionInputSchema.parse(input);
        const result = await generateLinkedInPostSuggestions(validatedInput);
        return { suggestions: result.suggestions };
    } catch (e) {
        console.error(e);
        if (e instanceof z.ZodError) {
            return { error: 'Invalid prompt provided.' };
        }
        return { error: 'An unexpected error occurred while generating suggestions. Please try again.' };
    }
}
