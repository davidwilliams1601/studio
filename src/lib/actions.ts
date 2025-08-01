
'use server';

import { extractAndSummarize } from '@/ai/flows/extractAndSummarizeFlow';
import { generateLinkedInPostSuggestions } from '@/ai/flows/generate-linkedin-post-suggestions';
import {
  type GenerateLinkedInPostSuggestionsInput,
  type ExtractAndSummarizeInput,
} from '@/ai/schemas';

import { z } from 'zod';
import { auth, db } from '@/lib/firebase';
import { redirect } from 'next/navigation';
import Stripe from 'stripe';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const CreateUserInputSchema = z.object({
  uid: z.string(),
  email: z.string().email().nullable(),
  displayName: z.string().nullable(),
});

type CreateUserInput = z.infer<typeof CreateUserInputSchema>;

export async function createUserAction(
  input: CreateUserInput
): Promise<{ error?: string }> {
  try {
    const { uid, email, displayName } = CreateUserInputSchema.parse(input);

    const customer = await stripe.customers.create({
      email: email ?? undefined,
      name: displayName ?? undefined,
      metadata: {
        firebaseUID: uid,
      },
    });

    await setDoc(doc(db, 'users', uid), {
      uid: uid,
      email: email,
      displayName: displayName,
      stripeCustomerId: customer.id,
    });

    return {};
  } catch (e: any) {
    console.error(e);
    return { error: e.message || 'An unexpected error occurred.' };
  }
}

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

// All-in-one data processing action
type ProcessActionResponse = {
  summary?: string;
  error?: string;
};

export async function processAndSummarizeDataAction(
  input: ExtractAndSummarizeInput
): Promise<ProcessActionResponse> {
  try {
    const result = await extractAndSummarize(input);
    return { summary: result.summary };
  } catch (e) {
    console.error('Error in processAndSummarizeDataAction:', e);
    return {
      error:
        'An unexpected error occurred while analyzing your data with AI. Please check the server logs for more details.',
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
