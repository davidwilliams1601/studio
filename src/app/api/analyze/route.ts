import { NextRequest, NextResponse } from "next/server";
import { processLinkedInZip } from "@/lib/linkedin-processor";

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

    // Convert file to ArrayBuffer for processing
    const arrayBuffer = await file.arrayBuffer();

    // Process the LinkedIn ZIP file
    console.log(`Processing LinkedIn data for user ${userId}: ${file.name}`);
    const results = await processLinkedInZip(arrayBuffer, {
      includeConnectionsList: false, // Don't include full list for privacy
    });

    console.log(`Analysis complete: ${results.stats.connections} connections found`);

    return NextResponse.json({
      success: true,
      data: results
    });

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
