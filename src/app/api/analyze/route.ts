import { NextRequest, NextResponse } from "next/server";
import { processLinkedInZip } from "@/lib/linkedin-processor";
import { getDb } from "@/lib/firebase-admin";
import {
  generateAIInsights,
  generateBasicInsights,
  generateValueConnectionRecommendations,
  generateContentStrategy,
  generateIntroductionMatches
} from "@/lib/ai-analysis";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Get the file data from the request
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID required" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.zip')) {
      return NextResponse.json(
        { success: false, error: "Please upload a ZIP file" },
        { status: 400 }
      );
    }

    // Get user's subscription tier from Firestore
    const db = await getDb();
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    const userTier = userData?.tier || 'free';

    // Check if user has access to AI-powered analysis
    const hasAIAccess = ['pro', 'business', 'enterprise'].includes(userTier.toLowerCase());

    console.log(`Processing LinkedIn data for user ${userId}: ${file.name}`);
    console.log(`📊 User tier: ${userTier} | AI Analysis: ${hasAIAccess ? '✅ Enabled' : '❌ Disabled (Free tier)'}`);

    // Convert file to ArrayBuffer for processing
    const arrayBuffer = await file.arrayBuffer();

    // Process the LinkedIn ZIP file
    const results = await processLinkedInZip(arrayBuffer, {
      includeConnectionsList: false, // Don't include full list for privacy
      fileName: file.name,
    });

    console.log(`Analysis complete: ${results.stats.connections} connections found`);

    // Generate insights based on subscription tier
    if (hasAIAccess) {
      console.log('🤖 Generating AI-powered insights (Pro/Business/Enterprise tier)...');
      results.insights = await generateAIInsights(results);

      // Generate valuable connection recommendations for paid tiers
      console.log('🎯 Generating valuable connection recommendations...');
      results.topValueConnections = await generateValueConnectionRecommendations(results);

      // Generate content strategy recommendations
      console.log('📝 Generating content strategy...');
      const contentStrategy = await generateContentStrategy(results);
      if (contentStrategy) {
        results.contentStrategy = contentStrategy;
      }

      // Generate introduction matches
      console.log('🤝 Generating introduction matches...');
      const introMatches = await generateIntroductionMatches(results);
      if (introMatches) {
        results.introductionMatches = introMatches;
      }
    } else {
      console.log('📊 Generating basic insights (Free tier)...');
      results.insights = generateBasicInsights(results);
    }

    // Update Firestore with backup information
    try {
      const db = await getDb();
      const userRef = db.collection('users').doc(userId);
      const now = new Date();

      // Get current month's backup count
      const userDoc = await userRef.get();
      const userData = userDoc.data();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      // Reset monthly count if it's a new month
      const lastBackupDate = userData?.lastBackupDate?.toDate();
      let backupsThisMonth = userData?.backupsThisMonth || 0;

      if (lastBackupDate) {
        const lastMonth = lastBackupDate.getMonth();
        const lastYear = lastBackupDate.getFullYear();
        if (lastMonth !== currentMonth || lastYear !== currentYear) {
          backupsThisMonth = 0;
        }
      }

      // Increment backup count
      backupsThisMonth += 1;

      // Update user document with backup info
      await userRef.set({
        lastBackupDate: now,
        backupsThisMonth,
        updatedAt: now,
        'reminderSettings.nextReminderDate': null, // Will be recalculated by cron
      }, { merge: true });

      // Store the backup analysis result in backups collection
      const backupRef = await db.collection('backups').add({
        userId,
        fileName: file.name,
        fileSize: file.size,
        createdAt: now,
        stats: results.stats,
        analytics: results.analytics,
        insights: results.insights,
        tier: userTier,
        aiAnalysisUsed: hasAIAccess,
      });

      console.log(`✅ Updated backup tracking for user ${userId}, backup ID: ${backupRef.id}`);

      // Return the backup ID along with results
      return NextResponse.json({
        success: true,
        data: {
          ...results,
          backupId: backupRef.id,
        }
      });
    } catch (dbError) {
      console.error('⚠️ Failed to update backup tracking in Firestore:', dbError);
      // Don't fail the request if Firestore update fails - still return results
      return NextResponse.json({
        success: true,
        data: results
      });
    }

  } catch (error: any) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to analyze file. Please ensure you uploaded a valid LinkedIn data export."
      },
      { status: 500 }
    );
  }
}
