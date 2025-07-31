'use server';

import {
  summarizeLinkedInActivity,
  type SummarizeLinkedInActivityInput,
} from '@/ai/flows/summarize-linkedin-activity';
import { z } from 'zod';

const ActionInputSchema = z.object({
  connections: z.string(),
  messages: z.string(),
  articles: z.string(),
  profile: z.string(),
});

type ActionResponse = {
  summary?: string;
  error?: string;
};

export async function summarizeActivityAction(
  input: SummarizeLinkedInActivityInput
): Promise<ActionResponse> {
  try {
    const validatedInput = ActionInputSchema.parse(input);
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
