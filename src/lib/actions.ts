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
import { auth } from '@/lib/firebase';
import { redirect } from 'next/navigation';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// Placeholder for Stripe logic
async function createStripePortalSession(customerId: string) {
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
  });
  return portalSession.url;
}

export async function createStripePortalSessionAction() {
  const user = auth.currentUser;

  if (!user) {
    return { error: 'You must be logged in to manage your subscription.' };
  }

  // In a real application, you would retrieve the Stripe customer ID
  // associated with the user from your database. For this example, we'll
  // use a placeholder. You should also create the customer if they don't exist.
  const customerId = 'cus_placeholder_12345'; // Placeholder

  try {
    const portalUrl = await createStripePortalSession(customerId);
    redirect(portalUrl);
  } catch (e) {
    console.error(e);
    if (e instanceof Error) {
        return { error: e.message };
    }
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}


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
