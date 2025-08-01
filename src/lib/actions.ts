
'use server';

import { z } from 'zod';
import { auth, db } from '@/lib/firebase-admin';
import { redirect } from 'next/navigation';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { getStorage } from 'firebase-admin/storage';
import JSZip from 'jszip';
import { ai } from '@/ai/genkit';
import {
  ExtractAndSummarizeInputSchema,
  ExtractAndSummarizeOutputSchema,
  type ExtractAndSummarizeInput,
  type ExtractAndSummarizeOutput,
} from '@/ai/schemas';

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

    await db.collection('users').doc(uid).set({
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
  firebaseUID: string
): Promise<string> {
  const userDocRef = db.collection('users').doc(firebaseUID);
  const userDocSnap = await userDocRef.get();
  const userData = userDocSnap.data();

  if (userData && userData.stripeCustomerId) {
    return userData.stripeCustomerId;
  }

  const user = await auth.getUser(firebaseUID);

  const customer = await stripe.customers.create({
    email: user.email ?? undefined,
    name: user.displayName ?? undefined,
    metadata: {
      firebaseUID: firebaseUID,
    },
  });

  await userDocRef.set({ stripeCustomerId: customer.id }, { merge: true });
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

const PortalSessionInputSchema = z.object({
  uid: z.string(),
});
type PortalSessionInput = z.infer<typeof PortalSessionInputSchema>;

export async function createStripePortalSessionAction(input: PortalSessionInput) {
  const { uid } = PortalSessionInputSchema.parse(input);

  if (!uid) {
    return { error: 'You must be logged in to manage your subscription.' };
  }

  try {
    const customerId = await getOrCreateStripeCustomerId(uid);
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


// Helper function to read a file from the zip, case-insensitively
async function getFileContent(
  zip: JSZip,
  fileName: string
): Promise<string> {
  // JSZip's file method can take a RegExp. 'i' flag makes it case-insensitive.
  const files = zip.file(new RegExp(`^${fileName}$`, 'i'));
  if (files && files.length > 0) {
    return files[0].async('string');
  }
  // It's possible some files are not in the export if the user has no data for them.
  console.warn(`${fileName} not found in zip. This may be expected. Returning empty string.`);
  return '';
}

export async function extractAndSummarizeAction(
  input: ExtractAndSummarizeInput
): Promise<ExtractAndSummarizeOutput> {
   try {
     const { storagePath } = ExtractAndSummarizeInputSchema.parse(input);
     
     // 1. Download file from Firebase Storage into an in-memory buffer
     const bucket = getStorage().bucket();
     const file = bucket.file(storagePath);
     const [buffer] = await file.download();
 
     // 2. Read and extract data from the zip file buffer
     const zip = await JSZip.loadAsync(buffer);
 
     const connections = await getFileContent(zip, 'Connections.csv');
     const messages = await getFileContent(zip, 'messages.csv');
     const articles = await getFileContent(zip, 'articles.csv');
     const profile = await getFileContent(zip, 'Profile.json');
 
     const extractedData = { connections, messages, articles, profile };
 
     // 3. Call AI to summarize the extracted data
     const summaryResult = await ai.generate({
       model: 'googleai/gemini-pro',
       prompt: `You are an expert in LinkedIn data analysis. You will analyze the provided LinkedIn data and generate a summary of the user's LinkedIn activity, highlighting key trends and insights.

Here is the LinkedIn data:

Connections: ${extractedData.connections}
Messages: ${extractedData.messages}
Articles: ${extractedData.articles}
Profile: ${extractedData.profile}

Summary:`,
     });

     const summary = summaryResult.text;

     if (!summary) {
        throw new Error('AI summary generation failed.');
     }
 
     return { summary };
   } catch (e: any) {
      console.error("Error in extractAndSummarizeAction:", e);
      // Return a structured error
      return { summary: '', error: e.message || 'An unknown server error occurred during analysis.' };
   }
}
