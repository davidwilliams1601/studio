/**
 * File Upload Utilities for Firebase Storage
 */

import { ref, uploadBytesResumable, getDownloadURL, UploadTaskSnapshot } from 'firebase/storage';
import { storage } from '@/lib/firebase';

export interface UploadProgress {
  progress: number; // 0-100
  bytesTransferred: number;
  totalBytes: number;
  state: 'running' | 'paused' | 'success' | 'error';
}

export interface UploadResult {
  downloadURL: string;
  path: string;
  fileName: string;
}

/**
 * Upload a file to Firebase Storage with progress tracking
 */
export async function uploadFile(
  file: File,
  userId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  // Create a unique file path
  const timestamp = Date.now();
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `users/${userId}/uploads/${timestamp}_${sanitizedFileName}`;

  // Create storage reference
  const storageRef = ref(storage, filePath);

  // Upload file with resumable upload
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot: UploadTaskSnapshot) => {
        // Calculate progress
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

        if (onProgress) {
          onProgress({
            progress,
            bytesTransferred: snapshot.bytesTransferred,
            totalBytes: snapshot.totalBytes,
            state: snapshot.state === 'running' ? 'running' : snapshot.state === 'paused' ? 'paused' : 'running',
          });
        }
      },
      (error) => {
        // Handle errors
        console.error('Upload error:', error);
        if (onProgress) {
          onProgress({
            progress: 0,
            bytesTransferred: 0,
            totalBytes: file.size,
            state: 'error',
          });
        }
        reject(error);
      },
      async () => {
        // Upload completed successfully
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          if (onProgress) {
            onProgress({
              progress: 100,
              bytesTransferred: file.size,
              totalBytes: file.size,
              state: 'success',
            });
          }

          resolve({
            downloadURL,
            path: filePath,
            fileName: file.name,
          });
        } catch (error) {
          reject(error);
        }
      }
    );
  });
}

/**
 * Validate file before upload
 */
export function validateLinkedInFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!file.name.toLowerCase().endsWith('.zip')) {
    return {
      valid: false,
      error: 'Please upload a ZIP file containing your LinkedIn data export',
    };
  }

  // Check file size (max 100MB for LinkedIn exports)
  const maxSize = 100 * 1024 * 1024; // 100MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size exceeds 100MB limit. Please contact support for large exports.',
    };
  }

  // Check minimum size (LinkedIn exports are usually at least 1KB)
  if (file.size < 1024) {
    return {
      valid: false,
      error: 'File appears to be too small. Please ensure you uploaded the correct LinkedIn export ZIP file.',
    };
  }

  return { valid: true };
}

/**
 * Format bytes to human-readable size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
