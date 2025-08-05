'use server';

import { NextRequest, NextResponse } from 'next/server';
import { getStorage } from '@/lib/firebase-admin';
import JSZip from 'jszip';


function parseCsv(csv: string): string[][] {
  if (!csv) return [];
  const lines = csv.split(/\r\n|\n/);
  return lines.map((line) => line.split(','));
}

export async function POST(req: NextRequest) {
  console.log('API /analyze called');
  
  try {
    // Parse the request body
    let body;
    try {
      body = await req.json();
      console.log('Request body:', body);
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const { storagePath } = body;

    if (!storagePath) {
      console.error('Missing storagePath in request');
      return NextResponse.json({ error: 'storagePath is required' }, { status: 400 });
    }

    console.log('Processing file at path:', storagePath);

    // Initialize Firebase Admin
    let bucket;
    try {
      const storage = await getStorage();
      bucket = storage.bucket();
      console.log('Firebase storage bucket initialized');
    } catch (firebaseError) {
      console.error('Firebase initialization error:', firebaseError);
      return NextResponse.json({ error: 'Failed to initialize Firebase storage' }, { status: 500 });
    }

    // Download the file
    let buffer;
    try {
      const file = bucket.file(storagePath);
      console.log('Attempting to download file...');
      const [downloadedBuffer] = await file.download();
      buffer = downloadedBuffer;
      console.log('File downloaded, size:', buffer.length, 'bytes');
    } catch (downloadError) {
      console.error('Failed to download file:', downloadError);
      return NextResponse.json({ error: 'Failed to download file from storage' }, { status: 500 });
    }

    // Load and parse ZIP
    let zip;
    try {
      zip = await JSZip.loadAsync(buffer);
      console.log('ZIP file loaded successfully');
      
      // Log all files in the ZIP for debugging
      const fileNames = Object.keys(zip.files);
      console.log('Files in ZIP:', fileNames);
    } catch (zipError) {
      console.error('Failed to load ZIP file:', zipError);
      return NextResponse.json({ error: 'Failed to parse ZIP file' }, { status: 500 });
    }

    // Look for connections file with multiple possible names
    const connectionFiles = [
      'Connections.csv',
      'connections.csv', 
      'My Network/Connections.csv',
      'My Network/connections.csv'
    ];
    
    let connectionsContent = '';
    let connectionsFound = false;
    
    for (const fileName of connectionFiles) {
      const connectionsFile = zip.file(fileName);
      if (connectionsFile) {
        console.log('Found connections file:', fileName);
        connectionsContent = await connectionsFile.async('string');
        connectionsFound = true;
        break;
      }
    }
    
    if (!connectionsFound) {
      console.log('No connections file found, checking case-insensitive...');
      // Try case-insensitive search
      for (const [fileName, file] of Object.entries(zip.files)) {
        if (fileName.toLowerCase().includes('connection') && fileName.toLowerCase().endsWith('.csv')) {
          console.log('Found connections file (case-insensitive):', fileName);
          connectionsContent = await file.async('string');
          connectionsFound = true;
          break;
        }
      }
    }
    
    const connectionsData = parseCsv(connectionsContent);
    const connectionCount = connectionsData.length > 0 ? Math.max(0, connectionsData.length - 1) : 0;
    console.log('Connections count:', connectionCount);

    // Look for messages files
    const messageFiles = [
      'messages.csv',
      'Messages.csv',
      'Messages/messages.csv',
      'Messaging/messages.csv'
    ];
    
    let messagesContent = '';
    let messageCount = 0;
    let messagesFound = false;
    
    for (const fileName of messageFiles) {
      const messagesFile = zip.file(fileName);
      if (messagesFile) {
        console.log('Found messages file:', fileName);
        messagesContent = await messagesFile.async('string');
        messagesFound = true;
        break;
      }
    }
    
    if (messagesContent) {
      const messagesData = parseCsv(messagesContent);
      messageCount = messagesData.length > 0 ? Math.max(0, messagesData.length - 1) : 0;
    } else {
      // Count CSV files in messages folder
      console.log('Looking for message folders...');
      const messagesFolders = zip.folder('messages') || zip.folder('Messages');
      if (messagesFolders) {
        messagesFolders.forEach((relativePath, file) => {
          if (file.name.endsWith('.csv') && !file.dir) {
            messageCount++;
            console.log('Found message file:', file.name);
          }
        });
      }
      
      // Also try case-insensitive search for message files
      if (messageCount === 0) {
        for (const [fileName, file] of Object.entries(zip.files)) {
          if (fileName.toLowerCase().includes('message') && fileName.toLowerCase().endsWith('.csv')) {
            messageCount++;
            console.log('Found message file (case-insensitive):', fileName);
          }
        }
      }
    }
    
    console.log('Messages count:', messageCount);

    // Look for articles/posts files
    const articleFiles = [
      'articles.csv',
      'Articles.csv',
      'Posts.csv',
      'posts.csv',
      'Share Updates/Posts.csv',
      'Share Updates/posts.csv'
    ];
    
    let articlesContent = '';
    let articlesFound = false;
    
    for (const fileName of articleFiles) {
      const articlesFile = zip.file(fileName);
      if (articlesFile) {
        console.log('Found articles file:', fileName);
        articlesContent = await articlesFile.async('string');
        articlesFound = true;
        break;
      }
    }
    
    if (!articlesFound) {
      console.log('No articles file found, checking case-insensitive...');
      // Try case-insensitive search
      for (const [fileName, file] of Object.entries(zip.files)) {
        if ((fileName.toLowerCase().includes('article') || fileName.toLowerCase().includes('post')) && fileName.toLowerCase().endsWith('.csv')) {
          console.log('Found articles file (case-insensitive):', fileName);
          articlesContent = await file.async('string');
          articlesFound = true;
          break;
        }
      }
    }
    
    const articlesData = parseCsv(articlesContent);
    const articleCount = articlesData.length > 0 ? Math.max(0, articlesData.length - 1) : 0;
    console.log('Articles count:', articleCount);

    // Optionally save processed data
    let processedPath = '';
    try {
      const profileFiles = Object.values(zip.files).filter(file => file.name.toLowerCase().endsWith('profile.json'));
      let profileContent = 'File not found or empty.';
      if (profileFiles.length > 0) {
        profileContent = await profileFiles[0].async('string');
      }

      const combinedData = `
--- CONNECTIONS ---
${connectionsContent}

--- MESSAGES ---
${messagesContent}

--- ARTICLES ---
${articlesContent}

--- PROFILE ---
${profileContent}
`;

      processedPath = `processed/${storagePath.split('/').pop()}-extracted.txt`;
      const processedFile = bucket.file(processedPath);
      await processedFile.save(Buffer.from(combinedData), {
        contentType: 'text/plain',
      });
      console.log('Processed data saved to:', processedPath);
    } catch (saveError) {
      console.error('Failed to save processed data:', saveError);
      // Don't fail the entire request if saving fails
      processedPath = 'Failed to save processed data';
    }

    // Prepare the response data
    const responseData = {
      processedPath,
      connectionCount,
      messageCount,
      articleCount,
    };
    
    console.log('Sending response data:', responseData);

    // Return the data in the expected format
    return NextResponse.json({
      data: responseData,
    });
    
  } catch (e: any) {
    console.error('Unexpected error in API handler:', e);
    console.error('Error stack:', e.stack);
    
    return NextResponse.json(
      { error: e.message || 'An unexpected error occurred during analysis.' },
      { status: 500 }
    );
  }
}
