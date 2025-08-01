
'use server';

import { summarizeLinkedInActivity } from '@/ai/flows/summarize-linkedin-activity';
import { generateLinkedInPostSuggestions } from '@/ai/flows/generate-linkedin-post-suggestions';
import {
  type SummarizeLinkedInActivityInput,
  type GenerateLinkedInPostSuggestionsInput,
} from '@/ai/schemas';

import { z } from 'zod';
import { auth, db } from '@/lib/firebase';
import { redirect } from 'next/navigation';
import Stripe from 'stripe';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { headers } from 'next/headers';


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

async function getOrCreateStripeCustomerId(
  firebaseUID: string,
  email?: string | null,
  name?: string | null
): Promise<string> {
  const userDocRef = doc(db, 'users', firebaseUID);
  const userDocSnap = await getDoc(userDocRef);
  const userData = userDocSnap.data();

  if (userData && userData.stripeCustomerId) {
    return userData.stripeCustomerId;
  }

  const customer = await stripe.customers.create({
    email: email ?? undefined,
    name: name ?? undefined,
    metadata: {
      firebaseUID: firebaseUID,
    },
  });

  await setDoc(userDocRef, { stripeCustomerId: customer.id }, { merge: true });
  return customer.id;
}

async function createStripePortalSession(customerId: string) {
  const returnUrl =
    (headers().get('origin') ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'http://localhost:9002') + '/dashboard/settings';
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  return portalSession.url;
}

export async function createStripePortalSessionAction() {
  const user = auth.currentUser;

  if (!user) {
    return { error: 'You must be logged in to manage your subscription.' };
  }

  try {
    const customerId = await getOrCreateStripeCustomerId(
      user.uid,
      user.email,
      user.displayName
    );
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

// Summarize Extracted Data Action
type SummarizeActionResponse = {
  summary?: string;
  error?: string;
};

export async function summarizeExtractedDataAction(
  input: SummarizeLinkedInActivityInput
): Promise<SummarizeActionResponse> {
  try {
    // The input is now coming directly from the client, already extracted.
    const result = await summarizeLinkedInActivity(input);
    return { summary: result.summary };
  } catch (e) {
    console.error(e);
     return {
      error:
        'An unexpected error occurred while analyzing your data with AI. Please try again.',
    };
  }
}


// Generate Post Suggestions Action
const PostSuggestionsActionInputSchema = z.object({
  prompt: z.string(),
});

type PostSuggestionsActionResponse = {
  suggestions?: string[];
  error?: string;
};

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
    return {
      error:
        'An unexpected error occurred while generating suggestions. Please try again.',
    };
  }
}

    