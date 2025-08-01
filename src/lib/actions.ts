'use server';

import { summarizeLinkedInActivity } from '@/ai/flows/summarize-linkedin-activity';
import { generateLinkedInPostSuggestions } from '@/ai/flows/generate-linkedin-post-suggestions';
import { extractLinkedInData } from '@/ai/flows/extract-linkedin-data';
import {
  type SummarizeLinkedInActivityInput,
  type GenerateLinkedInPostSuggestionsInput,
  type ExtractLinkedInDataInput,
  ExtractLinkedInDataOutputSchema,
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

// Extract LinkedIn Data Action
const ExtractActionInputSchema = z.object({
  storagePath: z.string(),
});

type ExtractActionResponse = {
  data?: SummarizeLinkedInActivityInput;
  error?: string;
};

export async function extractLinkedInDataAction(
  input: ExtractLinkedInDataInput
): Promise<ExtractActionResponse> {
  try {
    const validatedInput = ExtractActionInputSchema.parse(input);
    const result = await extractLinkedInData(validatedInput);
    // Validate the output of the extraction flow
    const validatedData = ExtractLinkedInDataOutputSchema.parse(result);
    return { data: validatedData };
  } catch (e) {
    console.error(e);
    if (e instanceof z.ZodError) {
      return { error: 'Invalid input or output data.' };
    }
    return {
      error:
        'An unexpected error occurred while extracting your data. Please try again.',
    };
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
    // The input is already validated by the previous step's output schema
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
